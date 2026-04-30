import { api } from "./client";
import type { User } from "@/lib/types";

export async function login(email: string, password: string) {
  return api.post("api/v1/auth/login", { json: { email, password } }).json<{ access_token: string }>();
}

export async function register(email: string, password: string) {
  return api.post("api/v1/auth/register", { json: { email, password } }).json<{ access_token: string }>();
}

export async function getMe() {
  return api.get("api/v1/auth/me").json<User>();
}
