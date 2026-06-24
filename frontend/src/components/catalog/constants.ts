import {
  MessagesSquare,
  Bot,
  Layers,
  BookOpen,
  Database,
  Globe,
  Image as ImageIcon,
  Mic,
  Captions,
  Workflow,
  Users,
  FileText,
  Megaphone,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/** Ícone por categoria (usado no card, detail e placeholder de mídia). */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  chat: MessagesSquare,
  assistant: Bot,
  platform: Layers,
  notebooks: BookOpen,
  data: Database,
  scraping: Globe,
  image: ImageIcon,
  voice: Mic,
  transcription: Captions,
  automation: Workflow,
  crm: Users,
  docs: FileText,
  consultores: Megaphone,
};

/** Classes Tailwind (fundo/texto/borda) por categoria, para badges e ícones. */
export const CATEGORY_COLORS: Record<string, string> = {
  chat: "bg-violet-50 text-violet-700 border-violet-200",
  assistant: "bg-purple-50 text-purple-700 border-purple-200",
  platform: "bg-blue-50 text-blue-700 border-blue-200",
  notebooks: "bg-amber-50 text-amber-700 border-amber-200",
  data: "bg-emerald-50 text-emerald-700 border-emerald-200",
  scraping: "bg-teal-50 text-teal-700 border-teal-200",
  image: "bg-pink-50 text-pink-700 border-pink-200",
  voice: "bg-indigo-50 text-indigo-700 border-indigo-200",
  transcription: "bg-cyan-50 text-cyan-700 border-cyan-200",
  automation: "bg-orange-50 text-orange-700 border-orange-200",
  crm: "bg-rose-50 text-rose-700 border-rose-200",
  docs: "bg-sky-50 text-sky-700 border-sky-200",
  consultores: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
};

export const FALLBACK_ICON: LucideIcon = Wrench;

export function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category] ?? FALLBACK_ICON;
}

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "";
}

/** Gradiente suave para o placeholder de mídia, variando por categoria. */
export const CATEGORY_GRADIENTS: Record<string, string> = {
  chat: "from-violet-100 to-violet-50",
  assistant: "from-purple-100 to-purple-50",
  platform: "from-blue-100 to-blue-50",
  notebooks: "from-amber-100 to-amber-50",
  data: "from-emerald-100 to-emerald-50",
  scraping: "from-teal-100 to-teal-50",
  image: "from-pink-100 to-pink-50",
  voice: "from-indigo-100 to-indigo-50",
  transcription: "from-cyan-100 to-cyan-50",
  automation: "from-orange-100 to-orange-50",
  crm: "from-rose-100 to-rose-50",
  docs: "from-sky-100 to-sky-50",
  consultores: "from-fuchsia-100 to-fuchsia-50",
};

export function getCategoryGradient(category: string): string {
  return CATEGORY_GRADIENTS[category] ?? "from-zinc-100 to-zinc-50";
}

export const PROVIDER_LABELS: Record<string, string> = {
  openai: "OpenAI",
  gemini: "Gemini",
  anthropic: "Anthropic",
  ollama: "Ollama (Local)",
  openrouter: "OpenRouter",
};
