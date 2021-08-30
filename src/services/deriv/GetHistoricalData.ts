import { IHistoricalDataRequest } from "../BrokerEngine.types";
import { IOnMessage } from "./Deriv";
import waitForReadyConnection from "./WaitForConnection";

const getHistoricalData = (request: IHistoricalDataRequest) =>
  waitForReadyConnection().then((wsp) =>
    wsp
      ?.sendRequest({
        ticks_history: request.symbol,
        end: request?.end || "latest",
        adjust_start_time: 1,
        granularity: request.timeFrame,
        count: parseInt(process.env.REACT_APP_BATCH_RETRIEVAL_COUNT || "5000"),
        start: request.start,
        style: "candles",
      })
      .then((message: IOnMessage) => {
        if (message?.error) {
          throw new Error(message.error?.message);
        } else {
          return {
            symbol: message.echo_req.ticks_history,
            timeFrame: message.echo_req.granularity,
            data: message.candles,
          };
        }
      })
  );

export default getHistoricalData;
