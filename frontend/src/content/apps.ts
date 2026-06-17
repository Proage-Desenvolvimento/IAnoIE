/**
 * Conteúdo de marketing do catálogo, indexado por slug.
 *
 - `hero`  → caminho da imagem em /public (ex.: "/images/apps/open-webui.png").
 *          Deixe `undefined` para mostrar o placeholder até adicionar o arquivo.
 - `video` → URL do YouTube. Deixe `undefined` para o placeholder de vídeo.
 *
 * O texto (tagline/description/benefits/useCases) é a parte central da entrega:
 * copy focada em gestor, em pt-br e en. Para editar, basta mudar este arquivo.
 */

export interface LocalizedAppContent {
  /** Frase de 1 linha, sem jargão, para o card. */
  tagline: string;
  /** Parágrafo curto de apresentação. */
  description: string;
  /** 3–5 tópicos de benefício de negócio (o foco do pedido). */
  benefits: string[];
  /** Exemplos práticos de uso (opcional). */
  useCases?: string[];
}

export interface AppContent {
  hero?: string;
  video?: string;
  "pt-br": LocalizedAppContent;
  en: LocalizedAppContent;
}

export const APP_CONTENT: Record<string, AppContent> = {
  "open-webui": {
    "pt-br": {
      tagline: "Chat no estilo ChatGPT rodando na sua própria infraestrutura.",
      description:
        "Interface completa de conversa com IA, com suporte a múltiplos modelos, busca em documentos (RAG) e total controle dos dados. Conecte provedores como OpenAI e Anthropic ou rode modelos locais.",
      benefits: [
        "Dados 100% sob controle: as conversas nunca saem da sua rede",
        "Reduz custo rodando modelos locais em vez de pagar por token em APIs externas",
        "Vários modelos no mesmo lugar (OpenAI, Anthropic e locais via Ollama)",
        "Faça perguntas sobre seus próprios documentos (RAG)",
        "Implantação com 1 clique, sem equipe de DevOps",
      ],
      useCases: [
        "Atendimento e suporte interno com IA",
        "Assistente de pesquisa sobre documentos da empresa",
        "Chat privado para equipes",
      ],
    },
    en: {
      tagline: "A ChatGPT-style chat running on your own infrastructure.",
      description:
        "A complete AI chat interface with multi-model support, document search (RAG) and full data control. Connect providers like OpenAI and Anthropic, or run local models.",
      benefits: [
        "100% data control: conversations never leave your network",
        "Cuts costs by running local models instead of paying per-token on external APIs",
        "Several models in one place (OpenAI, Anthropic and local via Ollama)",
        "Ask questions about your own documents (RAG)",
        "One-click deployment, no DevOps team required",
      ],
      useCases: [
        "Internal AI support and helpdesk",
        "Research assistant over company documents",
        "Private team chat",
      ],
    },
  },

  jupyterlab: {
    "pt-br": {
      tagline: "Notebooks interativos para ciência de dados e ML, com GPU.",
      description:
        "O ambiente padrão da indústria para análise de dados, prototipação e treinamento de modelos de machine learning, com acesso direto à GPU da DGX Spark.",
      benefits: [
        "Padrão da indústria para análise de dados e prototipação de modelos",
        "Acesso direto à GPU para treinar e testar modelos mais rápido",
        "Colaboração e reprodutibilidade de experimentos",
        "Suporte a Python, R e dezenas de linguagens",
      ],
      useCases: [
        "Análise exploratória de dados",
        "Treinamento e avaliação de modelos",
        "Protótipos e provas de conceito de IA",
      ],
    },
    en: {
      tagline: "Interactive notebooks for data science and ML, with GPU.",
      description:
        "The industry-standard environment for data analysis, prototyping and training machine-learning models, with direct access to the DGX Spark GPU.",
      benefits: [
        "Industry standard for data analysis and model prototyping",
        "Direct GPU access to train and test models faster",
        "Collaboration and reproducible experiments",
        "Support for Python, R and dozens of languages",
      ],
      useCases: [
        "Exploratory data analysis",
        "Model training and evaluation",
        "AI proofs of concept and prototypes",
      ],
    },
  },

  comfyui: {
    "pt-br": {
      tagline: "Geração de imagens por IA com fluxo visual em nós.",
      description:
        "Interface poderosa baseada em Stable Diffusion para gerar imagens, arte e materiais visuais através de fluxos personalizáveis em nós. Roda na sua GPU — sem custo por imagem.",
      benefits: [
        "Crie imagens, arte e materiais visuais sem equipe de design",
        "Fluxos personalizáveis para marcas e estilos consistentes",
        "Roda na sua GPU — sem custo por imagem gerada",
        "Controle total sobre a privacidade das imagens",
      ],
      useCases: [
        "Banco de imagens para marketing",
        "Conceitos visuais e protótipos rápidos",
        "Geração de conteúdo em escala",
      ],
    },
    en: {
      tagline: "AI image generation with a visual node-based workflow.",
      description:
        "A powerful Stable Diffusion interface to generate images, art and visual assets through customizable node workflows. Runs on your GPU — no per-image cost.",
      benefits: [
        "Create images, art and visual assets without a design team",
        "Customizable workflows for consistent brand and style",
        "Runs on your GPU — no cost per generated image",
        "Full control over image privacy",
      ],
      useCases: [
        "Image library for marketing",
        "Fast visual concepts and prototypes",
        "Content generation at scale",
      ],
    },
  },

  n8n: {
    "pt-br": {
      tagline: "Automação de fluxos de trabalho com um editor visual.",
      description:
        "Plataforma de automação que conecta centenas de aplicativos — e-mail, CRM, bancos de dados e IA — através de um editor visual em nós, sem programar.",
      benefits: [
        "Automatize tarefas repetitivas sem programar",
        "Conecta centenas de apps (e-mail, CRM, bancos de dados, IA)",
        "Reduz erros manuais e tempo de operação",
        "Self-hosted: seus dados não passam por serviços terceiros",
      ],
      useCases: [
        "Integração entre sistemas sem código",
        "Automação de relatórios e notificações",
        "Pipelines com IA para processar dados",
      ],
    },
    en: {
      tagline: "Workflow automation with a visual editor.",
      description:
        "An automation platform that connects hundreds of apps — email, CRM, databases and AI — through a visual node-based editor, with no coding.",
      benefits: [
        "Automate repetitive tasks without coding",
        "Connects hundreds of apps (email, CRM, databases, AI)",
        "Reduces manual errors and operating time",
        "Self-hosted: your data never passes through third parties",
      ],
      useCases: [
        "No-code system integration",
        "Report and notification automation",
        "AI pipelines to process data",
      ],
    },
  },

  omnivoice: {
    "pt-br": {
      tagline: "Clonagem e design de voz (TTS) para 600+ idiomas.",
      description:
        "Síntese de voz zero-shot com clonagem de voz a partir de poucos segundos de áudio e criação de vozes inéditas, com cobertura de mais de 600 idiomas e sotaques.",
      benefits: [
        "Gera narrações e locuções em escala, sem estúdio",
        "Clona uma voz a partir de poucos segundos de áudio",
        "Cobertura de 600+ idiomas e sotaques",
        "Ideal para acessibilidade, dublagem e conteúdo multilíngue",
      ],
      useCases: [
        "Narração de vídeos e treinamentos",
        "Dublagem e versões multilíngues",
        "Voz para acessibilidade e audiobooks",
      ],
    },
    en: {
      tagline: "Voice cloning and design (TTS) for 600+ languages.",
      description:
        "Zero-shot speech synthesis with voice cloning from a few seconds of audio and creation of brand-new voices, covering more than 600 languages and accents.",
      benefits: [
        "Generates voiceovers and narration at scale, no studio",
        "Clones a voice from a few seconds of audio",
        "Coverage of 600+ languages and accents",
        "Ideal for accessibility, dubbing and multilingual content",
      ],
      useCases: [
        "Video and training narration",
        "Dubbing and multilingual versions",
        "Voice for accessibility and audiobooks",
      ],
    },
  },

  speakr: {
    "pt-br": {
      tagline: "Transcrição e anotações com IA, identificando quem fala.",
      description:
        "Transforme reuniões e áudios em texto pesquisável, com identificação automática dos participantes. Escolha o motor de transcrição na instalação ou depois: OpenAI, Mistral, VibeVoice ou seu próprio servidor Whisper/ASR.",
      benefits: [
        "Transforme reuniões e áudios em texto pesquisável",
        "Identifica automaticamente os participantes",
        "Escolha o motor de transcrição (OpenAI, Mistral, Whisper local...)",
        "Reduz o tempo de produção de atas e resumos",
      ],
      useCases: [
        "Atas e resumos automáticos de reuniões",
        "Transcrição de entrevistas e pesquisas",
        "Legendagem e indexação de áudio",
      ],
    },
    en: {
      tagline: "AI transcription and notes with speaker identification.",
      description:
        "Turn meetings and audio into searchable text, with automatic speaker identification. Choose the transcription engine at install or later: OpenAI, Mistral, VibeVoice, or your own Whisper/ASR server.",
      benefits: [
        "Turn meetings and audio into searchable text",
        "Automatically identifies speakers",
        "Choose the transcription engine (OpenAI, Mistral, local Whisper...)",
        "Cuts the time to produce minutes and summaries",
      ],
      useCases: [
        "Automatic meeting minutes and summaries",
        "Interview and research transcription",
        "Subtitling and audio indexing",
      ],
    },
  },

  "open-notebook": {
    "pt-br": {
      tagline: "Alternativa self-hosted ao NotebookLM.",
      description:
        "Pesquise, converse e crie podcasts a partir das suas próprias fontes. Pesquisa multimodal, chat com documentos, busca vetorial e podcasts multi-locutor. Compatível com 16+ provedores de IA e sem GPU obrigatória.",
      benefits: [
        "Centralize e converse com seus documentos, PDFs e dados",
        "Busca semântica (vector search) em todo o acervo",
        "Gera podcasts multi-locutor a partir das fontes",
        "Compatível com 16+ provedores de IA, sem GPU obrigatória",
      ],
      useCases: [
        "Pesquisa interna sobre bases de conhecimento",
        "Resumos e podcasts a partir de relatórios",
        "Onboarding e estudo guiado por documentos",
      ],
    },
    en: {
      tagline: "A self-hosted alternative to NotebookLM.",
      description:
        "Research, chat and create podcasts from your own sources. Multimodal research, document chat, vector search and multi-speaker podcasts. Compatible with 16+ AI providers and no GPU required.",
      benefits: [
        "Centralize and chat with your documents, PDFs and data",
        "Semantic (vector) search across your entire library",
        "Generates multi-speaker podcasts from sources",
        "Compatible with 16+ AI providers, no GPU required",
      ],
      useCases: [
        "Internal research over knowledge bases",
        "Summaries and podcasts from reports",
        "Onboarding and document-guided study",
      ],
    },
  },
};

/** Conteúdo rico de um app, ou undefined se não houver entrada para o slug. */
export function getAppContent(slug: string): AppContent | undefined {
  return APP_CONTENT[slug];
}
