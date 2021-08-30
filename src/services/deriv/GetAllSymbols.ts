import { IOnMessage } from "./Deriv";
import waitForReadyConnection from "./WaitForConnection";

const getAllSymbols = () =>
  waitForReadyConnection().then((wsp) =>
    wsp
      ?.sendRequest({
        active_symbols: "brief",
      })
      .then((message: IOnMessage) => {
        if (message.error) {
          throw new Error(message?.error?.message);
        } else {
          return (
            message.active_symbols?.map((m) => ({
              symbol: m.symbol,
              fullName: m.display_name,
              description: "",
              exchange: "",
              type: m.market_display_name,
              pip: m.pip,
            })) || []
          );
        }
      })
  );

export default getAllSymbols;
