/**
 * Catálogo de mensagens bilíngue (pt-br / en) — escopado à página /catalog.
 *
 * O resto da aplicação permanece em inglês; apenas o catálogo é localizado.
 * Adicione novas strings em ambos os idiomas para manter a paridade.
 */

export type Lang = "pt-br" | "en";

export const LANGS: Lang[] = ["pt-br", "en"];

export const LANG_LABELS: Record<Lang, string> = {
  "pt-br": "PT",
  en: "EN",
};

type Dict = Record<string, string>;

const ptBR: Dict = {
  // Cabeçalho da página
  "catalog.title": "Catálogo de Aplicações",
  "catalog.subtitle": "Explore e instale aplicações de IA com um clique — sem precisar entender de Docker, CUDA ou Linux.",

  // Busca e filtros
  "catalog.searchPlaceholder": "Buscar aplicações...",
  "catalog.all": "Todas",
  "catalog.noResults": "Nenhuma aplicação encontrada",
  "catalog.noResultsHint": "Tente ajustar a busca ou os filtros",

  // Categorias
  "cat.llm": "LLM & Chat",
  "cat.inference": "Inferência",
  "cat.notebook": "Notebooks",
  "cat.imaging": "Geração de Imagem",
  "cat.data": "Dados & Analytics",
  "cat.automation": "Automação",
  "cat.productivity": "Produtividade",

  // Card
  "card.learnMore": "Saiba mais",
  "card.install": "Instalar",
  "card.installed": "Instalado",
  "card.manage": "Gerenciar",
  "card.gpu": "GPU",
  "card.keyBenefits": "Principais benefícios",

  // Seções do detalhe
  "detail.benefits": "Benefícios",
  "detail.useCases": "Casos de uso",
  "detail.requirements": "Requisitos",
  "detail.installTitle": "Instalar aplicação",
  "detail.noUseCases": "",

  // Mídia
  "media.watchDemo": "Assistir demonstração",
  "media.imageSoon": "Imagem em breve",
  "media.videoSoon": "Vídeo em breve",

  // Requisitos
  "req.gpuRequired": "Exige GPU",
  "req.gpuOptional": "GPU opcional",
  "req.noGpu": "Não exige GPU",

  // Instalação — atribuição de GPU
  "install.gpuAssignment": "Atribuição de GPU",
  "install.gpuRequiredHint": "Esta aplicação exige uma GPU",
  "install.gpuSelectHint": "Selecione uma ou mais GPUs para esta aplicação",
  "install.gpuLabel": "GPU {index}",
  "install.gpuUtil": "{pct}% uso",
  "install.gpuMissing": "⚠️ Esta aplicação exige uma GPU, mas nenhuma foi detectada",
  "install.gpuNone": "Nenhuma GPU detectada — a aplicação rodará em modo CPU",

  // Instalação — provedor de IA
  "install.llmTitle": "Provedor de IA",
  "install.llmHint": "Conecte esta aplicação a um provedor de modelo de IA",
  "install.llmNone": "Sem provedor de IA",
  "install.llmModel": "Modelo",
  "install.llmNoModels": "Nenhum modelo carregado — teste a conexão do provedor primeiro",
  "install.llmSupportsTitle": "Esta aplicação suporta provedores de IA",
  "install.llmSupportsHint": "Configure um provedor compatível na página de Provedores de IA primeiro. Suportados:",
  "install.llmModelSupported": "Suportados",

  // Instalação — configuração
  "install.configTitle": "Configuração",

  // Progresso
  "progress.installing": "Instalando...",
  "progress.done": "Instalado com sucesso",
  "progress.failed": "Falha na instalação",
  "progress.preparing": "Preparando...",
  "progress.ready": "Pronto para uso",
  "progress.viewLogs": "Ver logs",
  "progress.hideLogs": "Ocultar logs",

  // Botões do dialog
  "btn.cancel": "Cancelar",
  "btn.close": "Fechar",
  "btn.hide": "Ocultar",
  "btn.installNow": "Instalar agora",
  "btn.installing": "Instalando...",
};

const en: Dict = {
  "catalog.title": "App Catalog",
  "catalog.subtitle": "Browse and install AI applications with one click — no need to understand Docker, CUDA or Linux.",

  "catalog.searchPlaceholder": "Search applications...",
  "catalog.all": "All",
  "catalog.noResults": "No apps found",
  "catalog.noResultsHint": "Try adjusting your search or filters",

  "cat.llm": "LLM & Chat",
  "cat.inference": "Inference",
  "cat.notebook": "Notebooks",
  "cat.imaging": "Image Generation",
  "cat.data": "Data & Analytics",
  "cat.automation": "Automation",
  "cat.productivity": "Productivity",

  "card.learnMore": "Learn more",
  "card.install": "Install",
  "card.installed": "Installed",
  "card.manage": "Manage",
  "card.gpu": "GPU",
  "card.keyBenefits": "Key benefits",

  "detail.benefits": "Benefits",
  "detail.useCases": "Use cases",
  "detail.requirements": "Requirements",
  "detail.installTitle": "Install application",
  "detail.noUseCases": "",

  "media.watchDemo": "Watch demo",
  "media.imageSoon": "Image coming soon",
  "media.videoSoon": "Video coming soon",

  "req.gpuRequired": "Requires GPU",
  "req.gpuOptional": "GPU optional",
  "req.noGpu": "No GPU required",

  "install.gpuAssignment": "GPU Assignment",
  "install.gpuRequiredHint": "This app requires a GPU",
  "install.gpuSelectHint": "Select one or more GPUs for this application",
  "install.gpuLabel": "GPU {index}",
  "install.gpuUtil": "{pct}% util",
  "install.gpuMissing": "⚠️ This app requires a GPU but none was detected",
  "install.gpuNone": "No GPUs detected — app will run in CPU mode",

  "install.llmTitle": "AI Model Provider",
  "install.llmHint": "Connect this app to an AI model provider",
  "install.llmNone": "No LLM provider",
  "install.llmModel": "Model",
  "install.llmNoModels": "No models loaded — test the provider connection first",
  "install.llmSupportsTitle": "This app supports AI providers",
  "install.llmSupportsHint": "Configure a compatible provider in the LLM Providers page first. Supported:",
  "install.llmModelSupported": "Supported",

  "install.configTitle": "Configuration",

  "progress.installing": "Installing...",
  "progress.done": "Installed successfully",
  "progress.failed": "Installation failed",
  "progress.preparing": "Preparing...",
  "progress.ready": "Ready to use",
  "progress.viewLogs": "View logs",
  "progress.hideLogs": "Hide logs",

  "btn.cancel": "Cancel",
  "btn.close": "Close",
  "btn.hide": "Hide",
  "btn.installNow": "Install now",
  "btn.installing": "Installing...",
};

export const MESSAGES: Record<Lang, Dict> = { "pt-br": ptBR, en };
