import { getSubscription } from "./ConnectionInit";
import { TOpenRequest } from "./Deriv";

const subscribeToWSOpen = (callback?: TOpenRequest) => {
  getSubscription().set("ON_OPEN", {
    originalRequest: callback,
  });
};

export default subscribeToWSOpen;
