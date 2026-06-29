/**
 * Conteúdo de marketing do catálogo, indexado por slug.
 *
 - `hero`  → caminho da imagem em /public (ex.: "/images/apps/open-webui.png").
 *          Deixe `undefined` para mostrar o placeholder até adicionar o arquivo.
 * - `video` → URL do YouTube. Deixe `undefined` para o placeholder de vídeo.
 * - `logo` → URL do logo do app. Quando presente, aparece no card no lugar do ícone de categoria.
 * - `repo_url` → URL do repositório upstream (GitHub). Omitir para não mostrar o link.
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
      tagline: "O ChatGPT da sua empresa, com a diferença de que nada sai para fora.",
      description:
        "A equipe quer usar inteligência artificial como usa o ChatGPT, mas colocar informação de cliente e dado sigiloso num serviço de fora é um risco que muita empresa não pode correr. Aqui a experiência é a mesma, só que tudo acontece dentro da sua empresa — e dá para reduzir bastante o custo.",
      benefits: [
        "As conversas nunca saem da sua empresa: dado de cliente fica protegido",
        "Custa bem menos do que pagar por uso lá fora",
        "A equipe pode perguntar sobre os documentos da própria empresa",
        "Simples de instalar, sem equipe técnica",
      ],
      useCases: [
        "Inteligência artificial para a equipe sem expor informação para fora",
        "Assistente de pesquisa sobre os documentos da empresa",
        "Conversa protegida para áreas que lidam com dado sigiloso",
      ],
    },
    en: {
      tagline: "Your company's ChatGPT, with the difference that nothing goes out.",
      description:
        "The team wants to use artificial intelligence the way they use ChatGPT, but putting customer information and confidential data on an outside service is a risk many companies can't take. Here the experience is the same, except everything happens inside your company — and you can cut the cost considerably.",
      benefits: [
        "Conversations never leave your company: customer data stays protected",
        "Costs far less than paying for usage outside",
        "The team can ask about the company's own documents",
        "Simple to install, no technical team",
      ],
      useCases: [
        "Artificial intelligence for the team without exposing information outside",
        "A research assistant over company documents",
        "Protected chat for areas handling confidential data",
      ],
    },
  },

  jupyterlab: {
    repo_url: "https://github.com/jupyterlab/jupyterlab",
    logo: "https://jupyterlab.readthedocs.io/en/latest/_static/logo-rectangle-dark.svg",
    hero: "/images/apps/jupyterlab.png",
    "pt-br": {
      tagline: "O espaço onde sua equipe trabalha com dados e inteligência artificial.",
      description:
        "Esta é a bancada de trabalho de quem mexe com dados e cria modelos de inteligência artificial na empresa. Por ser a ferramenta que o mercado todo usa, você contrata gente que já sabe usar, sem treinar do zero, e o trabalho pesado roda nos computadores da empresa em vez de virar conta no fim do mês.",
      benefits: [
        "Quem você contrata já sabe usar, sem treinamento do zero",
        "O trabalho pesado roda nos computadores da empresa, sem custo extra de fora",
        "Os trabalhos ficam registrados e podem ser refeitos, não somem com a pessoa",
        "Serve para os vários tipos de trabalho da equipe de dados",
      ],
      useCases: [
        "Análise dos dados do negócio pela equipe interna",
        "Criar e testar modelos de inteligência artificial",
        "Testar ideias antes de investir num projeto grande",
      ],
    },
    en: {
      tagline: "The space where your team works with data and artificial intelligence.",
      description:
        "This is the workbench for whoever works with data and builds artificial-intelligence models at the company. Because it's the tool the whole market uses, you hire people who already know it, with no training from scratch, and the heavy work runs on the company's computers instead of becoming a bill at month's end.",
      benefits: [
        "The people you hire already know how to use it, no training from scratch",
        "The heavy work runs on the company's computers, with no extra outside cost",
        "The work stays recorded and can be redone, instead of leaving with the person",
        "It serves the data team's many kinds of work",
      ],
      useCases: [
        "Analysis of business data by the in-house team",
        "Building and testing artificial-intelligence models",
        "Testing ideas before investing in a big project",
      ],
    },
  },

  comfyui: {
    repo_url: "https://github.com/Comfy-Org/ComfyUI",
    logo: "https://comfy.org/icons/logo.svg",
    hero: "/images/apps/comfyui.png",
    "pt-br": {
      tagline: "Crie as imagens do seu marketing sem depender de designer nem pagar por foto.",
      description:
        "Cada peça de marketing que depende de um designer de fora ou de comprar foto pronta custa dinheiro e tempo de espera. Aqui você cria imagens e arte no seu próprio computador, seguindo o estilo da sua marca. Depois de instalado, criar mais imagens não custa nada a mais.",
      benefits: [
        "Crie imagens sem esperar na fila do designer nem pagar por foto pronta",
        "Depois de instalado, gerar mais imagens não custa a mais",
        "Mantém o mesmo estilo em todas as peças da marca",
        "As imagens ficam no seu computador",
      ],
      useCases: [
        "Imagens para marketing e redes sociais",
        "Testar ideias visuais antes de contratar uma agência",
        "Criar muito conteúdo visual em pouco tempo",
      ],
    },
    en: {
      tagline: "Create your marketing images without relying on a designer or paying per photo.",
      description:
        "Every marketing piece that depends on an outside designer or buying stock photos costs money and waiting time. Here you create images and art on your own computer, following your brand's style. Once it's set up, creating more images costs nothing extra.",
      benefits: [
        "Create images without waiting on a designer or paying for stock photos",
        "Once set up, generating more images costs no more",
        "Keeps the same style across all your brand pieces",
        "The images stay on your computer",
      ],
      useCases: [
        "Images for marketing and social media",
        "Testing visual ideas before hiring an agency",
        "Creating a lot of visual content quickly",
      ],
    },
  },

  n8n: {
    repo_url: "https://github.com/n8n-io/n8n",
    logo: "https://n8n.io/brandguidelines/logo-dark.svg",
    hero: "/images/apps/n8n.png",
    "pt-br": {
      tagline: "Tarefas repetitivas feitas sozinhas, sem ninguém perdendo tempo e sem erro.",
      description:
        "Boa parte do tempo da equipe vai embora copiando informação de um programa para outro, e cada passo manual é uma chance de erro. Aqui esse trabalho passa a acontecer sozinho, ligando os programas que a empresa já usa. A informação não passa por outras empresas no caminho.",
      benefits: [
        "O trabalho repetitivo deixa de ocupar o tempo da equipe",
        "Menos erro: o processo acontece igual toda vez",
        "Liga os programas que a empresa já usa, sem trocar nada",
        "A informação não passa por outras empresas no caminho",
      ],
      useCases: [
        "Ligar programas que hoje a equipe atualiza na mão",
        "Relatórios e avisos enviados sozinhos",
        "Organizar informações automaticamente",
      ],
    },
    en: {
      tagline: "Repetitive tasks done on their own, with no one wasting time and no errors.",
      description:
        "A good part of the team's time disappears copying information from one program to another, and every manual step is a chance for error. Here that work starts happening on its own, connecting the programs the company already uses. The information doesn't pass through other companies along the way.",
      benefits: [
        "Repetitive work stops taking up the team's time",
        "Fewer errors: the process happens the same every time",
        "Connects the programs the company already uses, with nothing to switch",
        "The information doesn't pass through other companies along the way",
      ],
      useCases: [
        "Connecting programs the team updates by hand today",
        "Reports and alerts sent on their own",
        "Organizing information automatically",
      ],
    },
  },

  omnivoice: {
    repo_url: "https://github.com/k2-fsa/OmniVoice",
    logo: "https://camo.githubusercontent.com/f61a6b9528ca18d4c61d685716b58c72df8898e18f0978c0eb27e915f167b371/68747470733a2f2f7a68752d68616e2e6769746875622e696f2f6f6d6e69766f6963652f706963732f6f6d6e69766f6963652e6a7067",
    hero: "/images/apps/omnivoice.png",
    "pt-br": {
      tagline: "Narração pronta em qualquer idioma, sem estúdio e sem pagar por hora de gravação.",
      description:
        "Gravar a narração de um vídeo ou treinamento em vários idiomas costuma exigir estúdio, locutor e custo por hora. Aqui a voz é criada na hora, em mais de 600 idiomas, e dá até para manter sempre a mesma voz. Conteúdo em vários idiomas deixa de depender de orçamento de gravação.",
      benefits: [
        "Narração pronta na hora, sem reservar estúdio nem locutor",
        "Conteúdo em vários idiomas sem multiplicar o custo",
        "Mantém sempre a mesma voz nos seus materiais",
        "Mais de 600 idiomas e sotaques",
      ],
      useCases: [
        "Narração de vídeos e treinamentos",
        "O mesmo material em vários idiomas",
        "Voz para acessibilidade e audiolivros",
      ],
    },
    en: {
      tagline: "Ready narration in any language, with no studio and no per-hour recording cost.",
      description:
        "Recording the narration for a video or training in several languages usually requires a studio, a voice actor and an hourly cost. Here the voice is created on the spot, in more than 600 languages, and you can even keep the same voice throughout. Content in several languages stops depending on a recording budget.",
      benefits: [
        "Narration ready on the spot, without booking a studio or voice actor",
        "Content in several languages without multiplying the cost",
        "Keeps the same voice across your materials",
        "More than 600 languages and accents",
      ],
      useCases: [
        "Narration for videos and training",
        "The same material in several languages",
        "Voice for accessibility and audiobooks",
      ],
    },
  },

  speakr: {
    repo_url: "https://github.com/murtaza-nasir/speakr",
    logo: "https://raw.githubusercontent.com/murtaza-nasir/speakr/master/static/img/icon-32x32.png",
    hero: "/images/apps/speakr.png",
    "pt-br": {
      tagline: "Toda reunião vira texto pronto pra buscar, sem ninguém perdendo tempo com ata.",
      description:
        "Escrever a ata e o resumo de uma reunião toma horas de alguém, e o que foi dito some quando ninguém anota. Aqui a gravação vira texto que dá para pesquisar, já indicando quem disse cada coisa. Você escolhe como a transcrição é feita, inclusive mantendo tudo dentro da empresa.",
      benefits: [
        "A ata e o resumo deixam de tomar horas de alguém",
        "Mostra quem disse cada coisa, sem confusão",
        "O que foi dito fica fácil de encontrar depois",
        "Você escolhe como é feito, inclusive mantendo tudo dentro da empresa",
      ],
      useCases: [
        "Ata e resumo de reunião feitos sozinhos",
        "Transcrição de entrevistas e conversas",
        "Encontrar trechos dentro de gravações",
      ],
    },
    en: {
      tagline: "Every meeting becomes searchable text, with no one wasting time on minutes.",
      description:
        "Writing the minutes and summary of a meeting takes someone hours, and what was said vanishes when nobody writes it down. Here the recording becomes searchable text, already showing who said what. You choose how the transcription is done, including keeping everything inside the company.",
      benefits: [
        "Minutes and summaries stop taking someone hours",
        "Shows who said what, with no confusion",
        "What was said stays easy to find later",
        "You choose how it's done, including keeping everything inside the company",
      ],
      useCases: [
        "Meeting minutes and summaries done on their own",
        "Transcribing interviews and conversations",
        "Finding passages inside recordings",
      ],
    },
  },

  voicebox: {
    repo_url: "https://github.com/jamiepine/voicebox",
    logo: "https://raw.githubusercontent.com/jamiepine/voicebox/main/.github/assets/icon-dark.webp",
    hero: "/images/apps/voicebox.png",
    "pt-br": {
      tagline: "Crie narração e vozes para seus vídeos no seu computador, sem pagar por uso.",
      description:
        "As ferramentas conhecidas de voz cobram por uso e mandam o seu áudio para fora. Aqui você cria narração em 23 idiomas e até dita textos por voz em qualquer lugar do computador, e tudo acontece na sua própria máquina. A voz e o áudio nunca saem dali, e não há cobrança por minuto.",
      benefits: [
        "Sem cobrança por uso das ferramentas conhecidas de voz",
        "Tudo acontece no seu computador; o áudio nunca sai dali",
        "Narração em 23 idiomas para conteúdo em vários idiomas",
        "Dite textos por voz em qualquer programa",
      ],
      useCases: [
        "Narração e dublagem de vídeo em vários idiomas",
        "Voz para quem não pode falar",
        "Ditar textos por voz para escrever mais rápido",
      ],
    },
    en: {
      tagline: "Create narration and voices for your videos on your computer, with no per-use fee.",
      description:
        "The well-known voice tools charge per use and send your audio out. Here you create narration in 23 languages and can even dictate text by voice anywhere on the computer, and everything happens on your own machine. The voice and audio never leave it, and there's no charge per minute.",
      benefits: [
        "No per-use charge like the well-known voice tools",
        "Everything happens on your computer; the audio never leaves it",
        "Narration in 23 languages for multilingual content",
        "Dictate text by voice in any program",
      ],
      useCases: [
        "Video narration and dubbing in several languages",
        "A voice for people who can't speak",
        "Dictating text by voice to write faster",
      ],
    },
  },

  "open-notebook": {
    repo_url: "https://github.com/lfnovo/open-notebook",
    logo: "https://www.open-notebook.ai/hero.svg",
    hero: "/images/apps/open-notebook.png",
    "pt-br": {
      tagline: "Converse com seus relatórios e transforme os mais longos em áudio pra ouvir.",
      description:
        "Relatório e documento se acumulam mais rápido do que dá para ler. Aqui você conversa com esse material e pergunta o que quiser, e ainda transforma os textos mais longos em áudio, como um programa de rádio, para ouvir no trânsito ou na academia. Tudo fica com você.",
      benefits: [
        "Converse com seus documentos em vez de ler tudo do começo ao fim",
        "Encontra a resposta pelo sentido, não só pela palavra exata",
        "Transforma relatórios longos em áudio para ouvir em qualquer lugar",
        "Tudo fica dentro da sua empresa",
      ],
      useCases: [
        "Pesquisa nos documentos da empresa",
        "Resumo de relatórios em texto ou áudio",
        "Material de estudo para a equipe",
      ],
    },
    en: {
      tagline: "Chat with your reports and turn the long ones into audio to listen to.",
      description:
        "Reports and documents pile up faster than you can read them. Here you chat with that material and ask whatever you want, and you can even turn the longest texts into audio, like a radio show, to listen to in traffic or at the gym. Everything stays with you.",
      benefits: [
        "Chat with your documents instead of reading everything front to back",
        "Finds the answer by meaning, not just the exact word",
        "Turns long reports into audio to listen to anywhere",
        "Everything stays inside your company",
      ],
      useCases: [
        "Research across company documents",
        "Report summaries in text or audio",
        "Study material for the team",
      ],
    },
  },

  scrapling: {
    repo_url: "https://github.com/D4Vinci/Scrapling",
    logo: "https://scrapling.readthedocs.io/en/latest/assets/cover_dark.svg",
    hero: "/images/apps/scrapling.png",
    "pt-br": {
      tagline: "Acompanhe os preços e o catálogo dos concorrentes sem ninguém fazendo na mão.",
      description:
        "Acompanhar o preço e o catálogo dos concorrentes na mão consome tempo e fica desatualizado no dia seguinte. Aqui essa coleta acontece sozinha, inclusive em sites que costumam barrar esse tipo de busca, e só quem você autoriza tem acesso.",
      benefits: [
        "Acompanhe os preços dos concorrentes sem ninguém copiando na mão",
        "Funciona até em sites que barram esse tipo de busca",
        "A coleta acontece sozinha e já separa o que interessa",
        "Só quem você autoriza tem acesso",
      ],
      useCases: [
        "Acompanhar preços e catálogos de concorrentes",
        "Alimentar planilhas com informações de sites",
        "Reunir informação para relatórios",
      ],
    },
    en: {
      tagline: "Track competitors' prices and catalog without anyone doing it by hand.",
      description:
        "Tracking competitors' prices and catalog by hand eats time and is out of date the next day. Here that collection happens on its own, even on sites that tend to block this kind of search, and only who you authorize has access.",
      benefits: [
        "Track competitors' prices without anyone copying by hand",
        "Works even on sites that block this kind of search",
        "The collection happens on its own and already sorts what matters",
        "Only who you authorize has access",
      ],
      useCases: [
        "Tracking competitors' prices and catalogs",
        "Feeding spreadsheets with information from websites",
        "Gathering information for reports",
      ],
    },
  },

  flowise: {
    repo_url: "https://github.com/FlowiseAI/Flowise",
    logo: "https://flowiseai.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fworkday-flowise-logo-white.e4a24a3b.png&w=256&q=75",
    "pt-br": {
      tagline: "Monte um atendente automático para o seu site sem precisar saber programar.",
      description:
        "Para experimentar inteligência artificial, muita empresa para de esperar alguém que saiba programar. Aqui você monta um assistente encaixando blocos, como um quebra-cabeça, e ele já fica pronto para colocar no seu site. Roda leve, sem precisar de equipe técnica para começar.",
      benefits: [
        "Monte um assistente sem programar e sem esperar a TI ter tempo",
        "Fica pronto para colocar no seu site na hora",
        "Funciona com as principais inteligências artificiais do mercado",
        "Leve e simples de começar",
      ],
      useCases: [
        "Atendente automático no site",
        "Assistente que responde sobre os seus documentos",
        "Testar uma ideia com inteligência artificial antes de investir",
      ],
    },
    en: {
      tagline: "Build an automatic assistant for your website without knowing how to code.",
      description:
        "To try artificial intelligence, many companies stop waiting for someone who can code. Here you build an assistant by snapping blocks together, like a puzzle, and it comes out ready to put on your website. It runs light, with no technical team needed to start.",
      benefits: [
        "Build an assistant without coding and without waiting on IT to have time",
        "Comes out ready to put on your website right away",
        "Works with the main artificial intelligences on the market",
        "Light and simple to get started",
      ],
      useCases: [
        "An automatic assistant on your website",
        "An assistant that answers about your documents",
        "Testing an AI idea before investing",
      ],
    },
  },

  anythingllm: {
    repo_url: "https://github.com/Mintplex-Labs/anything-llm",
    logo: "https://raw.githubusercontent.com/Mintplex-Labs/anything-llm/master/images/wordmark.png",
    "pt-br": {
      tagline: "As respostas já estão nos seus documentos. Sua equipe só precisa perguntar.",
      description:
        "Muita informação importante fica perdida em contratos, manuais e relatórios que ninguém tem tempo de ler — e quando alguém precisa, depende de quem 'sabe onde está o arquivo'. Aqui qualquer pessoa pergunta e recebe a resposta na hora, com a indicação de onde ela saiu. Tudo fica dentro da sua empresa: documento sigiloso não vai para fora.",
      benefits: [
        "Sua equipe encontra qualquer informação na hora, sem caçar em pastas",
        "O conhecimento deixa de depender de uma ou duas pessoas que sabem de tudo",
        "Documentos sigilosos não saem da sua empresa",
        "Pronto para usar, sem precisar de equipe técnica",
      ],
      useCases: [
        "Atendimento que responde sobre regras e manuais sem chamar um humano",
        "Consulta rápida a contratos e relatórios",
        "Conhecimento que continua na empresa mesmo quando alguém sai",
      ],
    },
    en: {
      tagline: "The answers are already in your documents. Your team just has to ask.",
      description:
        "A lot of important information gets lost in contracts, manuals and reports nobody has time to read — and when someone needs it, they depend on whoever 'knows where the file is.' Here anyone asks and gets the answer right away, with a note on where it came from. Everything stays inside your company: confidential documents don't go out.",
      benefits: [
        "Your team finds any information instantly, with no folder hunting",
        "Knowledge stops depending on the one or two people who know everything",
        "Confidential documents never leave your company",
        "Ready to use, with no technical team needed",
      ],
      useCases: [
        "Support that answers questions about rules and manuals without a person",
        "Quick lookups across contracts and reports",
        "Knowledge that stays in the company even when someone leaves",
      ],
    },
  },

  metabase: {
    repo_url: "https://github.com/metabase/metabase",
    logo: "https://www.metabase.com/images/logo-with-wordmark.svg",
    "pt-br": {
      tagline: "Veja os números do seu negócio sozinho, sem pedir relatório e sem esperar dias.",
      description:
        "Toda vez que a direção precisa de um número e tem que pedir para a equipe técnica, a decisão espera dias. Aqui qualquer gestor pergunta em português e monta o próprio painel, sem depender de ninguém. Usa as informações dos sistemas que a empresa já tem, e os dados ficam com você.",
      benefits: [
        "Veja os números do negócio sem pedir relatório nem esperar dias",
        "Pergunte como se estivesse falando com uma pessoa, sem termos técnicos",
        "Um painel sempre atualizado, no lugar de planilha que envelhece",
        "Usa as informações dos sistemas que a empresa já tem",
      ],
      useCases: [
        "Painéis de vendas e operação para a gestão",
        "Acompanhar resultados do dia a dia",
        "Relatório para a direção que se atualiza sozinho",
      ],
    },
    en: {
      tagline: "See your business numbers yourself, without asking for a report or waiting days.",
      description:
        "Every time leadership needs a number and has to ask the technical team, the decision waits days. Here any manager asks in plain language and builds their own dashboard, with no one to depend on. It uses the information from the systems the company already has, and the data stays with you.",
      benefits: [
        "See the business numbers without asking for a report or waiting days",
        "Ask as if you were talking to a person, with no technical terms",
        "A dashboard that's always current, instead of a spreadsheet going stale",
        "Uses the information from the systems the company already has",
      ],
      useCases: [
        "Sales and operations dashboards for management",
        "Following day-to-day results",
        "A leadership report that updates itself",
      ],
    },
  },

  khoj: {
    repo_url: "https://github.com/khoj-ai/khoj",
    logo: "https://camo.githubusercontent.com/aceab34fe2adf75b48319e8893632fc4dcdace9cbb4e2910f7d4106f706f6b90/68747470733a2f2f6173736574732e6b686f6a2e6465762f6b686f6a2d6c6f676f2d73696465776179732d31323030783534302e706e67",
    "pt-br": {
      tagline: "Um assistente que responde com base nos seus documentos e mostra de onde tirou.",
      description:
        "Quando a informação está espalhada em anotações e arquivos, cada busca começa do zero. Este assistente reúne esse material e responde sempre indicando de onde tirou cada coisa — dá para confiar e conferir. Suas informações ficam protegidas, sob seu controle.",
      benefits: [
        "Toda resposta vem com a fonte: dá para conferir, não é no escuro",
        "Pesquisa nos seus próprios documentos em vez de recomeçar toda vez",
        "Funciona com as principais inteligências artificiais do mercado",
        "Suas informações ficam protegidas e sob seu controle",
      ],
      useCases: [
        "Pesquisa nos documentos da empresa, com a fonte de cada resposta",
        "Resumos e respostas a partir dos seus relatórios",
        "Apoio à equipe técnica sobre o próprio trabalho",
      ],
    },
    en: {
      tagline: "An assistant that answers from your documents and shows where it got it.",
      description:
        "When information is scattered across notes and files, every search starts from zero. This assistant gathers that material and always answers showing where it got each thing — you can trust it and check it. Your information stays protected, under your control.",
      benefits: [
        "Every answer comes with its source: you can check it, not work blind",
        "Searches your own documents instead of starting over every time",
        "Works with the main artificial intelligences on the market",
        "Your information stays protected and under your control",
      ],
      useCases: [
        "Search across company documents, with a source for every answer",
        "Summaries and answers from your reports",
        "Support for the technical team on their own work",
      ],
    },
  },

  twenty: {
    repo_url: "https://github.com/twentyhq/twenty",
    logo: "https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-website/public/images/core/logo.svg",
    "pt-br": {
      tagline: "Organize seus clientes e vendas sem a mensalidade dos programas conhecidos.",
      description:
        "Os programas conhecidos de gestão de clientes cobram caro por usuário e guardam sua carteira de clientes fora da empresa. Aqui você organiza contatos, empresas e negócios do jeito que o seu processo funciona, sem mensalidade por pessoa — e a sua carteira de clientes é sua.",
      benefits: [
        "Sem a mensalidade por usuário dos programas conhecidos",
        "Sua carteira de clientes fica com você, não com o fornecedor",
        "Organizado do jeito que o seu negócio funciona",
        "Conecta com e-mail e agenda",
      ],
      useCases: [
        "Acompanhar o funil de vendas e os contatos",
        "Relacionamento com o cliente depois da venda",
        "Organizar oportunidades do jeito da empresa",
      ],
    },
    en: {
      tagline: "Organize your customers and sales without the fee of the well-known programs.",
      description:
        "The well-known customer-management programs charge a lot per user and keep your customer base outside the company. Here you organize contacts, companies and deals the way your process works, with no per-person fee — and your customer base is yours.",
      benefits: [
        "No per-user fee like the well-known programs",
        "Your customer base stays with you, not with the vendor",
        "Organized the way your business works",
        "Connects with email and calendar",
      ],
      useCases: [
        "Following the sales funnel and contacts",
        "Customer relationships after the sale",
        "Organizing opportunities the company's way",
      ],
    },
  },

  chatwoot: {
    repo_url: "https://github.com/chatwoot/chatwoot",
    logo: "https://www.chatwoot.com/brand/on_white.png",
    "pt-br": {
      tagline: "Todo o atendimento ao cliente num lugar só, sem deixar ninguém sem resposta.",
      description:
        "Quando o cliente fala por WhatsApp, e-mail e redes sociais ao mesmo tempo, mensagem se perde e ninguém sabe quem já respondeu. Aqui tudo chega numa caixa só, com o histórico de cada cliente à mão, e um atendente automático cuida das perguntas repetidas. Sem pagar por atendente.",
      benefits: [
        "Nenhuma mensagem de cliente fica sem resposta",
        "A equipe vê toda a conversa com o cliente, não importa por onde ele falou",
        "Um atendente automático resolve o que é repetitivo e libera a equipe",
        "Sem mensalidade por atendente: crescer não custa mais caro",
      ],
      useCases: [
        "Atendimento por WhatsApp em grande volume",
        "Vários canais de contato numa fila só",
        "Central de atendimento interno",
      ],
    },
    en: {
      tagline: "All customer support in one place, with no one left without an answer.",
      description:
        "When a customer reaches out by WhatsApp, email and social media at once, messages slip through and nobody knows who already replied. Here everything lands in one inbox, with each customer's history on hand, and an automatic agent handles the repeated questions. No per-agent fee.",
      benefits: [
        "No customer message goes unanswered",
        "The team sees the whole conversation with a customer, whatever channel they used",
        "An automatic agent handles the repetitive part and frees the team",
        "No per-agent fee: growing doesn't cost more",
      ],
      useCases: [
        "High-volume WhatsApp support",
        "Several contact channels in a single queue",
        "Internal support desk",
      ],
    },
  },

  superset: {
    repo_url: "https://github.com/apache/superset",
    logo: "https://camo.githubusercontent.com/dc551298736c4cc5f9b23512ef7ca67e6a9304be4d2e06a0d3ff09b6491adb9b/68747470733a2f2f73757065727365742e6170616368652e6f72672f696d672f73757065727365742d6c6f676f2d686f72697a2d6170616368652e737667",
    "pt-br": {
      tagline: "Os números da empresa em painéis claros, e cada um vê só o que pode ver.",
      description:
        "As ferramentas de relatório mais robustas costumam cobrar por usuário, e a conta cresce junto com a empresa. Aqui você acompanha os números do negócio em painéis organizados e decide quem enxerga o quê — cada pessoa vê só os dados que lhe cabem. Sem mensalidade por usuário.",
      benefits: [
        "Acompanhe os números do negócio sem mensalidade por usuário",
        "Cada pessoa vê só os dados que pode ver",
        "A equipe de análise trabalha à vontade; a direção recebe o painel pronto",
        "Usa as informações dos sistemas que a empresa já tem",
      ],
      useCases: [
        "Painéis para a direção e para a operação",
        "Análises detalhadas pela equipe de dados",
        "Relatórios com controle de quem acessa o quê",
      ],
    },
    en: {
      tagline: "The company's numbers in clear dashboards, and each person sees only what they should.",
      description:
        "The more robust reporting tools usually charge per user, and the bill grows with the company. Here you follow the business numbers in organized dashboards and decide who sees what — each person sees only the data that's theirs. No per-user fee.",
      benefits: [
        "Follow the business numbers with no per-user fee",
        "Each person sees only the data they're allowed to",
        "The analysis team works freely; leadership gets the finished dashboard",
        "Uses the information from the systems the company already has",
      ],
      useCases: [
        "Dashboards for leadership and operations",
        "Detailed analysis by the data team",
        "Reports with control over who sees what",
      ],
    },
  },

  onyx: {
    repo_url: "https://github.com/onyx-dot-app/onyx",
    logo: "https://raw.githubusercontent.com/onyx-dot-app/onyx/logo/OnyxLogoCropped.jpg",
    "pt-br": {
      tagline: "Encontre qualquer informação espalhada pela empresa numa busca só.",
      description:
        "Numa empresa, a informação está em vários programas diferentes e quase ninguém acha o que precisa. Aqui uma única busca procura em todos eles de uma vez e mostra de onde veio a resposta. A equipe para de garimpar e quem entrou há pouco se vira sozinho.",
      benefits: [
        "Uma busca só procura em todos os programas da empresa",
        "A resposta vem com a fonte: dá para confiar",
        "Quem entrou há pouco encontra sozinho, sem interromper o time",
        "As informações ficam protegidas dentro da empresa",
      ],
      useCases: [
        "Encontrar informação espalhada pela empresa",
        "Ajudar quem acabou de entrar a se virar sozinho",
        "Assistente interno que conhece a empresa",
      ],
    },
    en: {
      tagline: "Find any information scattered across the company in a single search.",
      description:
        "In a company, information sits in several different programs and almost nobody finds what they need. Here a single search looks through all of them at once and shows where the answer came from. The team stops digging, and new hires manage on their own.",
      benefits: [
        "A single search looks through all the company's programs",
        "The answer comes with its source: you can trust it",
        "New hires find things on their own, without interrupting the team",
        "The information stays protected inside the company",
      ],
      useCases: [
        "Finding information scattered across the company",
        "Helping new hires manage on their own",
        "An internal assistant that knows the company",
      ],
    },
  },

  appflowy: {
    repo_url: "https://github.com/AppFlowy-IO/AppFlowy",
    logo: "https://pbs.twimg.com/profile_images/1455082143315496961/hZt2DeOJ.jpg",
    "pt-br": {
      tagline: "Os documentos e projetos da equipe num lugar só, sem pagar por pessoa.",
      description:
        "As ferramentas conhecidas de anotação e organização cobram por usuário e guardam tudo fora da sua empresa. Aqui a equipe escreve, organiza projetos e compartilha documentos num lugar só, sem que a conta cresça a cada pessoa que entra — e a informação fica com você.",
      benefits: [
        "A conta não aumenta a cada pessoa nova na equipe",
        "Documentos e anotações da equipe ficam com a empresa, não com terceiros",
        "Tudo no mesmo lugar: textos, projetos e tarefas",
        "Você não fica preso a um fornecedor que pode mudar o preço",
      ],
      useCases: [
        "Central de documentos e procedimentos da equipe",
        "Organização de projetos e tarefas",
        "Anotações compartilhadas entre o time",
      ],
    },
    en: {
      tagline: "The team's documents and projects in one place, without paying per person.",
      description:
        "The well-known note-taking and organizing tools charge per user and keep everything outside your company. Here the team writes, organizes projects and shares documents in one place, without the bill growing with every new hire — and the information stays with you.",
      benefits: [
        "The bill doesn't go up with every new person on the team",
        "Team documents and notes stay with the company, not a third party",
        "Everything in one place: text, projects and tasks",
        "You're not locked to a vendor that can change the price",
      ],
      useCases: [
        "A central place for team documents and procedures",
        "Organizing projects and tasks",
        "Shared notes across the team",
      ],
    },
  },

  dify: {
    repo_url: "https://github.com/langgenius/dify",
    logo: "https://pbs.twimg.com/profile_images/1998264604145963008/v__dR1kD.jpg",
    "pt-br": {
      tagline: "Coloque a IA pra trabalhar no seu negócio, sem precisar de equipe técnica.",
      description:
        "A maior parte das ideias com inteligência artificial morre na gaveta por falta de gente técnica para tirar do papel. Aqui você cria assistentes e automações que usam as informações da sua empresa, num lugar só, e pode trocar a inteligência por trás quando quiser, sem ficar preso a um fornecedor.",
      benefits: [
        "Uma ideia com inteligência artificial vira algo em uso, sem montar equipe técnica",
        "Não fica preso a um único fornecedor de inteligência artificial",
        "O que começa como teste vira ferramenta de verdade",
        "Os assistentes respondem com base nas informações da sua empresa",
      ],
      useCases: [
        "Assistentes de atendimento que conhecem a sua empresa",
        "Automações internas com inteligência artificial",
        "Tirar uma ideia do papel sem grande investimento técnico",
      ],
    },
    en: {
      tagline: "Put AI to work in your business, with no technical team.",
      description:
        "Most artificial-intelligence ideas die in a drawer for lack of technical people to make them real. Here you build assistants and automations that use your company's information, in one place, and you can swap the intelligence behind them whenever you want, without getting locked to a vendor.",
      benefits: [
        "An AI idea becomes something in use, without building a technical team",
        "You're not locked to a single AI vendor",
        "What starts as a test becomes a real tool",
        "The assistants answer based on your company's information",
      ],
      useCases: [
        "Support assistants that know your company",
        "Internal automations with artificial intelligence",
        "Turning an idea into reality without a big technical investment",
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

  ragflow: {
    repo_url: "https://github.com/infiniflow/ragflow",
    logo: "https://raw.githubusercontent.com/infiniflow/ragflow/main/web/src/assets/logo-with-text.svg",
    hero: "https://raw.githubusercontent.com/infiniflow/ragflow-docs/refs/heads/image/image/agentic-dark.gif",
    "pt-br": {
      tagline:
        "Pergunte sobre seus documentos mais complexos e receba respostas com a fonte.",
      description:
        "Contratos, manuais e relatórios cheios de tabelas e páginas difíceis de ler ficam parados. O RAGFlow entende esses documentos inteiros — inclusive tabelas e PDFs mal formatados — e responde indicando de onde tirou cada informação. Sua equipe pergunta e recebe a resposta na hora, sem depender de quem 'sabe onde está o arquivo'.",
      benefits: [
        "Lê documentos difíceis — PDFs longos, tabelas e formulários — que ferramentas comuns não conseguem",
        "Cada resposta vem com a fonte exata: dá para conferir e confiar",
        "O conhecimento da empresa para de ficar preso com uma ou duas pessoas",
        "Documentos sigilosos continuam dentro da sua empresa, sob seu controle",
      ],
      useCases: [
        "Consultar contratos, políticas e manuais técnicos sem ler tudo",
        "Extrair respostas de relatórios e propostas complexas",
        "Base de conhecimento interna com respostas sempre citadas",
      ],
    },
    en: {
      tagline:
        "Ask about your most complex documents and get answers with the source.",
      description:
        "Contracts, manuals and reports full of tables and hard-to-read pages just sit there. RAGFlow understands these documents whole — including tables and messy PDFs — and answers with a note on exactly where each piece came from. Your team asks and gets the answer right away, without depending on whoever 'knows where the file is.'",
      benefits: [
        "Reads difficult documents — long PDFs, tables, forms — that ordinary tools can't",
        "Every answer comes with its exact source: check it and trust it",
        "Company knowledge stops being locked with one or two people",
        "Confidential documents stay inside your company, under your control",
      ],
      useCases: [
        "Search contracts, policies and technical manuals without reading everything",
        "Pull answers from complex reports and proposals",
        "An internal knowledge base with every answer cited",
      ],
    },
  },

  librechat: {
    repo_url: "https://github.com/danny-avila/LibreChat",
    logo: "https://raw.githubusercontent.com/danny-avila/LibreChat/main/client/public/assets/logo.svg",
    hero: "https://www.librechat.ai/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fdemo_dark.50599d89.png&w=640&q=75",
    "pt-br": {
      tagline:
        "Todos os seus modelos de IA numa só conversa — escolha o melhor a cada pergunta.",
      description:
        "Em vez de ficar abrindo várias abas e contas para usar diferentes inteligências artificiais, o LibreChat reúne OpenAI, Anthropic, Gemini e outros num só lugar. A equipe conversa, compara respostas e usa presets e agentes prontos para o dia a dia, sem precisar configurar cada ferramenta separadamente.",
      benefits: [
        "Use OpenAI, Anthropic, Gemini e mais num só chat, sem trocar de conta",
        "Compare respostas lado a lado e escolha a melhor a cada tarefa",
        "Presets e agentes prontos aceleram o trabalho repetitivo da equipe",
        "Conversas e arquivos ficam hospedados na sua própria empresa",
      ],
      useCases: [
        "Centralizar o uso de IA da equipe num único painel",
        "Comparar modelos para escolher a melhor resposta",
        "Assistentes com presets para tarefas recorrentes (e-mails, resumos, suporte)",
      ],
    },
    en: {
      tagline:
        "All your AI models in one conversation — pick the best for each question.",
      description:
        "Instead of juggling multiple tabs and accounts to use different AIs, LibreChat brings OpenAI, Anthropic, Gemini and more into one place. The team chats, compares answers side by side, and uses ready-made presets and agents for daily work, without configuring each tool separately.",
      benefits: [
        "Use OpenAI, Anthropic, Gemini and more in one chat, no account switching",
        "Compare answers side by side and pick the best for each task",
        "Ready presets and agents speed up repetitive team work",
        "Conversations and files stay hosted in your own company",
      ],
      useCases: [
        "Centralize the team's AI use in a single panel",
        "Compare models to choose the best answer",
        "Assistants with presets for recurring tasks (emails, summaries, support)",
      ],
    },
  },
};

/** Conteúdo rico de um app, ou undefined se não houver entrada para o slug. */
export function getAppContent(slug: string): AppContent | undefined {
  return APP_CONTENT[slug];
}
