import logLevel from "loglevel";
import {
  IDataSubscriptionRequest,
  IHistoricalDataRequest,
} from "./BrokerEngine.types";
import * as derivBrokerInterface from "./deriv";

const dataResetCallbacks = new Map<string, () => void>();
derivBrokerInterface.subscribeToWSOpen(() => {
  logLevel.debug("WS reconnected");
  /*
    TODO:
    1. resubscribe to all events
      - realtime data events for now
    2. In Chart.datafeed subscribe method, call onResetCacheNeededCallback to care of scenarios where we might
    be disconnected for sometime and lost somd of the data
  /*/
  dataResetCallbacks.forEach((callback) => callback());
  // TODO: If the above reset call does not restart the data subscription, then implement something for
  // resubscribing real time data. The above call from tradingview might resubscribe to subscription?
});

export const getHistoricalData = async (request: IHistoricalDataRequest) => {
  const response = await derivBrokerInterface.getHistoricalData({
    start: request.start,
    symbol: request.symbol,
    timeFrame: request.timeFrame,
    end: request.end,
  });
  return response?.data?.map(({ open, high, low, close, epoch }) => ({
    time: epoch,
    open,
    high,
    low,
    close,
  }));
};

let cachedSymbols: ReturnType<
  typeof derivBrokerInterface.getAllSymbols
> | null = null;
export const getAllSymbols = async () => {
  if (!cachedSymbols) {
    cachedSymbols = derivBrokerInterface.getAllSymbols();
  }
  return cachedSymbols;
};

export const getSupportedResolutions = () =>
  derivBrokerInterface.getSupportedResolutions();

export const subscribeToOHLC = async (request: IDataSubscriptionRequest) => {
  // wrap request.onCandle so that we save the data locally in DB first
  const subscriptionId = await derivBrokerInterface.subscribeToOHLC(request);
  dataResetCallbacks.set(subscriptionId, request.onReset || (() => {}));
  return subscriptionId;
};

export const unsubscribeFromOHLC = async (subscriptionId: string) => {
  dataResetCallbacks.delete(subscriptionId);
  return derivBrokerInterface.unsubscribeFromOHLC(subscriptionId);
};

export const getServerTime = async () => derivBrokerInterface.getServerTime();
