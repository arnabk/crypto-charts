import debounce from "lodash/debounce";
import logLevel from "loglevel";
import WebSocketAsPromised from "websocket-as-promised";
import { IDataSubscriptionRequest } from "../BrokerEngine.types";
import { IOnMessage, ISubscription, TOpenRequest } from "./Deriv";

let pingPongHandler: NodeJS.Timeout;
let wsp: WebSocketAsPromised | undefined = undefined;

const subscription: Map<string, ISubscription> = new Map();

const reconnect = debounce(() => {
  try {
    wsp?.close();
  } catch (e) {}
  // reconnect after 5 seconds
  logLevel.debug("Reconnecting after 5 seconds");
  init();
}, 5000);

const init = () => {
  if (process.env.REACT_APP_BROKER_URL) {
    wsp = new WebSocketAsPromised(process.env.REACT_APP_BROKER_URL, {
      packMessage: (data) => JSON.stringify(data),
      unpackMessage: (data) => JSON.parse(data as string),
      attachRequestId: (data, requestId) =>
        Object.assign(
          {
            passthrough: {
              ...data?.passthrough,
              id: requestId,
            },
          },
          data
        ), // attach requestId to message as `id` field
      extractRequestId: (data) => data && data?.passthrough?.id,
    });

    wsp
      .open()
      .then(() => {
        clearInterval(pingPongHandler);
        pingPongHandler = setInterval(
          () => wsp?.sendRequest({ ping: 1 }),
          60000
        );
        (subscription.get("ON_OPEN")?.originalRequest as TOpenRequest)?.();
      })
      .catch((e) => console.error(e));

    wsp.onError.addListener((err) => {
      // Called if at any point WebSocket API signals some kind of error.
      logLevel.debug("Connection error", err);
      reconnect();
    });

    wsp.onClose.addListener(() => {
      // Called when connection is closed (for whatever reason).
      logLevel.debug("Connection closed");
      reconnect();
    });

    wsp.onMessage.addListener((msgString: string) => {
      const message: IOnMessage = JSON.parse(msgString);
      switch (message.msg_type) {
        case "ohlc":
          const ohlc = {
            open: parseFloat(message?.ohlc?.open!),
            high: parseFloat(message?.ohlc?.high!),
            low: parseFloat(message?.ohlc?.low!),
            close: parseFloat(message?.ohlc?.close!),
            epoch: message?.ohlc?.open_time!,
          };
          const record = subscription.get(
            message.passthrough?.subscriptionId as string
          );
          if (record) {
            record.serverSubscriptionId = message?.subscription?.id;
            (record.originalRequest as IDataSubscriptionRequest)?.onCandle?.(
              ohlc
            );
          }
          break;
      }
    });

    // Called whenever there is a message from the server.
    // wsp.onMessage.addListener(onMessage);
  } else {
    logLevel.error("process.env.REACT_APP_BROKER_URL missing");
  }
};

init();

export const getSubscription = () => subscription;
export const getConnection = () => wsp;
