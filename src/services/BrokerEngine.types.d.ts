export type TConnectionStatus = 'open' | 'close';

export interface IOHLCData {
  epoch: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface IHistoryData {
  symbol: string;
  timeFrame: number;
  data: IOHLCData[];
}

export interface IDataSubscriptionRequest {
  symbol: string;
  timeFrame: number;
  onCandle?: (candle: IOHLCData) => void;
  onReset?: () => void;
}

export interface IHistoricalDataRequest {
  symbol: string;
  timeFrame: number;
  // Unix time in seconds
  start: number;
  // Unix time in seconds
  end?: number;
}
