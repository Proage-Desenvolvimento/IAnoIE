export const API_URL = import.meta.env.VITE_API_URL || "";
// Derive ws/wss from the page protocol: on https://, a ws:// socket is mixed content
// and the browser blocks it (silently breaking the LogViewer). Default to wss on TLS.
const _wsScheme =
  typeof window !== "undefined" && window.location.protocol === "https:" ? "wss" : "ws";
export const WS_URL = import.meta.env.VITE_WS_URL || `${_wsScheme}://${window.location.host}`;

export const APP_CATEGORIES = [
  { value: "vendas", label: "AIMization Vendas" },
  { value: "estudio", label: "AIMization Estúdio" },
  { value: "inteligencia", label: "AIMization Inteligência" },
  { value: "produtividade", label: "AIMization Produtividade" },
  { value: "consultores", label: "AIMization Consultores" },
] as const;

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  installing: "bg-blue-100 text-blue-800",
  running: "bg-green-100 text-green-800",
  stopped: "bg-gray-100 text-gray-800",
  error: "bg-red-100 text-red-800",
  uninstalling: "bg-orange-100 text-orange-800",
};
