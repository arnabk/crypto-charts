import { IOnMessage } from "./Deriv";
import waitForReadyConnection from "./WaitForConnection";

const getServerTime = () =>
  waitForReadyConnection().then((wsp) =>
    wsp
      ?.sendRequest({
        time: 1,
      })
      .then((message: IOnMessage) => {
        if (message.error) {
          throw new Error(message?.error?.message);
        } else {
          return message.time;
        }
      })
  );

export default getServerTime;
