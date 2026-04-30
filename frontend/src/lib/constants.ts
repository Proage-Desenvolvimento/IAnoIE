export const API_URL = import.meta.env.VITE_API_URL || "";
export const WS_URL = import.meta.env.VITE_WS_URL || `ws://${window.location.host}`;

export const APP_CATEGORIES = [
  { value: "llm", label: "LLM & Chat" },
  { value: "inference", label: "Inference" },
  { value: "notebook", label: "Notebooks" },
  { value: "imaging", label: "Image Generation" },
  { value: "data", label: "Data & Analytics" },
  { value: "utility", label: "Utilities" },
] as const;

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  installing: "bg-blue-100 text-blue-800",
  running: "bg-green-100 text-green-800",
  stopped: "bg-gray-100 text-gray-800",
  error: "bg-red-100 text-red-800",
  uninstalling: "bg-orange-100 text-orange-800",
};
