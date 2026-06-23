/**
 * Mensagens bilíngue (pt-br / en) — escopado às páginas localizadas (/catalog, /terms).
 *
 * O resto da aplicação permanece em inglês; apenas estas páginas são localizadas.
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
  "cat.chat": "Aimization Chat",
  "cat.assistant": "Aimization Assistente",
  "cat.platform": "Aimization Plataforma",
  "cat.notebooks": "Aimization Notebooks",
  "cat.data": "Aimization Dados",
  "cat.scraping": "Aimization Scraping",
  "cat.image": "Aimization Imagem",
  "cat.voice": "Aimization Voz",
  "cat.transcription": "Aimization Transcrição",
  "cat.automation": "Aimization Automação",
  "cat.crm": "Aimization CRM",
  "cat.docs": "Aimization Docs",

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

  // Página /terms — Termos de Uso
  "terms.title": "Termos de Uso",
  "terms.lastUpdated": "Última atualização: {date}",
  "terms.back": "Voltar",

  "terms.acceptance.title": "1. Aceitação dos termos",
  "terms.acceptance.body":
    "Ao acessar e utilizar a plataforma Suite AIMization (a “Plataforma”), você concorda com estes Termos de Uso. Caso não concorde com qualquer parte deles, não utilize a Plataforma.",

  "terms.platform.title": "2. Sobre a Plataforma",
  "terms.platform.body":
    "A Plataforma é um serviço que automatiza a instalação e a execução de aplicações de inteligência artificial de terceiros no seu próprio hardware (por exemplo, a NVIDIA DGX Spark). Ela atua apenas como uma camada de orquestração (baseada em contêineres Docker) e não desenvolve, hospeda, opera ou controla as aplicações em si.",

  "terms.responsibility.title": "3. Responsabilidade pelo uso das aplicações",
  "terms.responsibility.intro":
    "Você é o único e integral responsável pelo uso de cada aplicação que instalar e executar por meio da Plataforma. A Plataforma apenas facilita a instalação; ela não opera, monitora, fiscaliza ou endossa o conteúdo processado por essas ferramentas. Especificamente, você responde por:",
  "terms.responsibility.p1": "a forma como utiliza cada ferramenta instalada e pelos resultados obtidos;",
  "terms.responsibility.p2": "os dados, arquivos e informações que insere, processa ou gera nas aplicações;",
  "terms.responsibility.p3": "o cumprimento de todas as leis e regulamentos aplicáveis ao seu uso;",
  "terms.responsibility.p4":
    "quaisquer danos a terceiros decorrentes do uso indevido ou indevido das aplicações.",

  "terms.licenses.title": "4. Licenças das aplicações de terceiros",
  "terms.licenses.intro":
    "Cada aplicação disponível no catálogo é um software de terceiros (como Open WebUI, ComfyUI, n8n, JupyterLab, entre outras), regido por sua própria licença — que pode ser open-source, comercial ou de outro tipo. A Plataforma não concede nenhum direito sobre essas aplicações além daqueles já permitidos por suas respectivas licenças. Importante:",
  "terms.licenses.p1":
    "Ao instalar e utilizar uma aplicação, você concorda em respeitar os termos da licença específica dela.",
  "terms.licenses.p2":
    "É sua responsabilidade verificar e compreender a licença de cada ferramenta antes de utilizá-la (consulte o repositório oficial de cada aplicação para esses detalhes).",
  "terms.licenses.p3":
    "Eventuais restrições de uso, atribuição ou redistribuição são definidas exclusivamente pela licença de cada aplicação, não pela Plataforma.",

  "terms.acceptableUse.title": "5. Uso aceitável",
  "terms.acceptableUse.p1":
    "Você concorda em não utilizar a Plataforma nem as aplicações instaladas para finalidades ilegais ou para violar direitos de terceiros.",
  "terms.acceptableUse.p2":
    "É proibido utilizar as ferramentas para gerar, armazenar ou distribuir conteúdo que infrinja leis, direitos autorais, privacidade ou quaisquer direitos de terceiros.",
  "terms.acceptableUse.p3":
    "Você assume toda a responsabilidade por quaisquer consequências decorrentes de usos vedados.",

  "terms.data.title": "6. Dados e privacidade",
  "terms.data.body":
    "As aplicações são executadas na sua própria infraestrutura. A Plataforma não acessa, coleta nem armazena o conteúdo processado pelas aplicações. O tratamento dos dados — incluindo a responsabilidade por sua proteção e conformidade legal — é inteiramente seu.",

  "terms.warranties.title": "7. Ausência de garantias",
  "terms.warranties.body":
    "A Plataforma é fornecida “no estado em que se encontra”, sem qualquer garantia, expressa ou implícita, de funcionalidade, adequação a uma finalidade específica, disponibilidade contínua ou ausência de erros. As aplicações de terceiros estão sujeitas às limitações definidas por seus próprios desenvolvedores.",

  "terms.liability.title": "8. Limitação de responsabilidade",
  "terms.liability.body":
    "Na máxima extensão permitida pela legislação aplicável, a Plataforma e seus mantenedores não se responsabilizam por danos diretos, indiretos, incidentais ou consequenciais decorrentes do uso ou da impossibilidade de uso da Plataforma ou das aplicações instaladas, incluindo perda de dados, lucros cessantes ou interrupção de atividades.",

  "terms.changes.title": "9. Alterações destes Termos",
  "terms.changes.body":
    "Estes Termos podem ser atualizados a qualquer tempo. A versão mais recente estará sempre disponível nesta página, com a data de atualização indicada no topo. O uso continuado da Plataforma após mudanças equivale à aceitação dos novos termos.",

  "terms.contact.title": "10. Contato",
  "terms.contact.body":
    "Em caso de dúvidas sobre estes Termos de Uso, entre em contato pelo e-mail admin@aimization.com.",
};

const en: Dict = {
  "catalog.title": "App Catalog",
  "catalog.subtitle": "Browse and install AI applications with one click — no need to understand Docker, CUDA or Linux.",

  "catalog.searchPlaceholder": "Search applications...",
  "catalog.all": "All",
  "catalog.noResults": "No apps found",
  "catalog.noResultsHint": "Try adjusting your search or filters",

  "cat.chat": "Aimization Chat",
  "cat.assistant": "Aimization Assistant",
  "cat.platform": "Aimization Platform",
  "cat.notebooks": "Aimization Notebooks",
  "cat.data": "Aimization Data",
  "cat.scraping": "Aimization Scraping",
  "cat.image": "Aimization Image",
  "cat.voice": "Aimization Voice",
  "cat.transcription": "Aimization Transcription",
  "cat.automation": "Aimization Automation",
  "cat.crm": "Aimization CRM",
  "cat.docs": "Aimization Docs",

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

  // /terms page — Terms of Use
  "terms.title": "Terms of Use",
  "terms.lastUpdated": "Last updated: {date}",
  "terms.back": "Back",

  "terms.acceptance.title": "1. Acceptance of the terms",
  "terms.acceptance.body":
    "By accessing and using the Suite AIMization platform (the “Platform”), you agree to these Terms of Use. If you do not agree with any part of them, you must not use the Platform.",

  "terms.platform.title": "2. About the Platform",
  "terms.platform.body":
    "The Platform is a service that automates the installation and execution of third-party artificial intelligence applications on your own hardware (for example, the NVIDIA DGX Spark). It acts solely as an orchestration layer (based on Docker containers) and does not develop, host, operate, or control the applications themselves.",

  "terms.responsibility.title": "3. Responsibility for the use of applications",
  "terms.responsibility.intro":
    "You are solely and fully responsible for the use of each application you install and run through the Platform. The Platform only facilitates installation; it does not operate, monitor, supervise, or endorse the content processed by these tools. Specifically, you are responsible for:",
  "terms.responsibility.p1": "how you use each installed tool and the results you obtain;",
  "terms.responsibility.p2": "the data, files, and information you enter, process, or generate in the applications;",
  "terms.responsibility.p3": "compliance with all laws and regulations applicable to your use;",
  "terms.responsibility.p4": "any damages to third parties resulting from improper use of the applications.",

  "terms.licenses.title": "4. Licenses of third-party applications",
  "terms.licenses.intro":
    "Each application available in the catalog is third-party software (such as Open WebUI, ComfyUI, n8n, JupyterLab, among others), governed by its own license — which may be open-source, commercial, or otherwise. The Platform grants no rights over these applications beyond those already permitted by their respective licenses. Important:",
  "terms.licenses.p1":
    "By installing and using an application, you agree to comply with the terms of its specific license.",
  "terms.licenses.p2":
    "It is your responsibility to review and understand the license of each tool before using it (consult the official repository of each application for these details).",
  "terms.licenses.p3":
    "Any restrictions on use, attribution, or redistribution are defined exclusively by each application's license, not by the Platform.",

  "terms.acceptableUse.title": "5. Acceptable use",
  "terms.acceptableUse.p1":
    "You agree not to use the Platform or the installed applications for illegal purposes or to violate the rights of third parties.",
  "terms.acceptableUse.p2":
    "It is prohibited to use the tools to generate, store, or distribute content that infringes laws, copyrights, privacy, or any rights of third parties.",
  "terms.acceptableUse.p3":
    "You assume full responsibility for any consequences arising from prohibited uses.",

  "terms.data.title": "6. Data and privacy",
  "terms.data.body":
    "The applications run on your own infrastructure. The Platform does not access, collect, or store the content processed by the applications. Data handling — including responsibility for its protection and legal compliance — is entirely yours.",

  "terms.warranties.title": "7. No warranties",
  "terms.warranties.body":
    "The Platform is provided “as is”, without any warranty, express or implied, of functionality, fitness for a particular purpose, continuous availability, or absence of errors. Third-party applications are subject to the limitations defined by their own developers.",

  "terms.liability.title": "8. Limitation of liability",
  "terms.liability.body":
    "To the maximum extent permitted by applicable law, the Platform and its maintainers shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use the Platform or the installed applications, including loss of data, lost profits, or business interruption.",

  "terms.changes.title": "9. Changes to these Terms",
  "terms.changes.body":
    "These Terms may be updated at any time. The most recent version will always be available on this page, with the update date shown at the top. Continued use of the Platform after changes constitutes acceptance of the new terms.",

  "terms.contact.title": "10. Contact",
  "terms.contact.body":
    "If you have questions about these Terms of Use, please contact us at admin@aimization.com.",
};

export const MESSAGES: Record<Lang, Dict> = { "pt-br": ptBR, en };
