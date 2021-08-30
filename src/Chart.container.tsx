import React, { useEffect } from 'react';
import styled from 'styled-components';
import Datafeed from './Chart.datafeed';

const WrappedContainer = styled.div`
  height: 100vh;
  iframe {
    height: inherit !important;
  }
`;

const ChartContainer: React.FC<{}> = (props) => {
  useEffect(() => {
    if (window.TradingView) {
      // window.tvWidget is required by TV framework
      window.tvWidget = new window.TradingView.widget({
        symbol: 'cryETHUSD', // default symbol
        interval: '5', // default interval
        fullscreen: true, // displays the chart in the fullscreen mode
        container: 'chart_container',
        datafeed: Datafeed,
        library_path: `${process.env.PUBLIC_URL}/charting_library/`,
        autosize: true,
        disabled_features: ['header_compare', 'create_volume_indicator_by_default'],
        theme: 'Dark',
        custom_css_url: `${process.env.PUBLIC_URL}/charting_library.css`,
        studies_access: {
          type: 'black',
          tools: [{
            name: 'Accumulation/Distribution'
          }, {
            name: 'Chaikin Oscillator'
          }, {
            name: 'Chaikin Volatility'
          }, {
            name: 'Correlation - Log'
          }, {
            name: 'Correlation Coefficient'
          }, {
            name: 'Ease Of Movement'
          }, {
            name: 'Elder\'s Force Index'
          }, {
            name: 'Envelopes'
          }, {
            name: 'Klinger Oscillator'
          }, {
            name: 'Money Flow Index'
          }, {
            name: 'Net Volume'
          }, {
            name: 'On Balance Volume'
          }, {
            name: 'Price Volume Trend'
          }, {
            name: 'Ratio'
          }, {
            name: 'Spread'
          }, {
            name: 'Volume'
          }, {
            name: 'Volume Oscillator'
          }, {
            name: 'VWAp'
          }, {
            name: 'VWMA'
          }, {
            name: 'Zig Zag'
          }],
        }
      });
    }
  }, []);
  return <WrappedContainer id="chart_container" />;
};

export default ChartContainer;
