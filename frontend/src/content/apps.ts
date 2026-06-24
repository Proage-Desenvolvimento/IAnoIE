/**
 * Conteúdo de marketing do catálogo, indexado por slug.
 *
 - `hero`  → caminho da imagem em /public (ex.: "/images/apps/open-webui.png").
 *          Deixe `undefined` para mostrar o placeholder até adicionar o arquivo.
 - `video` → URL do YouTube. Deixe `undefined` para o placeholder de vídeo.
 - `logo` → URL do logo do app. Quando presente, aparece no card no lugar do ícone de categoria.
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
  /** Logo do app (URL). Quando presente, aparece no card no lugar do ícone de categoria. */
  logo?: string;
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
      tagline: "O ChatGPT da sua empresa: mesma experiência, mas os dados nunca saem da sua rede.",
      description:
        "A equipe quer usar IA como usa o ChatGPT, mas colocar dado de cliente e informação confidencial num serviço externo é risco que muita empresa não pode correr. O Open WebUI entrega a mesma experiência de conversa na sua própria infraestrutura, com vários modelos no mesmo lugar e a opção de rodar modelo local para cortar a conta por token.",
      benefits: [
        "Conversa nunca sai da sua rede: dado de cliente e confidencial fica dentro",
        "Modelo local corta a conta por token das APIs externas",
        "OpenAI, Anthropic e modelos locais no mesmo lugar, sem trocar de ferramenta",
        "A equipe pergunta sobre os próprios documentos da empresa",
        "Sobe com um clique, sem precisar de equipe de infraestrutura",
      ],
      useCases: [
        "IA para a equipe sem expor dado a serviço externo",
        "Assistente de pesquisa sobre documentos da empresa",
        "Chat privado para áreas que lidam com informação sensível",
      ],
    },
    en: {
      tagline: "Your company's ChatGPT: same experience, but the data never leaves your network.",
      description:
        "The team wants to use AI the way they use ChatGPT, but putting customer data and confidential information on an outside service is a risk many companies can't take. Open WebUI delivers the same chat experience on your own infrastructure, with multiple models in one place and the option to run a local model to cut the per-token bill.",
      benefits: [
        "Conversations never leave your network: customer and confidential data stays inside",
        "A local model cuts the per-token bill of external APIs",
        "OpenAI, Anthropic and local models in one place, no tool switching",
        "The team asks questions over the company's own documents",
        "Deploys in one click, no infrastructure team needed",
      ],
      useCases: [
        "AI for the team without exposing data to an outside service",
        "A research assistant over company documents",
        "Private chat for teams handling sensitive information",
      ],
    },
  },

  jupyterlab: {
    repo_url: "https://github.com/jupyterlab/jupyterlab",
    logo: "https://jupyterlab.readthedocs.io/en/latest/_static/logo-rectangle.svg",
    hero: "/images/apps/jupyterlab.png",
    "pt-br": {
      tagline:
        "O ambiente onde sua equipe de dados analisa números e testa modelos — padrão do mercado, na sua GPU.",
      description:
        "Esta é a bancada de trabalho de quem mexe com dados e modelos na empresa. Por ser o padrão do mercado, você contrata gente que já sabe usar, sem treinamento do zero, e o processamento pesado roda na sua própria GPU em vez de virar conta de nuvem no fim do mês.",
      benefits: [
        "Padrão do mercado: você contrata quem já domina, sem curva de treinamento",
        "Processamento pesado roda na sua GPU, não em conta de nuvem variável",
        "Experimentos ficam registrados e reproduzíveis, não na cabeça de um analista",
        "Mesma ferramenta para Python, R e outras linguagens da equipe",
      ],
      useCases: [
        "Análise de dados do negócio pela equipe interna",
        "Treino e teste de modelos sob seu controle",
        "Provas de conceito antes de investir em projeto grande",
      ],
    },
    en: {
      tagline:
        "Where your data team analyzes numbers and tests models — the market standard, on your GPU.",
      description:
        "This is the workbench for whoever works with data and models at the company. Because it's the market standard, you hire people who already know it, with no training from scratch, and heavy processing runs on your own GPU instead of becoming a cloud bill at month's end.",
      benefits: [
        "Market standard: you hire people who already know it, with no learning curve",
        "Heavy processing runs on your GPU, not a variable cloud bill",
        "Experiments stay recorded and reproducible, not in one analyst's head",
        "One tool for Python, R and the team's other languages",
      ],
      useCases: [
        "Business data analysis by the in-house team",
        "Training and testing models under your control",
        "Proofs of concept before committing to a big project",
      ],
    },
  },

  comfyui: {
    repo_url: "https://github.com/Comfy-Org/ComfyUI",
    logo: "https://comfy.org/icons/logo.svg",
    hero: "/images/apps/comfyui.png",
    "pt-br": {
      tagline:
        "Material visual da empresa gerado por IA, na sua máquina, sem custo por imagem nem fila de agência.",
      description:
        "Cada peça de marketing que depende de designer externo ou banco de imagem custa dinheiro e tempo de espera. O ComfyUI gera imagem e arte na sua própria GPU, com fluxos que mantêm a identidade da marca consistente. Depois de instalado, não há custo por imagem — você gera quantas precisar.",
      benefits: [
        "Material visual sem depender de fila de designer ou de banco de imagem pago",
        "Custo por imagem some: depois de rodando, gerar mais não custa a mais",
        "Fluxos repetíveis mantêm a marca consistente entre as peças",
        "As imagens nunca saem da sua máquina",
      ],
      useCases: [
        "Banco de imagens para marketing e redes",
        "Protótipos visuais antes de fechar com agência",
        "Geração de conteúdo visual em volume",
      ],
    },
    en: {
      tagline:
        "Company visuals generated by AI, on your own machine, with no per-image cost and no agency queue.",
      description:
        "Every marketing piece that depends on an outside designer or stock library costs money and waiting time. ComfyUI generates images and art on your own GPU, with workflows that keep the brand consistent. Once it's running, there's no per-image cost — you generate as many as you need.",
      benefits: [
        "Visuals without waiting on a designer's queue or paying for stock",
        "Per-image cost disappears: once it's running, more images cost no more",
        "Repeatable workflows keep the brand consistent across pieces",
        "Images never leave your machine",
      ],
      useCases: [
        "An image library for marketing and social",
        "Visual prototypes before committing to an agency",
        "Visual content at volume",
      ],
    },
  },

  n8n: {
    repo_url: "https://github.com/n8n-io/n8n",
    logo: "https://n8n.io/brandguidelines/logo-dark.svg",
    hero: "/images/apps/n8n.png",
    "pt-br": {
      tagline:
        "Tarefa repetitiva entre sistemas feita sozinha, sem erro de digitação e sem programar.",
      description:
        "Hora de gente cara é gasta copiando dado de um sistema para outro, e cada passo manual é uma chance de erro. O n8n conecta os aplicativos que a empresa já usa — e-mail, CRM, banco de dados, IA — e faz esse trabalho rodar sozinho. Self-hosted, então o dado não passa por serviço de terceiro.",
      benefits: [
        "Trabalho repetitivo entre sistemas deixa de consumir hora de equipe",
        "Menos erro manual: o processo roda igual toda vez",
        "Conecta o que a empresa já usa, sem trocar de ferramenta",
        "Self-hosted: o dado da operação não passa por serviço externo",
      ],
      useCases: [
        "Integração entre sistemas que hoje é feita na mão",
        "Relatórios e avisos automáticos",
        "Processar dados com IA dentro do fluxo",
      ],
    },
    en: {
      tagline:
        "Repetitive work between systems done on its own, with no typos and no coding.",
      description:
        "Expensive staff time gets spent copying data from one system to another, and every manual step is a chance for error. n8n connects the apps the company already uses — email, CRM, databases, AI — and makes that work run on its own. Self-hosted, so the data doesn't pass through a third-party service.",
      benefits: [
        "Repetitive work between systems stops eating team hours",
        "Fewer manual errors: the process runs the same every time",
        "Connects what the company already uses, no tool switch",
        "Self-hosted: operational data doesn't pass through an external service",
      ],
      useCases: [
        "Integration between systems that's done by hand today",
        "Automated reports and alerts",
        "Processing data with AI inside the flow",
      ],
    },
  },

  omnivoice: {
    repo_url: "https://github.com/k2-fsa/OmniVoice",
    logo: "https://camo.githubusercontent.com/f61a6b9528ca18d4c61d685716b58c72df8898e18f0978c0eb27e915f167b371/68747470733a2f2f7a68752d68616e2e6769746875622e696f2f6f6d6e69766f6963652f706963732f6f6d6e69766f6963652e6a7067",
    hero: "/images/apps/omnivoice.png",
    "pt-br": {
      tagline:
        "Narração e locução em mais de 600 idiomas, sem estúdio nem custo por minuto de gravação.",
      description:
        "Narrar vídeo, treinamento ou material em vários idiomas costuma significar estúdio, locutor e custo por hora. O OmniVoice gera a voz por IA, clona uma voz a partir de poucos segundos de áudio e cobre mais de 600 idiomas. Conteúdo multilíngue deixa de depender de orçamento de gravação.",
      benefits: [
        "Narração em escala sem reservar estúdio nem locutor",
        "Conteúdo em vários idiomas sem multiplicar o custo de gravação",
        "Clona uma voz com poucos segundos de áudio, para manter consistência",
        "Cobre mais de 600 idiomas e sotaques",
      ],
      useCases: [
        "Narração de vídeos e treinamentos",
        "Versões do mesmo material em vários idiomas",
        "Voz para acessibilidade e audiolivros",
      ],
    },
    en: {
      tagline:
        "Narration and voiceover in 600+ languages, with no studio and no per-minute recording cost.",
      description:
        "Narrating a video, training or material in several languages usually means a studio, a voice actor and an hourly cost. OmniVoice generates the voice with AI, clones a voice from a few seconds of audio, and covers more than 600 languages. Multilingual content stops depending on a recording budget.",
      benefits: [
        "Narration at scale without booking a studio or a voice actor",
        "Content in several languages without multiplying recording cost",
        "Clones a voice from a few seconds of audio, to keep it consistent",
        "Covers more than 600 languages and accents",
      ],
      useCases: [
        "Narration for videos and training",
        "Versions of the same material in several languages",
        "Voice for accessibility and audiobooks",
      ],
    },
  },

  speakr: {
    repo_url: "https://github.com/murtaza-nasir/speakr",
    logo: "https://raw.githubusercontent.com/murtaza-nasir/speakr/master/static/img/icon-32x32.png",
    hero: "/images/apps/speakr.png",
    "pt-br": {
      tagline:
        "Reunião vira texto pesquisável com quem falou cada coisa — sem alguém anotando ata.",
      description:
        "Produzir ata e resumo de reunião gasta horas de alguém, e o que foi dito some quando ninguém anotou. O Speakr transforma áudio em texto pesquisável e identifica cada participante automaticamente. O motor de transcrição é à sua escolha, inclusive um Whisper rodando na sua própria infraestrutura.",
      benefits: [
        "Ata e resumo deixam de consumir horas de alguém depois da reunião",
        "Identifica quem falou cada coisa, sem confusão de versões",
        "O que foi dito fica pesquisável, não perdido na memória",
        "Motor de transcrição à sua escolha, inclusive local e privado",
      ],
      useCases: [
        "Ata e resumo automáticos de reunião",
        "Transcrição de entrevistas e pesquisa",
        "Legendagem e busca dentro de áudios",
      ],
    },
    en: {
      tagline:
        "A meeting becomes searchable text with who said what — no one taking minutes.",
      description:
        "Producing minutes and a summary of a meeting eats someone's hours, and what was said vanishes when nobody wrote it down. Speakr turns audio into searchable text and identifies each participant automatically. The transcription engine is your choice, including a Whisper running on your own infrastructure.",
      benefits: [
        "Minutes and summaries stop eating someone's hours after the meeting",
        "Identifies who said what, no confusion over versions",
        "What was said stays searchable, not lost to memory",
        "Transcription engine of your choice, including local and private",
      ],
      useCases: [
        "Automatic minutes and summaries of meetings",
        "Transcribing interviews and research",
        "Captioning and search inside audio",
      ],
    },
  },

  voicebox: {
    repo_url: "https://github.com/jamiepine/voicebox",
    logo: "https://raw.githubusercontent.com/jamiepine/voicebox/main/.github/assets/icon-dark.webp",
    hero: "/images/apps/voicebox.png",
    "pt-br": {
      tagline:
        "Estúdio de voz local: clona voz, gera narração e dita em qualquer app, sem mensalidade por uso.",
      description:
        "Ferramentas como o ElevenLabs cobram por uso e mandam seu áudio para fora. O Voicebox junta clonagem de voz, narração em 23 idiomas e ditado em qualquer campo de texto rodando localmente. A voz e o áudio nunca saem da máquina, e não há conta por minuto gerado.",
      benefits: [
        "Sem conta por uso das ferramentas de voz de mercado",
        "Voz e áudio rodam localmente e nunca saem da máquina",
        "Narração em 23 idiomas para conteúdo multilíngue",
        "Ditado por atalho em qualquer aplicativo, sem assinatura à parte",
      ],
      useCases: [
        "Narração e dublagem de vídeo em vários idiomas",
        "Acessibilidade: voz para quem não pode falar",
        "Ditado para acelerar quem escreve muito",
      ],
    },
    en: {
      tagline:
        "A local voice studio: clone voices, generate narration and dictate in any app, with no per-use fee.",
      description:
        "Tools like ElevenLabs charge per use and send your audio out. Voicebox combines voice cloning, narration in 23 languages and dictation into any text field, running locally. The voice and audio never leave the machine, and there's no bill per minute generated.",
      benefits: [
        "No per-use bill like the market voice tools",
        "Voice and audio run locally and never leave the machine",
        "Narration in 23 languages for multilingual content",
        "Dictation by hotkey in any application, no separate subscription",
      ],
      useCases: [
        "Video narration and dubbing in several languages",
        "Accessibility: a voice for people who can't speak",
        "Dictation to speed up heavy writers",
      ],
    },
  },

  "open-notebook": {
    repo_url: "https://github.com/lfnovo/open-notebook",
    logo: "https://www.open-notebook.ai/hero.svg",
    hero: "/images/apps/open-notebook.png",
    "pt-br": {
      tagline:
        "Alternativa ao NotebookLM na sua infraestrutura: converse com seus documentos e vire relatório em podcast.",
      description:
        "Relatório e documento empilham mais rápido do que alguém consegue ler. O Open Notebook deixa pesquisar e conversar com as próprias fontes, com busca semântica no acervo inteiro, e ainda transforma material denso em podcast com mais de um locutor. Roda na sua infraestrutura, sem GPU obrigatória.",
      benefits: [
        "Converse com o acervo de documentos em vez de ler tudo página a página",
        "Busca por sentido, não só por palavra exata, em todo o material",
        "Vira relatório em podcast para quem aprende ouvindo",
        "Na sua infraestrutura e sem GPU obrigatória",
      ],
      useCases: [
        "Pesquisa interna sobre bases de documentos",
        "Resumo de relatórios em texto ou áudio",
        "Onboarding guiado por material próprio",
      ],
    },
    en: {
      tagline:
        "A self-hosted NotebookLM alternative: chat with your documents and turn a report into a podcast.",
      description:
        "Reports and documents pile up faster than anyone can read them. Open Notebook lets you research and chat with your own sources, with semantic search across the whole collection, and turns dense material into a multi-speaker podcast. It runs on your infrastructure, with no GPU required.",
      benefits: [
        "Chat with the document collection instead of reading every page",
        "Search by meaning, not just exact words, across all the material",
        "Turns a report into a podcast for people who learn by listening",
        "On your infrastructure and with no GPU required",
      ],
      useCases: [
        "Internal research over document collections",
        "Report summaries in text or audio",
        "Onboarding guided by your own material",
      ],
    },
  },

  scrapling: {
    repo_url: "https://github.com/D4Vinci/Scrapling",
    logo: "https://scrapling.readthedocs.io/en/latest/assets/cover_dark.svg",
    hero: "/images/apps/scrapling.png",
    "pt-br": {
      tagline:
        "Coleta de dados da web que dribla bloqueio — para monitorar preço de concorrente sem fazer na mão.",
      description:
        "Acompanhar preço e catálogo de concorrente na unha consome tempo e fica desatualizado no dia seguinte. O Scrapling coleta esses dados mesmo de sites que bloqueiam ferramentas comuns, e dá para deixar a IA fazer a coleta sozinha. O acesso é protegido por chave, então só quem você autoriza usa.",
      benefits: [
        "Monitora preço e catálogo de concorrente sem alguém copiando na mão",
        "Funciona em sites que bloqueiam ferramentas comuns de coleta",
        "A IA coleta sozinha e já filtra o que importa",
        "Acesso protegido por chave: só quem você autoriza usa",
      ],
      useCases: [
        "Monitoramento de preço e catálogo de concorrentes",
        "Alimentar planilha e banco com dados de sites",
        "Coletar conteúdo para abastecer IA e relatórios",
      ],
    },
    en: {
      tagline:
        "Web data collection that gets past blocks — to track competitor pricing without doing it by hand.",
      description:
        "Tracking a competitor's prices and catalog by hand eats time and is out of date the next day. Scrapling collects that data even from sites that block common tools, and you can let the AI do the collecting on its own. Access is protected by a key, so only who you authorize can use it.",
      benefits: [
        "Track competitor prices and catalog without someone copying by hand",
        "Works on sites that block common collection tools",
        "The AI collects on its own and filters what matters",
        "Access protected by a key: only who you authorize uses it",
      ],
      useCases: [
        "Monitoring competitor pricing and catalogs",
        "Feeding spreadsheets and databases with site data",
        "Collecting content to feed AI and reports",
      ],
    },
  },

  flowise: {
    repo_url: "https://github.com/FlowiseAI/Flowise",
    logo: "https://flowiseai.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fworkday-flowise-logo-white.e4a24a3b.png&w=256&q=75",
    "pt-br": {
      tagline:
        "Monta assistentes de IA arrastando blocos e publica como chat no seu site, sem programar.",
      description:
        "Para experimentar IA, muita empresa trava esperando alguém saber programar. No Flowise você monta o assistente arrastando blocos, e cada fluxo já sai como API ou widget de chat pronto para colocar no site. Roda leve, sem exigir GPU nem equipe de infraestrutura.",
      benefits: [
        "Cria assistente sem programar e sem esperar disponibilidade de TI",
        "Cada fluxo vira chat no site ou API pronta, sem etapa técnica extra",
        "Conecta os principais provedores e também modelos locais",
        "Leve: não pede GPU nem time de infraestrutura para começar",
      ],
      useCases: [
        "Chat de atendimento no site",
        "Assistente que responde sobre seus documentos",
        "Testar uma ideia de IA antes de investir pesado",
      ],
    },
    en: {
      tagline:
        "Builds AI assistants by dragging blocks and publishes them as a chat on your site, no coding.",
      description:
        "To try AI, many companies stall waiting for someone who can code. In Flowise you build the assistant by dragging blocks, and each flow comes out as an API or chat widget ready to drop on your site. It runs light, with no GPU or infrastructure team required.",
      benefits: [
        "Build an assistant without coding and without waiting on IT availability",
        "Each flow becomes site chat or a ready API, no extra technical step",
        "Connects the main providers and local models too",
        "Light: no GPU or infrastructure team to get started",
      ],
      useCases: [
        "Support chat on your website",
        "An assistant that answers from your documents",
        "Testing an AI idea before investing heavily",
      ],
    },
  },

  anythingllm: {
    repo_url: "https://github.com/Mintplex-Labs/anything-llm",
    logo: "https://raw.githubusercontent.com/Mintplex-Labs/anything-llm/master/images/wordmark.png",
    "pt-br": {
      tagline:
        "Transforme a papelada da empresa em respostas. A equipe pergunta, a IA responde — sem vasculhar pasta atrás de pasta.",
      description:
        "O conhecimento da empresa costuma ficar preso em PDFs, contratos e manuais que ninguém tem tempo de ler. O AnythingLLM deixa qualquer pessoa perguntar em português e receber a resposta com a fonte, sem depender de quem 'sabe onde está o arquivo'. Roda na sua infraestrutura, então documento sensível não sai da empresa.",
      benefits: [
        "Conhecimento que hoje está na cabeça de poucos vira algo que qualquer um consulta",
        "Menos tempo da equipe gasto procurando arquivo e refazendo o que já existe",
        "Documento confidencial não sai da sua rede — você decide qual IA processa",
        "Funciona sem comprar GPU nem montar time técnico",
      ],
      useCases: [
        "Atendimento que responde sobre manuais e políticas sem escalar para uma pessoa",
        "Consulta rápida a contratos e relatórios",
        "Base de conhecimento que sobrevive à saída de funcionários",
      ],
    },
    en: {
      tagline:
        "Turn company paperwork into answers. The team asks, the AI replies — no digging through folders.",
      description:
        "Company knowledge usually sits trapped in PDFs, contracts and manuals nobody has time to read. AnythingLLM lets anyone ask in plain language and get the answer with its source, without depending on whoever 'knows where the file is.' It runs on your own infrastructure, so sensitive documents never leave the company.",
      benefits: [
        "Knowledge that lives in a few people's heads becomes something anyone can look up",
        "Less team time spent hunting for files and redoing what already exists",
        "Confidential documents stay on your network — you decide which AI processes them",
        "Works without buying a GPU or building a technical team",
      ],
      useCases: [
        "Support that answers from manuals and policies without escalating to a person",
        "Quick lookups across contracts and reports",
        "A knowledge base that survives staff turnover",
      ],
    },
  },

  metabase: {
    repo_url: "https://github.com/metabase/metabase",
    logo: "https://www.metabase.com/images/logo-with-wordmark.svg",
    "pt-br": {
      tagline:
        "Os números do negócio em painéis que você mesmo consulta, sem depender da TI nem saber SQL.",
      description:
        "Toda vez que a diretoria precisa de um número e tem que pedir para a TI, a decisão espera dias. O Metabase deixa qualquer gestor perguntar em português e montar painel sozinho, sem SQL. Conecta nos bancos que a empresa já usa e os dados ficam na sua infraestrutura.",
      benefits: [
        "Vê os números do negócio sem fila na TI nem espera por relatório",
        "Pergunta em português, sem precisar saber SQL",
        "Painel de diretoria sempre atualizado, no lugar de planilha que envelhece",
        "Conecta nos bancos que a empresa já tem; os dados não saem dela",
      ],
      useCases: [
        "Painéis de vendas e operação para a gestão",
        "Métricas de produto e retenção",
        "Relatório de diretoria que se atualiza sozinho",
      ],
    },
    en: {
      tagline:
        "Your business numbers in dashboards you check yourself, with no IT dependency and no SQL.",
      description:
        "Every time leadership needs a number and has to ask IT, the decision waits days. Metabase lets any manager ask in plain language and build a dashboard alone, no SQL. It connects to the databases the company already uses, and the data stays on your infrastructure.",
      benefits: [
        "See the business numbers with no IT queue and no waiting on a report",
        "Ask in plain language, no SQL required",
        "A leadership dashboard that's always current, instead of a spreadsheet going stale",
        "Connects to the databases you already have; the data doesn't leave the company",
      ],
      useCases: [
        "Sales and operations dashboards for management",
        "Product and retention metrics",
        "A leadership report that updates itself",
      ],
    },
  },

  khoj: {
    repo_url: "https://github.com/khoj-ai/khoj",
    logo: "https://camo.githubusercontent.com/aceab34fe2adf75b48319e8893632fc4dcdace9cbb4e2910f7d4106f706f6b90/68747470733a2f2f6173736574732e6b686f6a2e6465762f6b686f6a2d6c6f676f2d73696465776179732d31323030783534302e706e67",
    "pt-br": {
      tagline:
        "Um assistente que responde com base nas suas notas, documentos e na web — com a fonte de cada resposta.",
      description:
        "Informação espalhada entre notas, PDFs e repositórios faz cada pesquisa começar do zero. O Khoj conecta esse material e responde com citação da fonte, então dá para confiar e conferir. Funciona com OpenAI, Anthropic, Gemini ou modelo local, e os dados ficam sob seu controle.",
      benefits: [
        "Respostas com a fonte indicada: dá para conferir, não é caixa-preta",
        "Pesquisa sobre o acervo próprio em vez de recomeçar a cada vez",
        "Funciona com os principais provedores e também offline, com modelo local",
        "Seus dados ficam privados, sob seu controle",
      ],
      useCases: [
        "Pesquisa sobre o acervo da empresa com fontes",
        "Resumos e respostas a partir de relatórios próprios",
        "Apoio a desenvolvedores sobre o próprio código",
      ],
    },
    en: {
      tagline:
        "An assistant that answers from your notes, documents and the web — with a source for every answer.",
      description:
        "Information scattered across notes, PDFs and repositories makes every search start from zero. Khoj connects that material and answers with the source cited, so you can trust it and check it. It works with OpenAI, Anthropic, Gemini or a local model, and your data stays under your control.",
      benefits: [
        "Answers with the source shown: you can check it, it's not a black box",
        "Research over your own material instead of starting over each time",
        "Works with the main providers and offline, with a local model",
        "Your data stays private, under your control",
      ],
      useCases: [
        "Research across the company's material, with sources",
        "Summaries and answers from your own reports",
        "Support for developers over their own code",
      ],
    },
  },

  twenty: {
    repo_url: "https://github.com/twentyhq/twenty",
    logo: "https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-website/public/images/core/logo.svg",
    "pt-br": {
      tagline:
        "CRM moderno sem a mensalidade do Salesforce — e com os dados de venda sob seu controle.",
      description:
        "Salesforce e HubSpot cobram caro por usuário e prendem os dados de venda na nuvem deles. O Twenty gerencia contatos, empresas e negócios com um modelo de dados que você molda ao seu processo, sem licença por assento. Self-hosted: a base de clientes é sua, não do fornecedor.",
      benefits: [
        "Sem mensalidade por usuário como nos CRMs de mercado",
        "Base de clientes e de vendas fica com você, não presa no fornecedor",
        "Modelo de dados moldado ao seu processo, não ao contrário",
        "Automações e integração com e-mail e calendário",
      ],
      useCases: [
        "Funil de vendas e gestão de contatos",
        "Relacionamento e pós-venda",
        "Pipeline customizado ao processo da empresa",
      ],
    },
    en: {
      tagline:
        "A modern CRM without the Salesforce subscription — and with your sales data under your control.",
      description:
        "Salesforce and HubSpot charge a lot per user and lock your sales data into their cloud. Twenty manages contacts, companies and deals with a data model you shape to your process, with no per-seat license. Self-hosted: the customer base is yours, not the vendor's.",
      benefits: [
        "No per-user subscription like the market CRMs",
        "Your customer and sales base stays with you, not trapped at a vendor",
        "A data model shaped to your process, not the other way around",
        "Automations and email and calendar integration",
      ],
      useCases: [
        "Sales funnel and contact management",
        "Customer relationships and after-sales",
        "A pipeline customized to the company's process",
      ],
    },
  },

  chatwoot: {
    repo_url: "https://github.com/chatwoot/chatwoot",
    logo: "https://www.chatwoot.com/brand/on_white.png",
    "pt-br": {
      tagline:
        "Todo o atendimento — WhatsApp, e-mail, redes — numa caixa só, sem perder cliente no caminho.",
      description:
        "Quando o cliente fala por WhatsApp, e-mail e Instagram ao mesmo tempo, mensagem se perde e ninguém sabe quem respondeu o quê. O Chatwoot junta todos os canais numa caixa de entrada compartilhada, com histórico por cliente e chatbots para o que é repetitivo. Self-hosted, sem pagar por agente como nas ferramentas de mercado.",
      benefits: [
        "Nenhuma mensagem de cliente cai no vácuo entre WhatsApp, e-mail e redes",
        "A equipe vê o histórico de cada cliente, independente do canal",
        "Chatbot resolve o repetitivo e libera a equipe para o que importa",
        "Sem mensalidade por agente: o custo não pune o crescimento da equipe",
      ],
      useCases: [
        "Atendimento por WhatsApp em escala",
        "Suporte com vários canais numa fila só",
        "Helpdesk interno",
      ],
    },
    en: {
      tagline:
        "All your support — WhatsApp, email, social — in one inbox, with no customer lost along the way.",
      description:
        "When a customer reaches out by WhatsApp, email and Instagram at once, messages slip through and nobody knows who replied to what. Chatwoot pulls every channel into one shared inbox, with per-customer history and chatbots for the repetitive parts. Self-hosted, with no per-agent fee like the market tools charge.",
      benefits: [
        "No customer message falls through the cracks between WhatsApp, email and social",
        "The team sees each customer's history, whatever the channel",
        "A chatbot handles the repetitive work and frees the team for what matters",
        "No per-agent fee: cost doesn't punish a growing team",
      ],
      useCases: [
        "WhatsApp support at scale",
        "Multi-channel support in a single queue",
        "Internal helpdesk",
      ],
    },
  },

  superset: {
    repo_url: "https://github.com/apache/superset",
    logo: "https://camo.githubusercontent.com/dc551298736c4cc5f9b23512ef7ca67e6a9304be4d2e06a0d3ff09b6491adb9b/68747470733a2f2f73757065727365742e6170616368652e6f72672f696d672f73757065727365742d6c6f676f2d686f72697a2d6170616368652e737667",
    "pt-br": {
      tagline:
        "BI de nível corporativo sem licença por usuário — e cada um só vê o dado que pode ver.",
      description:
        "Ferramentas de BI de mercado cobram por usuário e a conta cresce junto com a empresa. O Superset entrega painéis e exploração de dados no padrão corporativo, com controle de acesso por linha — cada pessoa enxerga só o que lhe cabe. Open-source, na sua infraestrutura, sem licença por assento.",
      benefits: [
        "BI corporativo sem licença por usuário que cresce com a empresa",
        "Controle por linha: cada um vê só o dado que tem permissão",
        "Analistas exploram à vontade; a gestão recebe o painel pronto",
        "Conecta nos bancos que a empresa já usa, na sua infraestrutura",
      ],
      useCases: [
        "Painéis executivos e operacionais",
        "Exploração de dados pela equipe de análise",
        "BI com controle fino de quem vê o quê",
      ],
    },
    en: {
      tagline:
        "Enterprise-grade BI without a per-user license — and each person sees only the data they're allowed to.",
      description:
        "Market BI tools charge per user and the bill grows with the company. Superset delivers enterprise-grade dashboards and data exploration, with row-level access control — each person sees only what's theirs to see. Open-source, on your infrastructure, with no per-seat license.",
      benefits: [
        "Enterprise BI without a per-user license that grows with the company",
        "Row-level control: each person sees only the data they're permitted",
        "Analysts explore freely; management gets the finished dashboard",
        "Connects to the databases you already use, on your infrastructure",
      ],
      useCases: [
        "Executive and operational dashboards",
        "Data exploration by the analytics team",
        "BI with fine-grained control over who sees what",
      ],
    },
  },

  onyx: {
    repo_url: "https://github.com/onyx-dot-app/onyx",
    logo: "https://raw.githubusercontent.com/onyx-dot-app/onyx/logo/OnyxLogoCropped.jpg",
    "pt-br": {
      tagline:
        "Pergunte uma vez e a IA busca em Drive, Slack, Notion e wikis ao mesmo tempo, com a fonte.",
      description:
        "Em empresa com Drive, Slack, Notion e Confluence, a informação existe mas ninguém acha. O Onyx conecta tudo e responde com citação da fonte, então a equipe para de garimpar e o novato encontra sozinho o que precisa. Roda na sua infraestrutura.",
      benefits: [
        "Uma busca cobre Drive, Slack, Notion e wikis de uma vez",
        "Resposta com a fonte: dá para confiar e checar de onde veio",
        "Novato se vira sozinho em vez de interromper o time o tempo todo",
        "Roda na sua infraestrutura; o conhecimento não vaza para fora",
      ],
      useCases: [
        "Busca unificada no que está espalhado pela empresa",
        "Onboarding sem interromper o time toda hora",
        "Assistente interno de conhecimento",
      ],
    },
    en: {
      tagline:
        "Ask once and the AI searches Drive, Slack, Notion and wikis at the same time, with the source.",
      description:
        "In a company with Drive, Slack, Notion and Confluence, the information exists but nobody can find it. Onyx connects all of it and answers with the source cited, so the team stops digging and new hires find what they need on their own. It runs on your infrastructure.",
      benefits: [
        "One search covers Drive, Slack, Notion and wikis at once",
        "Answers with the source: you can trust it and see where it came from",
        "New hires manage on their own instead of interrupting the team constantly",
        "Runs on your infrastructure; the knowledge doesn't leak outside",
      ],
      useCases: [
        "Unified search across what's scattered around the company",
        "Onboarding without constant interruptions to the team",
        "An internal knowledge assistant",
      ],
    },
  },

  appflowy: {
    repo_url: "https://github.com/AppFlowy-IO/AppFlowy",
    logo: "https://pbs.twimg.com/profile_images/1455082143315496961/hZt2DeOJ.jpg",
    "pt-br": {
      tagline:
        "Wiki e documentação da equipe sem mensalidade por pessoa e sem seus dados na nuvem dos outros.",
      description:
        "Ferramentas como o Notion cobram por usuário e guardam suas anotações em servidor de terceiro. O AppFlowy entrega wiki, documentação e gestão de projetos rodando na sua própria infraestrutura: o custo não cresce a cada pessoa que entra, e a informação da empresa fica com a empresa.",
      benefits: [
        "Custo não escala por assento — o time pode crescer sem a conta acompanhar",
        "Documentação e dados da equipe ficam na sua infraestrutura, fora da nuvem de terceiros",
        "Substitui o Notion sem o risco de mudança de preço ou de política do fornecedor",
        "Wiki, projetos e notas no mesmo lugar, com IA embutida",
      ],
      useCases: [
        "Wiki e base de conhecimento que a empresa controla",
        "Gestão de projetos e notas compartilhadas",
        "Documentação interna sem licença por usuário",
      ],
    },
    en: {
      tagline:
        "Team wiki and docs without a per-seat fee and without your data on someone else's cloud.",
      description:
        "Tools like Notion charge per user and keep your notes on a third party's servers. AppFlowy delivers wiki, documentation and project management running on your own infrastructure: the bill doesn't grow with every new hire, and company information stays with the company.",
      benefits: [
        "Cost doesn't scale per seat — the team can grow without the bill following",
        "Team docs and data stay on your infrastructure, off third-party clouds",
        "Replaces Notion without the risk of a vendor changing price or policy",
        "Wiki, projects and notes in one place, with AI built in",
      ],
      useCases: [
        "A wiki and knowledge base the company controls",
        "Project management and shared notes",
        "Internal documentation without a per-user license",
      ],
    },
  },

  dify: {
    repo_url: "https://github.com/langgenius/dify",
    logo: "https://pbs.twimg.com/profile_images/1998264604145963008/v__dR1kD.jpg",
    "pt-br": {
      tagline:
        "Coloca ideias de IA pra rodar de verdade, sem depender de um time grande de desenvolvimento.",
      description:
        "A maior parte dos projetos de IA morre entre a ideia e algo que funciona em produção, quase sempre por falta de gente técnica. O Dify reduz essa distância: dá para montar assistentes, automações e chatbots sobre a base da empresa em uma plataforma só, trocando de modelo (OpenAI, Anthropic, modelo local) sem reescrever nada e sem ficar preso a um fornecedor.",
      benefits: [
        "Ideia de IA vira ferramenta em uso sem precisar montar um time de engenharia",
        "Troca o modelo por trás (OpenAI, Anthropic, local) sem ficar refém de um fornecedor",
        "O que era protótipo vai para produção na mesma plataforma",
        "Assistentes respondem com base na sua informação, não em achismo",
      ],
      useCases: [
        "Assistentes de atendimento sobre a base da empresa",
        "Automações internas com IA",
        "Chatbots que entram em produção, não só em demonstração",
      ],
    },
    en: {
      tagline:
        "Gets AI ideas actually running, without needing a large development team.",
      description:
        "Most AI projects die between the idea and something that works in production, usually for lack of technical staff. Dify shortens that gap: you can build assistants, automations and chatbots over the company's data in one platform, switching models (OpenAI, Anthropic, a local model) without rewriting anything and without getting locked to one vendor.",
      benefits: [
        "An AI idea becomes a working tool without standing up an engineering team",
        "Swap the model underneath (OpenAI, Anthropic, local) without depending on one vendor",
        "What was a prototype goes to production on the same platform",
        "Assistants answer from your information, not guesswork",
      ],
      useCases: [
        "Support assistants over the company's knowledge",
        "Internal automations with AI",
        "Chatbots that reach production, not just a demo",
      ],
    },
  },

  mkt22: {
    logo: "https://mkt22.com/library/images/logo-mkt22-color.png",
    hero: "https://mkt22.com/library/images/img-patos-mkt22.png",
    "pt-br": {
      tagline:
        "Consultor de marketing com IA: estrutura seu planejamento com investigação externa para reduzir incertezas e melhorar o diagnóstico.",
      description:
        "O mkt22 é um consultor de marketing com inteligência artificial. Ele ajuda a estruturar seu planejamento de marketing usando investigação externa sempre que isso ajudar a reduzir incertezas e melhorar o diagnóstico do seu negócio.",
      benefits: [
        "Planejamento de marketing estruturado e orientado por IA",
        "Investigação externa para reduzir incertezas antes de decidir",
        "Diagnóstico de mercado mais sólido e fundamentado",
      ],
    },
    en: {
      tagline:
        "AI marketing consultant: structures your planning using external research to cut uncertainty and sharpen the diagnosis.",
      description:
        "mkt22 is an AI-powered marketing consultant. It helps structure your marketing plan using external research whenever it helps reduce uncertainty and improve the diagnosis of your business.",
      benefits: [
        "Structured, AI-guided marketing planning",
        "External research to reduce uncertainty before deciding",
        "A more solid, evidence-based market diagnosis",
      ],
    },
  },
};

/** Conteúdo rico de um app, ou undefined se não houver entrada para o slug. */
export function getAppContent(slug: string): AppContent | undefined {
  return APP_CONTENT[slug];
}
