export const API_URL = import.meta.env.VITE_API_URL || "";
// Derive ws/wss from the page protocol: on https://, a ws:// socket is mixed content
// and the browser blocks it (silently breaking the LogViewer). Default to wss on TLS.
const _wsScheme =
  typeof window !== "undefined" && window.location.protocol === "https:" ? "wss" : "ws";
export const WS_URL = import.meta.env.VITE_WS_URL || `${_wsScheme}://${window.location.host}`;

export const APP_CATEGORIES = [
  { value: "chat", label: "Aimization Chat" },
  { value: "assistant", label: "Aimization Assistant" },
  { value: "platform", label: "Aimization Platform" },
  { value: "notebooks", label: "Aimization Notebooks" },
  { value: "data", label: "Aimization Data" },
  { value: "scraping", label: "Aimization Scraping" },
  { value: "image", label: "Aimization Image" },
  { value: "voice", label: "Aimization Voice" },
  { value: "transcription", label: "Aimization Transcription" },
  { value: "automation", label: "Aimization Automation" },
  { value: "crm", label: "Aimization CRM" },
  { value: "docs", label: "Aimization Docs" },
] as const;

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  installing: "bg-blue-100 text-blue-800",
  running: "bg-green-100 text-green-800",
  stopped: "bg-gray-100 text-gray-800",
  error: "bg-red-100 text-red-800",
  uninstalling: "bg-orange-100 text-orange-800",
};
