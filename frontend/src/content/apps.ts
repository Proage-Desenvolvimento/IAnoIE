/**
 * Conteúdo de marketing do catálogo, indexado por slug.
 *
 - `hero`  → caminho da imagem em /public (ex.: "/images/apps/open-webui.png").
 *          Deixe `undefined` para mostrar o placeholder até adicionar o arquivo.
 - `video` → URL do YouTube. Deixe `undefined` para o placeholder de vídeo.
 - `repo_url` → URL do repositório upstream (GitHub). Omitir para não mostrar o link.
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
  /** URL do repositório upstream. Sem ele, nenhum link é renderizado. */
  repo_url?: string;
  "pt-br": LocalizedAppContent;
  en: LocalizedAppContent;
}

export const APP_CONTENT: Record<string, AppContent> = {
  "open-webui": {
    repo_url: "https://github.com/open-webui/open-webui",
    hero: "/images/apps/open-webui.png",
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
    repo_url: "https://github.com/jupyterlab/jupyterlab",
    hero: "/images/apps/jupyterlab.png",
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
    repo_url: "https://github.com/Comfy-Org/ComfyUI",
    hero: "/images/apps/comfyui.png",
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
    repo_url: "https://github.com/n8n-io/n8n",
    hero: "/images/apps/n8n.png",
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
    repo_url: "https://github.com/k2-fsa/OmniVoice",
    hero: "/images/apps/omnivoice.png",
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
    repo_url: "https://github.com/murtaza-nasir/speakr",
    hero: "/images/apps/speakr.png",
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

  voicebox: {
    repo_url: "https://github.com/jamiepine/voicebox",
    hero: "/images/apps/voicebox.png",
    "pt-br": {
      tagline: "Estúdio de voz com IA: clone vozes, gere fala e dite em qualquer app.",
      description:
        "Alternativa open-source ao ElevenLabs e ao WisprFlow em um só lugar. Clone vozes a partir de poucos segundos de áudio, gere narração em 23 idiomas com 7 motores de TTS, dite em qualquer campo de texto e dê voz a agentes de IA — tudo rodando localmente, com privacidade total.",
      benefits: [
        "Clona qualquer voz a partir de poucos segundos de áudio",
        "Gera fala em 23 idiomas com 7 motores de TTS (Qwen3, Chatterbox, Kokoro…)",
        "Ditado por atalho global direto em qualquer aplicativo",
        "Dá voz a agentes de IA via MCP (Claude Code, Cursor, Cline)",
        "100% local: vozes e dados nunca saem da sua máquina",
      ],
      useCases: [
        "Narração e dublagem de vídeos em vários idiomas",
        "Acessibilidade: voz para quem não pode falar",
        "Agentes e assistentes que respondem em voz clonada",
        "Podcasts e histórias com múltiplas vozes no editor Stories",
      ],
    },
    en: {
      tagline: "Open-source AI voice studio: clone voices, generate speech, dictate anywhere.",
      description:
        "An open-source alternative to ElevenLabs and WisprFlow in one app. Clone voices from a few seconds of audio, generate speech in 23 languages across 7 TTS engines, dictate into any text field, and give any MCP-aware AI agent a voice — all running locally, with complete privacy.",
      benefits: [
        "Clone any voice from a few seconds of audio",
        "Generate speech in 23 languages across 7 TTS engines (Qwen3, Chatterbox, Kokoro…)",
        "Global dictation hotkey straight into any application",
        "Give AI agents a voice via MCP (Claude Code, Cursor, Cline)",
        "100% local: voices and data never leave your machine",
      ],
      useCases: [
        "Voiceover and dubbing for videos across languages",
        "Accessibility: a voice for those who can't speak",
        "Agents and assistants that reply in a cloned voice",
        "Podcasts and stories with multiple voices in the Stories editor",
      ],
    },
  },

  "open-notebook": {
    repo_url: "https://github.com/lfnovo/open-notebook",
    hero: "/images/apps/open-notebook.png",
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

  scrapling: {
    repo_url: "https://github.com/D4Vinci/Scrapling",
    hero: "/images/apps/scrapling.png",
    "pt-br": {
      tagline: "Coleta de dados da web que dribla bloqueios — use no terminal ou deixe a IA usar.",
      description:
        "Framework de web scraping adaptativo: captura páginas, contorna defesas anti-bot como Cloudflare e extrai só o que importa. Use direto num terminal web no navegador, ou conecte o endpoint MCP ao Claude/Cursor para a IA coletar os dados para você. Tudo protegido por um token.",
      benefits: [
        "Extrai dados de sites que bloqueiam scrapers comuns (Cloudflare, anti-bot)",
        "Dois modos: terminal web no navegador e servidor MCP para Claude/Cursor/Claude Code",
        "Seletores inteligentes que se adaptam quando o site muda de layout",
        "A IA pré-filtra o conteúdo antes de processar — gasta menos tokens",
        "Protegido por usuário/token: só quem tem a chave usa",
      ],
      useCases: [
        "Coleta de preços e catálogos de concorrentes",
        "Alimentação de planilhas e bancos com dados de sites",
        "Extração de conteúdo para alimentar IA e relatórios",
      ],
    },
    en: {
      tagline: "Web data collection that bypasses blocks — use it from a terminal or let your AI use it.",
      description:
        "An adaptive web scraping framework: it fetches pages, beats anti-bot defenses like Cloudflare and extracts only what matters. Use it straight from a web terminal in your browser, or point its MCP endpoint at Claude/Cursor so the AI collects the data for you. All gated behind a token.",
      benefits: [
        "Extracts data from sites that block ordinary scrapers (Cloudflare, anti-bot)",
        "Two modes: a browser web terminal and an MCP server for Claude/Cursor/Claude Code",
        "Smart selectors that adapt when a site changes its layout",
        "The AI pre-filters content before processing — fewer tokens spent",
        "Protected by a username/token: only key holders can use it",
      ],
      useCases: [
        "Competitor price and catalog collection",
        "Feeding spreadsheets and databases with site data",
        "Content extraction to feed AI and reports",
      ],
    },
  },

  flowise: {
    repo_url: "https://github.com/FlowiseAI/Flowise",
    "pt-br": {
      tagline: "Monte apps de IA visualmente, arrastando e soltando.",
      description:
        "Construa chatbots, agentes e pipelines de RAG com LangChain e LlamaIndex usando um editor visual de nós. Exponha cada fluxo como API ou widget de chat, sem escrever código.",
      benefits: [
        "Crie agentes e assistentes sem programar, num editor visual",
        "Conecta OpenAI, Anthropic, Google, Ollama e dezenas de provedores",
        "Cada fluxo vira uma API ou widget de chat pronto para usar",
        "Single container, leve — não exige GPU nem DevOps",
      ],
      useCases: [
        "Chatbots de atendimento e suporte",
        "Assistentes com RAG sobre documentos",
        "Protótipos rápidos de agentes autônomos",
      ],
    },
    en: {
      tagline: "Build AI apps visually, by dragging and dropping.",
      description:
        "Build chatbots, agents and RAG pipelines with LangChain and LlamaIndex using a visual node editor. Expose each flow as an API or chat widget, with no code.",
      benefits: [
        "Build agents and assistants without coding, in a visual editor",
        "Connects OpenAI, Anthropic, Google, Ollama and dozens of providers",
        "Each flow becomes a ready-to-use API or chat widget",
        "Single container, lightweight — no GPU or DevOps required",
      ],
      useCases: [
        "Support and helpdesk chatbots",
        "RAG assistants over your documents",
        "Fast prototypes of autonomous agents",
      ],
    },
  },

  anythingllm: {
    repo_url: "https://github.com/Mintplex-Labs/anything-llm",
    "pt-br": {
      tagline: "Converse com seus documentos e monte agentes de IA.",
      description:
        "Aplicação completa de RAG: jogue PDFs, páginas web e repositórios, faça perguntas, crie agentes e compartilhe workspaces entre usuários. Já vem com banco e vetorizador embutidos e suporta 30+ provedores de IA.",
      benefits: [
        "Pergunte anything sobre seus documentos (PDFs, sites, GitHub)",
        "Workspaces separados e multi-usuário",
        "30+ provedores de LLM (OpenAI, Anthropic, Gemini, Ollama…)",
        "Sem banco externo nem GPU obrigatória",
      ],
      useCases: [
        "Base de conhecimento interna pesquisável",
        "Assistente de suporte sobre manuais e políticas",
        "Análise de contratos e relatórios",
      ],
    },
    en: {
      tagline: "Chat with your documents and build AI agents.",
      description:
        "A full-stack RAG app: drop in PDFs, web pages and repos, ask questions, build agents and share workspaces across users. Ships with a built-in database and vector store and supports 30+ AI providers.",
      benefits: [
        "Ask anything about your documents (PDFs, sites, GitHub)",
        "Separate workspaces and multi-user support",
        "30+ LLM providers (OpenAI, Anthropic, Gemini, Ollama…)",
        "No external database and no GPU required",
      ],
      useCases: [
        "Searchable internal knowledge base",
        "Support assistant over manuals and policies",
        "Contract and report analysis",
      ],
    },
  },

  metabase: {
    repo_url: "https://github.com/metabase/metabase",
    "pt-br": {
      tagline: "Business intelligence open-source, sem SQL.",
      description:
        "Faça perguntas em linguagem natural sobre seus bancos de dados, monte dashboards e compartilhe com a equipe. Conecta PostgreSQL, MySQL, Snowflake, BigQuery e dezenas de fontes.",
      benefits: [
        "Pergunte em linguagem natural, sem escrever SQL",
        "Dashboards interativos para compartilhar com a equipe",
        "Conecta dezenas de bancos (Postgres, MySQL, BigQuery…)",
        "Open-source e self-hosted: seus dados ficam com você",
      ],
      useCases: [
        "Painéis de vendas e operação",
        "Métricas de produto e retenção",
        "Relatórios para a diretoria",
      ],
    },
    en: {
      tagline: "Open-source business intelligence, no SQL needed.",
      description:
        "Ask questions in plain language over your databases, build dashboards and share them with the team. Connects PostgreSQL, MySQL, Snowflake, BigQuery and dozens of sources.",
      benefits: [
        "Ask in plain language, without writing SQL",
        "Interactive dashboards to share with the team",
        "Connects dozens of databases (Postgres, MySQL, BigQuery…)",
        "Open-source and self-hosted: your data stays with you",
      ],
      useCases: [
        "Sales and operations dashboards",
        "Product and retention metrics",
        "Executive reports",
      ],
    },
  },

  khoj: {
    repo_url: "https://github.com/khoj-ai/khoj",
    "pt-br": {
      tagline: "Segundo cérebro com IA para suas notas, docs e a web.",
      description:
        "Conecte suas notas, PDFs, GitHub e a web; converse, faça pesquisa profunda, execute código e receba respostas fundamentadas nos seus dados. Compatível com OpenAI, Anthropic, Gemini e qualquer endpoint OpenAI-compatible.",
      benefits: [
        "Converse com notas, documentos e repositórios",
        "Pesquisa profunda (deep research) com citações",
        "Suporta OpenAI, Anthropic, Gemini e Ollama",
        "Open-source e privado: seus dados sob controle",
      ],
      useCases: [
        "Assistente pessoal de pesquisa",
        "Resumos e respostas sobre acervo próprio",
        "Copilento para desenvolvedores sobre o código",
      ],
    },
    en: {
      tagline: "An AI second brain for your notes, docs and the web.",
      description:
        "Connect your notes, PDFs, GitHub and the web; chat, run deep research, execute code and get answers grounded in your own data. Supports OpenAI, Anthropic, Gemini and any OpenAI-compatible endpoint.",
      benefits: [
        "Chat with notes, documents and repositories",
        "Deep research with citations",
        "Supports OpenAI, Anthropic, Gemini and Ollama",
        "Open-source and private: your data under control",
      ],
      useCases: [
        "Personal research assistant",
        "Summaries and answers over your own library",
        "Developer copilot over your code",
      ],
    },
  },

  twenty: {
    repo_url: "https://github.com/twentyhq/twenty",
    "pt-br": {
      tagline: "CRM open-source — alternativa moderna a Salesforce e Hubspot.",
      description:
        "Gerencie contatos, empresas, negócios e objetos customizados com um modelo de dados flexível. Automatize fluxos e conecte e-mail e calendário. O primeiro cadastro vira dono do workspace.",
      benefits: [
        "Modelo de dados flexível e customizável",
        "Alternativa self-hosted a CRMs caros",
        "Automações e integração com e-mail e calendário",
        "Open-source: controle total dos dados de vendas",
      ],
      useCases: [
        "Funil de vendas e gestão de contatos",
        "Relacionamento com clientes (pós-venda)",
        "Pipeline customizado de oportunidades",
      ],
    },
    en: {
      tagline: "Open-source CRM — a modern alternative to Salesforce and Hubspot.",
      description:
        "Manage contacts, companies, deals and custom objects with a flexible data model. Automate workflows and connect your mailbox and calendar. The first signup becomes the workspace owner.",
      benefits: [
        "Flexible, customizable data model",
        "A self-hosted alternative to expensive CRMs",
        "Automations and email/calendar integration",
        "Open-source: full control over your sales data",
      ],
      useCases: [
        "Sales pipeline and contact management",
        "Customer relationships (post-sale)",
        "Custom opportunity pipeline",
      ],
    },
  },

  chatwoot: {
    repo_url: "https://github.com/chatwoot/chatwoot",
    "pt-br": {
      tagline: "Atendimento omnichannel open-source em uma só caixa.",
      description:
        "Una chat ao vivo, e-mail, WhatsApp, SMS e redes sociais em caixas de entrada compartilhadas. Crie chatbots, automatize campanhas e acompanhe conversas entre canais.",
      benefits: [
        "Uma caixa de entrada para chat, e-mail, WhatsApp e mais",
        "Caixas compartilhadas entre a equipe de suporte",
        "Chatbots e automações de campanhas",
        "Open-source e self-hosted",
      ],
      useCases: [
        "Suporte ao cliente multicanal",
        "Atendimento por WhatsApp em escala",
        "Helpdesk interno de TI",
      ],
    },
    en: {
      tagline: "Open-source omnichannel engagement in one inbox.",
      description:
        "Unify live chat, email, WhatsApp, SMS and social into shared team inboxes. Build chatbots, automate campaigns and track conversations across channels.",
      benefits: [
        "One inbox for chat, email, WhatsApp and more",
        "Shared inboxes across the support team",
        "Chatbots and campaign automations",
        "Open-source and self-hosted",
      ],
      useCases: [
        "Multichannel customer support",
        "WhatsApp support at scale",
        "Internal IT helpdesk",
      ],
    },
  },

  superset: {
    repo_url: "https://github.com/apache/superset",
    "pt-br": {
      tagline: "Plataforma moderna de exploração e visualização de dados.",
      description:
        "Conecte dezenas de bancos, escreva SQL, monte dashboards ricos e compartilhe com segurança por linha (row-level security). Apache Superset é BI enterprise-ready, open-source.",
      benefits: [
        "Dashboards e gráficos ricos sobre qualquer banco",
        "Editor SQL e exploração ad-hoc",
        "Segurança por linha e modelo de papéis",
        "Padrão Apache, enterprise-ready",
      ],
      useCases: [
        "Painéis executivos e operacionais",
        "Exploração de dados por analistas",
        "Métricas de produto em tempo real",
      ],
    },
    en: {
      tagline: "A modern data exploration and visualization platform.",
      description:
        "Connect dozens of databases, write SQL, build rich dashboards and share them securely with row-level security. Apache Superset is enterprise-ready, open-source BI.",
      benefits: [
        "Rich dashboards and charts over any database",
        "SQL editor and ad-hoc exploration",
        "Row-level security and a role model",
        "Apache-standard, enterprise-ready",
      ],
      useCases: [
        "Executive and operational dashboards",
        "Analyst data exploration",
        "Real-time product metrics",
      ],
    },
  },

  onyx: {
    repo_url: "https://github.com/onyx-dot-app/onyx",
    "pt-br": {
      tagline: "Assistente de IA empresarial conectado ao conhecimento da empresa.",
      description:
        "Conecte Google Drive, Slack, Notion, GitHub, Confluence e wikis, e converse com um assistente que fundamenta respostas nos seus dados, com citações, agentes e busca federada.",
      benefits: [
        "Respostas fundamentadas no conhecimento da empresa, com citações",
        "Conecta dezenas de fontes (Drive, Slack, Notion, GitHub…)",
        "Agentes e busca federada entre sistemas",
        "Open-source e self-hosted",
      ],
      useCases: [
        "Assistente interno de conhecimento",
        "Busca unificada entre sistemas da empresa",
        "Onboarding e respostas para o time",
      ],
    },
    en: {
      tagline: "Enterprise AI assistant connected to your company knowledge.",
      description:
        "Connect Google Drive, Slack, Notion, GitHub, Confluence and wikis, and chat with an assistant that grounds answers in your data, with citations, agents and federated search.",
      benefits: [
        "Answers grounded in company knowledge, with citations",
        "Connects dozens of sources (Drive, Slack, Notion, GitHub…)",
        "Agents and federated search across systems",
        "Open-source and self-hosted",
      ],
      useCases: [
        "Internal knowledge assistant",
        "Unified search across company systems",
        "Onboarding and team Q&A",
      ],
    },
  },

  appflowy: {
    repo_url: "https://github.com/AppFlowy-IO/AppFlowy",
    "pt-br": {
      tagline: "Alternativa open-source ao Notion, self-hosted.",
      description:
        "Rode o servidor de colaboração do AppFlowy na sua própria infraestrutura: workspaces, wikis, edição em tempo real e IA. O cliente AppFlowy (desktop/mobile) se conecta a este servidor.",
      benefits: [
        "Workspaces, wikis e colaboração em tempo real",
        "Self-hosted: suas notas e dados ficam com você",
        "Recursos de IA integrados",
        "Open-core, alternativa ao Notion",
      ],
      useCases: [
        "Wiki e base de conhecimento da equipe",
        "Gestão de projetos e notas compartilhadas",
        "Documentação interna colaborativa",
      ],
    },
    en: {
      tagline: "An open-source, self-hosted alternative to Notion.",
      description:
        "Run the AppFlowy collaboration server on your own infrastructure: workspaces, wikis, realtime editing and AI. The AppFlowy client (desktop/mobile) connects to this server.",
      benefits: [
        "Workspaces, wikis and realtime collaboration",
        "Self-hosted: your notes and data stay with you",
        "Built-in AI features",
        "Open-core, a Notion alternative",
      ],
      useCases: [
        "Team wiki and knowledge base",
        "Project management and shared notes",
        "Collaborative internal documentation",
      ],
    },
  },

  dify: {
    repo_url: "https://github.com/langgenius/dify",
    "pt-br": {
      tagline: "Plataforma open-source para desenvolver apps com LLM.",
      description:
        "Construa agentes, fluxos visuais, pipelines de RAG e chatbots com um IDE de prompts, ferramentas de avaliação e um marketplace de 100+ modelos. Do conceito à produção em uma plataforma só.",
      benefits: [
        "Agentes e fluxos de trabalho visuais, sem código",
        "IDE de prompts e ferramentas de avaliação",
        "Marketplace com 100+ modelos (OpenAI, Anthropic, Ollama…)",
        "Open-source, da prototipação à produção",
      ],
      useCases: [
        "Chatbots e agentes de atendimento",
        "Assistentes com RAG sobre a base da empresa",
        "Automações com LLM em pipelines internos",
      ],
    },
    en: {
      tagline: "Open-source platform to develop LLM apps.",
      description:
        "Build agents, visual workflows, RAG pipelines and chatbots with a prompt IDE, evaluation tools and a marketplace of 100+ models. From idea to production on one platform.",
      benefits: [
        "Visual agents and workflows, no code",
        "Prompt IDE and evaluation tools",
        "Marketplace with 100+ models (OpenAI, Anthropic, Ollama…)",
        "Open-source, from prototype to production",
      ],
      useCases: [
        "Support chatbots and agents",
        "RAG assistants over company data",
        "LLM automations in internal pipelines",
      ],
    },
  },
};

/** Conteúdo rico de um app, ou undefined se não houver entrada para o slug. */
export function getAppContent(slug: string): AppContent | undefined {
  return APP_CONTENT[slug];
}
