import add from "date-fns/add";
import { v4 } from "uuid";
import { IDataSubscriptionRequest } from "../BrokerEngine.types";
import { getSubscription } from "./ConnectionInit";
import waitForReadyConnection from "./WaitForConnection";

export const subscribeToOHLC = (request: IDataSubscriptionRequest) => {
  const subscription = getSubscription();
  const id = v4();
  const count = 5;
  const start = Math.floor(
    add(Date.now(), {
      seconds: -request.timeFrame * count,
    }).getTime() / 1000
  );
  return waitForReadyConnection().then((wsp) => {
    wsp?.sendRequest({
      ticks_history: request.symbol,
      end: "latest",
      adjust_start_time: 1,
      granularity: request.timeFrame,
      count,
      start,
      style: "candles",
      subscribe: 1,
      passthrough: {
        subscriptionId: id,
      },
    });
    subscription?.set(id, {
      originalRequest: request,
    });
    return id;
  });
};

export const unsubscribeFromOHLC = (subscriptionId: string) => {
  const subscription = getSubscription();
  const serverSubscriptionId =
    subscription?.get(subscriptionId)?.serverSubscriptionId;
  if (serverSubscriptionId) {
    waitForReadyConnection().then((wsp) =>
      wsp?.sendRequest({
        forget: serverSubscriptionId,
      })
    );
  }
  subscription?.delete(subscriptionId);
};
