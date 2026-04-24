import { publicApiAxios } from "./apiAxios";
import { apiErrMessage } from "../store/utils/apiError";

export interface SignInCredentials {
  login: string;
  password: string;
}

export interface SignUpPayload {
  login: string;
  password: string;
  is_moderator?: boolean;
}

export async function signInRequest(credentials: SignInCredentials): Promise<void> {
  await publicApiAxios.post("/users/signin", credentials, {
    headers: { "Content-Type": "application/json" },
  });
}

export async function signUpRequest(payload: SignUpPayload): Promise<void> {
  await publicApiAxios.post("/users/signup", payload, {
    headers: { "Content-Type": "application/json" },
  });
}

export async function signOutRequest(): Promise<void> {
  try {
    await publicApiAxios.post("/users/signout");
  } catch (e) {
    localStorage.removeItem("token");
    throw new Error(apiErrMessage(e));
  }
  localStorage.removeItem("token");
}
