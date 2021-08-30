interface WidgetContructor {
  new (options?: {
    symbol: string;
    interval: string;
    fullscreen: boolean;
    container: string;
    datafeed: Object;
    library_path: string;
    autosize: boolean;
    disabled_features: string[];
    theme?: 'Light' | 'Dark';
    custom_css_url: string;
    studies_access: {
      type: 'black' | 'white';
      tools: {
        name: string;
      }[];
    };
  }) : WidgetContructor;
}

interface Window {
  TradingView?: {
    widget: WidgetContructor;
  };
  tvWidget?: object;
}

interface ISymbolInfo {
  ticker: string;
  name: string;
  description?: string;
  type: string;
  exchange?: string;
  supported_resolutions: string[];
  has_no_volume: boolean;
  has_weekly_and_monthly: boolean;
  timezone: string;
  minmov: number;
  has_intraday: boolean;
  session: string;
  pricescale: number;
}

interface IBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}
