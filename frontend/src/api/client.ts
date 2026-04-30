import ky from "ky";
import { API_URL } from "@/lib/constants";

function getToken(): string | null {
  return localStorage.getItem("ianoie_token");
}

export const api = ky.create({
  prefixUrl: API_URL || undefined,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = getToken();
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      (_request, _options, response) => {
        if (response.status === 401) {
          localStorage.removeItem("ianoie_token");
          window.location.href = "/login";
        }
      },
    ],
  },
});
