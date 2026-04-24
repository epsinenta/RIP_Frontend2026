import { Api } from "./Api";
import { attachAuthInterceptors, resolveBaseURL } from "../modules/apiAxios";

export const api = new Api({
  baseURL: resolveBaseURL(),
});

attachAuthInterceptors(api.instance);
