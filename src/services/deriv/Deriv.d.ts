import { IDataSubscriptionRequest, IOHLCData } from "../BrokerEngine.types";

export interface IOnMessage {
  msg_type: string;
  error?: {
    message?: string;
  };
  active_symbols?: {
    symbol: string;
    display_name: string;
    market_display_name: string;
    pip: number;
  }[];
  echo_req: {
    ticks_history: string;
    granularity: number;
  };
  candles?: IOHLCData[];
  ohlc?: {
    open: string;
    high: string;
    low: string;
    close: string;
    open_time: number;
  };
  time: number;
  passthrough?: Record<string, object | string>;
  subscription?: { id: string; };
}

export type TOpenRequest = () => void;

export interface ISubscription {
  serverSubscriptionId?: string | 'ON_OPEN';
  originalRequest?: IDataSubscriptionRequest | TOpenRequest;
}
