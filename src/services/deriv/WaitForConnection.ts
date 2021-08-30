import WebSocketAsPromised from "websocket-as-promised";
import { getConnection } from "./ConnectionInit";

const waitForReadyConnection = () =>
  new Promise<WebSocketAsPromised>((resolve) => {
    const wsp = getConnection();
    const check = () => {
      if (!wsp || wsp?.isClosed || wsp?.isClosing || wsp?.isOpening) {
        setTimeout(check, 100);
      } else {
        resolve(wsp);
      }
    };
    check();
  });

export default waitForReadyConnection;
