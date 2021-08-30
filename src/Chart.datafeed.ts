import { IOHLCData } from "@root/services/BrokerEngine.types";
import * as brokerEngineInterface from "@root/services/BrokerEngineInterface";
import logLevel from "loglevel";

const SYMBOL_TYPE = 'Cryptocurrencies';

const resolutionToSeconds = (resolution: string) =>
  resolution?.trim()?.toLowerCase() === "1d"
    ? 86400
    : parseInt(resolution) * 60;

// tradingview_charts to our subscription ID map.
// needed for unsubscribing later
const subscriberIdMap = new Map<string, string>();

const configuration = {
  onReady: (callback: (options: {}) => void) => {
    logLevel.debug("[onReady]: Method call");
    callback({
      supported_resolutions: brokerEngineInterface.getSupportedResolutions(),
      exchanges: [],
      // `symbolType` argument for the `searchSymbols` method, if a user selects this symbol type
      symbols_types: [SYMBOL_TYPE],
      supports_time: true,
    });
  },

  searchSymbols: (
    userInput: string,
    exchange: string,
    symbolType: string,
    onResultReadyCallback: (
      options: {
        symbol: string;
        full_name: string;
        description?: string;
        exchange?: string;
        ticker: string;
        type?: string;
      }[]
    ) => void
  ) => {
    brokerEngineInterface
      .getAllSymbols()
      .then((symbols) => {
        onResultReadyCallback(
          (symbols || [])
            .filter(f => f.type === SYMBOL_TYPE)
            // exchange filter
            .filter(
              (f) =>
                !exchange?.trim() ||
                f.exchange?.trim()?.toLowerCase() ===
                  exchange?.trim()?.toLowerCase()
            )
            // symbolType filter
            .filter(
              (f) =>
                !symbolType?.trim() ||
                symbolType?.trim()?.toLowerCase() ===
                  f?.type?.trim()?.toLowerCase()
            )
            .filter((f) =>
              f?.fullName?.toLowerCase()?.includes(userInput?.toLowerCase())
            )
            ?.map((m) => ({
              symbol: m.fullName,
              full_name: m.fullName,
              description: m.description,
              exchange: m.exchange,
              ticker: m.symbol,
              type: m.type,
            })) || []
        );
      })
      .catch((error) => logLevel.error("[onReady]: ", error));
  },

  resolveSymbol: async (
    symbolName: string,
    onSymbolResolvedCallback: (symbolInfo: ISymbolInfo) => void,
    onResolveErrorCallback: (error: Error) => void
  ) => {
    logLevel.debug("[resolveSymbol]: Method call", symbolName);
    try {
      const symbols = await brokerEngineInterface.getAllSymbols();
      const symbolItem = symbols?.find(({ symbol }) => symbol === symbolName);
      if (!symbolItem) {
        throw new Error("cannot resolve symbol");
      }
      const symbolInfo = {
        ticker: symbolItem.symbol,
        name: symbolItem.fullName,
        description: symbolItem.description,
        type: symbolItem.type,
        exchange: symbolItem.exchange,
        supported_resolutions:
          await brokerEngineInterface.getSupportedResolutions(),
        has_no_volume: true,
        has_weekly_and_monthly: false,
        timezone: "Etc/UTC",
        minmov: symbolItem.pip * 100.0,
        has_intraday: true,
        pricescale: Math.round(1.0 / symbolItem.pip),
        session: "24x7",
        // data_status: 'streaming',
      };

      logLevel.debug("[resolveSymbol]: Symbol resolved", symbolName);
      onSymbolResolvedCallback(symbolInfo);
    } catch (err) {
      logLevel.error(err);
      onResolveErrorCallback(err as Error);
    }
  },

  getBars: async (
    symbolInfo: ISymbolInfo,
    resolution: string,
    periodParams: {
      from: number; // in seconds
      to: number; // in seconds
      firstDataRequest: boolean;
    },
    onHistoryCallback: (bars: IBar[], options: { noData?: boolean }) => void,
    onErrorCallback: (error: Error) => void
  ) => {
    const { from, to } = periodParams;
    logLevel.debug("[getBars]: Method call", symbolInfo, resolution, from, to);

    try {
      // resolution in seconds - unix time
      const timeFrame = resolutionToSeconds(resolution);
      const historicalData = await brokerEngineInterface.getHistoricalData({
        start: from,
        symbol: symbolInfo.ticker,
        timeFrame,
      });

      // Filter historical data from start to end parameter
      const bars =
        historicalData
          ?.filter((bar) => bar.time >= from && bar.time < to)
          .map((bar) => ({
            time: bar.time * 1000,
            low: bar.low,
            high: bar.high,
            open: bar.open,
            close: bar.close,
          })) || [];
      logLevel.debug(`[getBars]: returned ${bars.length} bar(s)`);
      onHistoryCallback(bars, {
        noData: bars?.length === 0,
      });
    } catch (error) {
      logLevel.debug("[getBars]: Get error", error);
      onErrorCallback(error as Error);
    }
  },

  subscribeBars: async (
    symbolInfo: ISymbolInfo,
    resolution: string,
    onRealtimeCallback: (ohlc: IBar) => void,
    subscribeUID: string,
    onResetCacheNeededCallback: () => void
  ) => {
    logLevel.debug(
      "[subscribeBars]: Method call with subscribeUID:",
      subscribeUID
    );
    const id = await brokerEngineInterface.subscribeToOHLC({
      symbol: symbolInfo?.ticker,
      timeFrame: resolutionToSeconds(resolution),
      onCandle: (ohlc: IOHLCData) => {
        onRealtimeCallback?.({
          time: ohlc.epoch * 1000,
          open: ohlc.open,
          high: ohlc.high,
          low: ohlc.low,
          close: ohlc.close,
        });
      },
      onReset: onResetCacheNeededCallback,
    });
    subscriberIdMap.set(subscribeUID, id);
  },

  unsubscribeBars: (subscriberUID: string) => {
    logLevel.debug(
      "[unsubscribeBars]: Method call with subscriberUID:",
      subscriberUID
    );
    const ourId = subscriberIdMap.get(subscriberUID);
    if (ourId) {
      brokerEngineInterface.unsubscribeFromOHLC(ourId);
    }
  },

  getServerTime: (callback: (unixTime: number) => void) => {
    brokerEngineInterface.getServerTime().then((time) => callback(time!));
  },
};

export default configuration;
