# Suite AIMization — AI App Platform for NVIDIA DGX

One-click AI app installer and manager for NVIDIA DGX machines. Like Softaculous, but for AI workloads — no Docker, CUDA, or Linux knowledge required.

> The public product name is **Suite AIMization**. The repository keeps its original technical name `IAnoIE` (clone path, module `ianoie`, network `ianoie-proxy`).

**Repository:** [github.com/Proage-Desenvolvimento/IAnoIE](https://github.com/Proage-Desenvolvimento/IAnoIE)

---

## 🇺🇸 English

### What is Suite AIMization?

Suite AIMization is a web platform that lets you install and manage AI applications on NVIDIA DGX machines with a single click. Deploy ComfyUI, JupyterLab, and more without touching Docker or the command line.

### Features

- **One-click installs** of 19 AI apps (Open WebUI, JupyterLab, ComfyUI, n8n, Dify, Flowise, Metabase, and more — see the full list below)
- **Bilingual catalog (PT/EN)** — manager-focused, with per-app benefits, use cases, and rich media (images, YouTube videos)
- **GPU passthrough** with live GPU monitoring (utilization, VRAM, temperature, power)
- **System monitoring** — CPU, RAM, disk, and network metrics with 24h history
- **LLM provider management** — register OpenAI/Gemini/Anthropic/Ollama keys (encrypted at rest) and inject them into your apps
- **Real-time container logs** streamed over WebSocket
- **Per-app configuration** — template-driven config forms (timezones, model settings, etc.)

### Architecture

```
Browser (React) → Traefik (:80/:443) → FastAPI (:8000) → PostgreSQL
                                          |→ Celery Worker → Docker Engine (socket)
                                          |→ Celery Beat → GPU Metrics (pynvml) + System Metrics (psutil)
                                 → Redis (broker + backend)
```

- **Traefik** discovers containers via Docker labels. The UI/API run on `Host(${APP_DOMAIN})`; each installed app gets its own subdomain `{slug}-{id}.${APP_DOMAIN}` with HTTPS via Let's Encrypt (one cert per app). Requires a wildcard DNS record `*.${APP_DOMAIN}` → your host, set to **DNS only (no Cloudflare proxy)** so the ACME HTTP-01 challenge on port 80 isn't intercepted
- **Celery** tasks use a synchronous session (psycopg2); FastAPI uses async (asyncpg)
- **YAML templates** define apps; a renderer converts them into Docker configs with Traefik labels + GPU device requests
- **LLM Providers** (OpenAI/Gemini/Anthropic/Ollama) are managed with API keys encrypted via Fernet; the default provider is injected into each app container

### Quick Start

Every push to `main` triggers a [GitHub Actions](./.github/workflows/build.yml) pipeline that builds and publishes Docker images to GHCR. You don't need to build anything — just clone, configure, and run.

#### Linux (NVIDIA DGX)

**1. Clone and run setup** (first time only):

```bash
git clone https://github.com/Proage-Desenvolvimento/IAnoIE.git
cd IAnoIE
sudo bash scripts/setup-dgx.sh
```

This installs Docker, NVIDIA Container Toolkit, and creates the `ianoie-proxy` network.

> **Other Linux distros / non-DGX VPS?** Use `sudo bash scripts/setup-vps.sh` instead — it supports Ubuntu/Debian/Alma/Rocky/CentOS/RHEL and only installs the NVIDIA toolkit when a GPU is detected.
>
> **Production shortcut:** `sudo bash scripts/install.sh` runs the full setup and auto-generates `JWT_SECRET` and `ENCRYPTION_KEY`.
>
> **SELinux?** Leave it in enforcing mode — compose bind mounts use the `:z` flag, so it works on RHEL/AlmaLinux/Rocky without disabling SELinux. `setup-vps.sh` reports the SELinux mode and warns if `container-selinux` is missing.

> **No git?** Run the setup directly:
> ```bash
> curl -fsSL https://raw.githubusercontent.com/Proage-Desenvolvimento/IAnoIE/main/scripts/setup-dgx.sh | sudo bash
> ```

**2. Configure environment**:

```bash
cp .env.example .env
```

Edit `.env` and change at minimum:
- `POSTGRES_PASSWORD` — database password
- `JWT_SECRET` — generate with `openssl rand -hex 32`
- `ENCRYPTION_KEY` — generate with `python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`
- `DEFAULT_ADMIN_PASSWORD` — admin user password

**3. Start the platform**:

```bash
docker compose -f docker/docker-compose.yml up -d
```

**4. Open in browser**: `http://<dgx-ip>` (port 80; HTTPS on 443 once `APP_DOMAIN`/`ACME_EMAIL` are set)

Default login: `admin@aimization.com` / `admin` (change the password after first login)

#### Windows (Docker Desktop)

Make sure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is installed and running with WSL 2 backend.

**1. Clone and create the network** (first time only):

```powershell
git clone https://github.com/Proage-Desenvolvimento/IAnoIE.git
cd IAnoIE
docker network create ianoie-proxy
```

**2. Configure environment**:

```powershell
copy .env.example .env
```

Edit `.env` and change at minimum:
- `POSTGRES_PASSWORD` — database password
- `JWT_SECRET` — generate with `openssl rand -hex 32`
- `ENCRYPTION_KEY` — generate with `python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`
- `DEFAULT_ADMIN_PASSWORD` — admin user password

**3. Start the platform**:

```powershell
docker compose -f docker/docker-compose.yml up -d
```

**4. Open in browser**: `http://localhost`

Default login: `admin@aimization.com` / `admin` (change the password after first login)

> **GPU support on Windows**: requires [NVIDIA CUDA on WSL](https://docs.nvidia.com/cuda/wsl-user-guide/index.html). Without it, apps install but won't have GPU access.

#### Updating an existing installation

This is a **build-from-source** deploy (the compose `build:`s the api/worker/beat/frontend images from your clone — no GHCR pull). Use the helper script, which runs `git pull` and rebuilds **only what changed**:

```bash
chmod +x scripts/update.sh                 # first time only
./scripts/update.sh                         # pull + rebuild what changed
./scripts/update.sh --backup                # pg_dump the database first
./scripts/update.sh --rebuild-all           # rebuild all source services
./scripts/update.sh --services "api worker beat frontend"  # only these
./scripts/update.sh --rollback              # revert to the previous commit + rebuild
```

The script inspects the diff and rebuilds just the affected services:

| What changed | Action |
|---|---|
| `templates/*.yaml` only | nothing — bind-mounted, already live |
| `backend/` | rebuild `api worker beat` |
| `frontend/` | rebuild `frontend` |
| `docker-compose.yml` / `.env` | recreate all services |
| New DB column on a model | **manual `ALTER TABLE`** — the app uses `create_all`, which does not run migrations |

Notes: `beat` shares the backend image, so it is rebuilt alongside `api`/`worker`. The seed (`seed_apps.py`) only runs on an empty database — changes don't apply to an already-seeded DB (use a manual `UPDATE`). Data in PostgreSQL/Redis volumes is preserved across updates.

### Available Apps

| App | Description |
|-----|-------------|
| **AnythingLLM** | RAG app — chat with your documents, build agents, multi-workspace and multi-user |
| **Apache Superset** | Data exploration and visualization — dashboards, charts and SQL editor over any DB |
| **AppFlowy** | Open-source Notion alternative (workspaces, wikis, realtime, AI) |
| **Chatwoot** | Omnichannel customer engagement — live chat, email and WhatsApp in one inbox |
| **ComfyUI** | Node-based Stable Diffusion UI for image generation (GPU recommended) |
| **Dify** | LLM app development platform — build agents, workflows, RAG and chatbots visually |
| **Flowise** | Visual low-code builder for LLM apps — drag-and-drop LangChain/LlamaIndex flows |
| **JupyterLab** | Interactive notebooks for data science (optional GPU) |
| **Khoj** | AI second brain — chat with your notes, docs and the web, with deep research |
| **Metabase** | Open-source BI — ask questions over your databases, no SQL required |
| **n8n** | Visual node-based workflow automation platform |
| **OmniVoice** | Zero-shot TTS with voice cloning and voice design for 600+ languages (GPU required) |
| **Onyx** | Enterprise AI assistant — chat, agents and search across all your company data |
| **Open Notebook** | Self-hosted NotebookLM alternative — multi-modal research, chat and podcasts |
| **Open WebUI** | ChatGPT-style web interface for local and cloud LLMs |
| **Scrapling** | Adaptive web scraping framework — stealth HTTP, real browsers, Cloudflare bypass |
| **Speakr** | AI-powered transcription and note-taking with speaker identification |
| **Twenty** | Open-source CRM — a modern alternative to Salesforce and Hubspot |
| **Voicebox** | Open-source AI voice studio — voice cloning, TTS in 23 languages, MCP |

### Customizing the Catalog

The `/catalog` page is bilingual (PT/EN, toggle in the header) and manager-focused: each app shows a tagline, **benefits as bullet points**, use cases, requirements, and optional media (image and/or YouTube video). All of this content lives in the frontend — no database or backend changes needed.

**Edit an app's marketing copy** — `frontend/src/content/apps.ts` (keyed by slug). Each entry has `{ hero?, video?, "pt-br": {...}, en: {...} }` with `tagline`, `description`, `benefits[]`, and `useCases[]`. Apps without an entry fall back to the API description.

**Add media:**
- **Image** — drop the file in `frontend/public/images/apps/<slug>.png` and set `hero: "/images/apps/<slug>.png"`.
- **YouTube video** — set `video: "https://youtu.be/..."` (supports `youtu.be`, `watch?v=`, `/embed/`, `/shorts/`). Renders as a thumbnail on the card and an embedded player in the detail view.
- Without `hero`/`video`, an automatic placeholder is shown.

Since this only touches `frontend/`, `./scripts/update.sh` rebuilds just the `frontend` service.

### CI/CD

[![Build & Push Docker Images](https://github.com/Proage-Desenvolvimento/IAnoIE/actions/workflows/build.yml/badge.svg)](https://github.com/Proage-Desenvolvimento/IAnoIE/actions/workflows/build.yml)

Every push to `main` automatically builds and publishes images:

| Image | GHCR |
|-------|------|
| API (backend) | `ghcr.io/proage-desenvolvimento/ianoie-api:latest` |
| Frontend | `ghcr.io/proage-desenvolvimento/ianoie-frontend:latest` |

Releases also publish semver-tagged images (e.g. `1.2.3`, `1.2`).

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11+ / FastAPI / SQLAlchemy / Celery |
| Frontend | React 19 / TypeScript / Tailwind CSS 4 |
| Database | PostgreSQL 16 |
| Message Broker | Redis 7 |
| Container Runtime | Docker + NVIDIA Container Toolkit |
| Reverse Proxy | Traefik v3.6 |

### Project Structure

```
IAnoIE/
├── backend/                  # Python (FastAPI)
│   ├── Dockerfile
│   └── src/ianoie/
│       ├── main.py           # App factory, lifespan
│       ├── config.py         # Pydantic Settings
│       ├── database.py       # async + sync engines
│       ├── api/v1/           # REST routes
│       ├── models/           # SQLAlchemy ORM models
│       ├── schemas/          # Pydantic request/response
│       ├── services/         # Business logic layer
│       ├── docker_ops/       # Docker SDK wrappers
│       ├── templates/        # YAML template engine
│       ├── workers/          # Celery tasks
│       └── core/             # Auth, exceptions, middleware
├── frontend/                 # React 19 + TypeScript + Tailwind 4
│   ├── Dockerfile
│   └── src/
│       ├── api/              # API client (ky + JWT)
│       ├── hooks/            # React Query hooks
│       ├── components/       # UI components
│       ├── pages/            # Page components
│       └── lib/              # Types, utils, constants
├── templates/                # 19 YAML app templates
├── docker/
│   ├── docker-compose.yml    # Base compose (builds from source)
│   ├── docker-compose.dev.yml # Infra-only for local dev
│   └── docker-compose.prod.yml # Production (GHCR images)
├── scripts/
│   ├── setup-dgx.sh         # DGX Spark (Ubuntu) provisioning
│   ├── setup-vps.sh         # Generic multi-OS VPS (Ubuntu/Debian/Alma/Rocky/CentOS/RHEL), GPU-aware
│   └── update.sh            # Update a git-clone install (pull + rebuild what changed)
└── .env.example
```

### Development

**Backend** (requires PostgreSQL and Redis running):

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"

# Start infra services only:
docker compose -f docker/docker-compose.dev.yml up postgres redis

# Run API:
python -m ianoie.main

# Run Celery worker:
celery -A ianoie.workers.celery_app:celery_app worker --loglevel=info

# Run Celery beat:
celery -A ianoie.workers.celery_app:celery_app beat --loglevel=info
```

**Frontend**:

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173, proxies /api → localhost:8000
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | `Suite AIMization` | Application name (public brand, shown in API title and system info) |
| `APP_DOMAIN` | `suite.aimization.com` | Public domain — base of each app's subdomain (`{slug}-{id}.${APP_DOMAIN}`) and the Traefik `Host` for the UI/API. Requires wildcard DNS `*.` → your host (lowercase) |
| `ACME_EMAIL` | `admin@aimization.com` | Let's Encrypt email (certificate issuance + expiry notices) |
| `DEBUG` | `false` | Debug mode |
| `POSTGRES_USER` | `ianoie` | PostgreSQL user |
| `POSTGRES_PASSWORD` | `change-me-in-production` | PostgreSQL password |
| `POSTGRES_DB` | `ianoie` | Database name |
| `DATABASE_URL` | `postgresql+asyncpg://...` | Async DB URL (FastAPI) |
| `DATABASE_URL_SYNC` | `postgresql+psycopg2://...` | Sync DB URL (Celery) |
| `DOCKER_HOST` | `unix:///var/run/docker.sock` | Docker socket |
| `DOCKER_TIMEOUT` | `120` | Docker client timeout (s) |
| `JWT_SECRET` | `change-me-to-a-random-secret-in-production` | JWT signing secret (`openssl rand -hex 32`) |
| `JWT_ALGORITHM` | `HS256` | JWT algorithm |
| `JWT_EXPIRE_HOURS` | `24` | Token expiration (hours) |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection |
| `CELERY_BROKER_URL` | `redis://localhost:6379/1` | Celery broker |
| `CELERY_RESULT_BACKEND` | `redis://localhost:6379/2` | Celery results |
| `ENCRYPTION_KEY` | `change-me-to-a-valid-fernet-key` | Fernet key to encrypt LLM provider API keys (**required**) |
| `GPU_POLL_INTERVAL_SECONDS` | `60` | GPU metrics interval |
| `GPU_METRICS_RETENTION_DAYS` | `7` | GPU metrics retention |
| `SYSTEM_METRICS_RETENTION_DAYS` | `7` | System metrics retention |
| `PORT_RANGE_START` | `9000` | Start of port range for apps |
| `PORT_RANGE_END` | `9999` | End of port range for apps |
| `TEMPLATES_HOST_PATH` | `/opt/ianoie/templates` | Templates path on host (mounted into containers) |
| `TEMPLATES_DIR` | `/app/templates` | YAML templates path (inside container) |
| `DEFAULT_ADMIN_EMAIL` | `admin@aimization.com` | Initial admin email |
| `DEFAULT_ADMIN_PASSWORD` | `change-me-in-production` | Initial admin password |

### Useful Commands

```bash
# View logs
docker compose -f docker/docker-compose.yml logs -f api worker

# Stop everything
docker compose -f docker/docker-compose.yml down

# Full reset (deletes volumes)
docker compose -f docker/docker-compose.yml down -v

# Check GPU access
docker run --rm --gpus all ubuntu nvidia-smi -L

# Backend lint
cd backend && ruff check src/

# Frontend build
cd frontend && npm run build
```

---

## 🇧🇷 Português

### O que é a Suite AIMization?

A Suite AIMization é uma plataforma web que permite instalar e gerenciar aplicações de IA em máquinas DGX da NVIDIA com um clique. Deploy de ComfyUI, JupyterLab e mais, sem precisar tocar em Docker ou linha de comando.

### Funcionalidades

- **Instalação com um clique** de 19 apps de IA (Open WebUI, JupyterLab, ComfyUI, n8n, Dify, Flowise, Metabase e mais — veja a lista completa abaixo)
- **Catálogo bilíngue (PT/EN)** — focado em gestor, com benefícios por app, casos de uso e mídia (imagens, vídeos do YouTube)
- **Passthrough de GPU** com monitoramento em tempo real (utilização, VRAM, temperatura, potência)
- **Monitoramento de sistema** — métricas de CPU, RAM, disco e rede com histórico de 24h
- **Gerenciamento de LLM providers** — cadastre chaves OpenAI/Gemini/Anthropic/Ollama (criptografadas em repouso) e injete nos seus apps
- **Logs de container em tempo real** via WebSocket
- **Configuração por app** — formulários de config baseados no template (fuso horário, ajustes de modelo, etc.)

### Arquitetura

```
Browser (React) → Traefik (:80/:443) → FastAPI (:8000) → PostgreSQL
                                          |→ Celery Worker → Docker Engine (socket)
                                          |→ Celery Beat → GPU Metrics (pynvml) + System Metrics (psutil)
                                 → Redis (broker + backend)
```

- O **Traefik** descobre containers via labels Docker. A UI/API rodam em `Host(${APP_DOMAIN})`; cada app instalado ganha seu próprio subdomínio `{slug}-{id}.${APP_DOMAIN}` com HTTPS via Let's Encrypt (um cert por app). Requer DNS wildcard `*.${APP_DOMAIN}` → seu host, em **DNS only (sem proxy do Cloudflare)** para o challenge ACME HTTP-01 na porta 80 não ser interceptado
- As tasks do **Celery** usam sessão síncrona (psycopg2); o FastAPI usa async (asyncpg)
- **Templates YAML** definem as apps; um renderer converte em configs Docker com labels Traefik + device requests de GPU
- **LLM Providers** (OpenAI/Gemini/Anthropic/Ollama) são gerenciados com chaves de API criptografadas via Fernet; o provider padrão é injetado no container de cada app

### Início Rápido

A cada push na `main`, uma [GitHub Actions](./.github/workflows/build.yml) compila e publica as imagens Docker no GHCR. Não precisa compilar nada — só clonar, configurar e rodar.

#### Linux (NVIDIA DGX)

**1. Clonar e rodar o setup** (só na primeira vez):

```bash
git clone https://github.com/Proage-Desenvolvimento/IAnoIE.git
cd IAnoIE
sudo bash scripts/setup-dgx.sh
```

Este script instala o Docker, o NVIDIA Container Toolkit e cria a rede `ianoie-proxy`.

> **Outras distros Linux / VPS fora da DGX?** Use `sudo bash scripts/setup-vps.sh` — suporta Ubuntu/Debian/Alma/Rocky/CentOS/RHEL e só instala o toolkit da NVIDIA quando detecta uma GPU.
>
> **Atalho de produção:** `sudo bash scripts/install.sh` faz o setup completo e gera automaticamente `JWT_SECRET` e `ENCRYPTION_KEY`.
>
> **SELinux?** Pode deixar em enforcing — os bind mounts do compose usam a flag `:z`, então funciona no RHEL/AlmaLinux/Rocky sem precisar desligar o SELinux. O `setup-vps.sh` informa o modo do SELinux e avisa se faltar o `container-selinux`.

> **Sem git?** Rode o setup direto da URL:
> ```bash
> curl -fsSL https://raw.githubusercontent.com/Proage-Desenvolvimento/IAnoIE/main/scripts/setup-dgx.sh | sudo bash
> ```

**2. Configurar o ambiente**:

```bash
cp .env.example .env
```

Edite o `.env` e altere no mínimo:
- `POSTGRES_PASSWORD` — senha do banco de dados
- `JWT_SECRET` — gere com `openssl rand -hex 32`
- `ENCRYPTION_KEY` — gere com `python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`
- `DEFAULT_ADMIN_PASSWORD` — senha do usuário admin

**3. Iniciar a plataforma**:

```bash
docker compose -f docker/docker-compose.yml up -d
```

**4. Abrir no navegador**: `http://<ip-da-dgx>` (porta 80; HTTPS na 443 quando `APP_DOMAIN`/`ACME_EMAIL` estiverem configurados)

Login padrão: `admin@aimization.com` / `admin` (altere a senha após o primeiro login)

#### Windows (Docker Desktop)

Certifique-se de que o [Docker Desktop](https://www.docker.com/products/docker-desktop/) está instalado e rodando com backend WSL 2.

**1. Clonar e criar a rede** (só na primeira vez):

```powershell
git clone https://github.com/Proage-Desenvolvimento/IAnoIE.git
cd IAnoIE
docker network create ianoie-proxy
```

**2. Configurar o ambiente**:

```powershell
copy .env.example .env
```

Edite o `.env` e altere no mínimo:
- `POSTGRES_PASSWORD` — senha do banco de dados
- `JWT_SECRET` — gere com `openssl rand -hex 32`
- `ENCRYPTION_KEY` — gere com `python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`
- `DEFAULT_ADMIN_PASSWORD` — senha do usuário admin

**3. Iniciar a plataforma**:

```powershell
docker compose -f docker/docker-compose.yml up -d
```

**4. Abrir no navegador**: `http://localhost`

Login padrão: `admin@aimization.com` / `admin` (altere a senha após o primeiro login)

> **Suporte a GPU no Windows**: requer [NVIDIA CUDA on WSL](https://docs.nvidia.com/cuda/wsl-user-guide/index.html). Sem isso, os apps instalam mas não terão acesso à GPU.

#### Atualizando uma instalação existente

Este é um deploy **build-from-source** (o compose faz `build:` das imagens api/worker/beat/frontend a partir do seu clone — sem pull do GHCR). Use o script de update, que faz `git pull` e rebuilda **só o que mudou**:

```bash
chmod +x scripts/update.sh                 # só na primeira vez
./scripts/update.sh                         # pull + rebuild do que mudou
./scripts/update.sh --backup                # faz pg_dump do banco antes
./scripts/update.sh --rebuild-all           # rebuild de todos os serviços source
./scripts/update.sh --services "api worker beat frontend"  # só esses
./scripts/update.sh --rollback              # volta pro commit anterior + rebuild
```

O script inspeciona o diff e rebuilda apenas os serviços afetados:

| O que mudou | Ação |
|---|---|
| Só `templates/*.yaml` | nada — bind-mounted, já está live |
| `backend/` | rebuild `api worker beat` |
| `frontend/` | rebuild `frontend` |
| `docker-compose.yml` / `.env` | recria todos os serviços |
| Nova coluna em um modelo | **`ALTER TABLE` manual** — o app usa `create_all`, não roda migration |

Observações: o `beat` compartilha a imagem do backend, então é rebuildado junto com `api`/`worker`. A seed (`seed_apps.py`) só roda em banco vazio — mudanças não se aplicam a um DB já populado (use `UPDATE` manual). Os dados dos volumes do PostgreSQL/Redis são preservados entre updates.

### Aplicativos Disponíveis

| App | Descrição |
|-----|-----------|
| **AnythingLLM** | App de RAG — converse com seus documentos, crie agentes, multi-workspace e multiusuário |
| **Apache Superset** | Exploração e visualização de dados — dashboards, gráficos e SQL sobre qualquer banco |
| **AppFlowy** | Alternativa open-source ao Notion (workspaces, wikis, tempo real, IA) |
| **Chatwoot** | Engajamento de cliente omnichannel — chat, e-mail e WhatsApp numa só caixa |
| **ComfyUI** | UI node-based do Stable Diffusion para geração de imagens (GPU recomendada) |
| **Dify** | Plataforma de desenvolvimento de apps LLM — crie agentes, workflows, RAG e chatbots |
| **Flowise** | Construtor visual low-code de apps LLM — fluxos LangChain/LlamaIndex em drag-and-drop |
| **JupyterLab** | Notebooks interativos para ciência de dados (GPU opcional) |
| **Khoj** | Segundo cérebro de IA — converse com suas notas, docs e a web, com pesquisa profunda |
| **Metabase** | BI open-source — faça perguntas aos seus bancos de dados, sem SQL |
| **n8n** | Plataforma de automação de workflows visual baseada em nós |
| **OmniVoice** | TTS zero-shot com clonagem e design de voz para 600+ idiomas (requer GPU) |
| **Onyx** | Assistente de IA empresarial — chat, agentes e busca sobre todos os dados da empresa |
| **Open Notebook** | Alternativa self-hosted ao NotebookLM — pesquisa multimodal, chat e podcasts |
| **Open WebUI** | Interface web estilo ChatGPT para LLMs locais e na nuvem |
| **Scrapling** | Framework de web scraping adaptativo — HTTP stealth, navegadores reais, bypass de Cloudflare |
| **Speakr** | Transcrição e anotações com IA, com identificação de falantes |
| **Twenty** | CRM open-source — alternativa moderna a Salesforce e Hubspot |
| **Voicebox** | Estúdio de voz com IA open-source — clonagem de voz, TTS em 23 idiomas, MCP |

### Customizando o Catálogo

A página `/catalog` é bilíngue (PT/EN, toggle no header) e focada em gestor: cada app mostra tagline, **benefícios em tópicos**, casos de uso, requisitos e mídia opcional (imagem e/ou vídeo do YouTube). Todo esse conteúdo vive no frontend — não precisa mexer no banco nem no backend.

**Editar a copy de um app** — `frontend/src/content/apps.ts` (indexado por slug). Cada entrada tem `{ hero?, video?, "pt-br": {...}, en: {...} }` com `tagline`, `description`, `benefits[]` e `useCases[]`. Apps sem entrada usam a descrição da API como fallback.

**Adicionar mídia:**
- **Imagem** — coloque o arquivo em `frontend/public/images/apps/<slug>.png` e sete `hero: "/images/apps/<slug>.png"`.
- **Vídeo do YouTube** — sete `video: "https://youtu.be/..."` (aceita `youtu.be`, `watch?v=`, `/embed/`, `/shorts/`). Vira thumbnail no card e player embutido no detalhe.
- Sem `hero`/`video`, um placeholder automático é exibido.

Como só mexe no `frontend/`, o `./scripts/update.sh` rebuilda só o serviço `frontend`.

### CI/CD

[![Build & Push Docker Images](https://github.com/Proage-Desenvolvimento/IAnoIE/actions/workflows/build.yml/badge.svg)](https://github.com/Proage-Desenvolvimento/IAnoIE/actions/workflows/build.yml)

A cada push na `main` as imagens são compiladas e publicadas automaticamente:

| Imagem | GHCR |
|--------|------|
| API (backend) | `ghcr.io/proage-desenvolvimento/ianoie-api:latest` |
| Frontend | `ghcr.io/proage-desenvolvimento/ianoie-frontend:latest` |

Releases também publicam imagens com tags semver (ex: `1.2.3`, `1.2`).

### Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Backend | Python 3.11+ / FastAPI / SQLAlchemy / Celery |
| Frontend | React 19 / TypeScript / Tailwind CSS 4 |
| Banco de Dados | PostgreSQL 16 |
| Message Broker | Redis 7 |
| Runtime de Containers | Docker + NVIDIA Container Toolkit |
| Proxy Reverso | Traefik v3.6 |

### Estrutura do Projeto

```
IAnoIE/
├── backend/                  # Python (FastAPI)
│   ├── Dockerfile
│   └── src/ianoie/
│       ├── main.py           # App factory, lifespan
│       ├── config.py         # Pydantic Settings
│       ├── database.py       # Engines async + sync
│       ├── api/v1/           # Rotas REST
│       ├── models/           # Modelos SQLAlchemy ORM
│       ├── schemas/          # Request/response Pydantic
│       ├── services/         # Camada de negócio
│       ├── docker_ops/       # Wrappers do Docker SDK
│       ├── templates/        # Engine de templates YAML
│       ├── workers/          # Tasks Celery
│       └── core/             # Auth, exceptions, middleware
├── frontend/                 # React 19 + TypeScript + Tailwind 4
│   ├── Dockerfile
│   └── src/
│       ├── api/              # Cliente API (ky + JWT)
│       ├── hooks/            # Hooks React Query
│       ├── components/       # Componentes UI
│       ├── pages/            # Componentes de página
│       └── lib/              # Tipos, utils, constantes
├── templates/                # 19 templates YAML de apps
├── docker/
│   ├── docker-compose.yml    # Compose base (builda do fonte)
│   ├── docker-compose.dev.yml # Apenas infra p/ dev local
│   └── docker-compose.prod.yml # Produção (imagens GHCR)
├── scripts/
│   ├── setup-dgx.sh         # Provisionamento DGX Spark (Ubuntu)
│   ├── setup-vps.sh         # VPS genérico multi-OS (Ubuntu/Debian/Alma/Rocky/CentOS/RHEL), detecta GPU
│   └── update.sh            # Atualiza instalação git-clone (pull + rebuild do que mudou)
└── .env.example
```

### Desenvolvimento

**Backend** (requer PostgreSQL e Redis rodando):

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"

# Subir apenas serviços de infra:
docker compose -f docker/docker-compose.dev.yml up postgres redis

# Rodar API:
python -m ianoie.main

# Rodar Celery worker:
celery -A ianoie.workers.celery_app:celery_app worker --loglevel=info

# Rodar Celery beat:
celery -A ianoie.workers.celery_app:celery_app beat --loglevel=info
```

**Frontend**:

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173, proxy /api → localhost:8000
```

### Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `APP_NAME` | `Suite AIMization` | Nome da aplicação (marca pública, exibida no título da API e system info) |
| `APP_DOMAIN` | `suite.aimization.com` | Domínio público — base do subdomínio de cada app (`{slug}-{id}.${APP_DOMAIN}`) e `Host` do Traefik para UI/API. Requer DNS wildcard `*.` → seu host (lowercase) |
| `ACME_EMAIL` | `admin@aimization.com` | E-mail do Let's Encrypt (emissão + aviso de expiração do certificado) |
| `DEBUG` | `false` | Modo debug |
| `POSTGRES_USER` | `ianoie` | Usuário do PostgreSQL |
| `POSTGRES_PASSWORD` | `change-me-in-production` | Senha do PostgreSQL |
| `POSTGRES_DB` | `ianoie` | Nome do banco |
| `DATABASE_URL` | `postgresql+asyncpg://...` | URL async do banco (FastAPI) |
| `DATABASE_URL_SYNC` | `postgresql+psycopg2://...` | URL sync do banco (Celery) |
| `DOCKER_HOST` | `unix:///var/run/docker.sock` | Socket Docker |
| `DOCKER_TIMEOUT` | `120` | Timeout do client Docker (s) |
| `JWT_SECRET` | `change-me-to-a-random-secret-in-production` | Secret de assinatura JWT (`openssl rand -hex 32`) |
| `JWT_ALGORITHM` | `HS256` | Algoritmo do JWT |
| `JWT_EXPIRE_HOURS` | `24` | Expiração do token (horas) |
| `REDIS_URL` | `redis://localhost:6379/0` | Conexão Redis |
| `CELERY_BROKER_URL` | `redis://localhost:6379/1` | Broker do Celery |
| `CELERY_RESULT_BACKEND` | `redis://localhost:6379/2` | Resultados do Celery |
| `ENCRYPTION_KEY` | `change-me-to-a-valid-fernet-key` | Chave Fernet p/ criptografar chaves de API dos LLM providers (**obrigatório**) |
| `GPU_POLL_INTERVAL_SECONDS` | `60` | Intervalo de métricas GPU |
| `GPU_METRICS_RETENTION_DAYS` | `7` | Retenção de métricas GPU |
| `SYSTEM_METRICS_RETENTION_DAYS` | `7` | Retenção de métricas de sistema |
| `PORT_RANGE_START` | `9000` | Início da faixa de portas p/ apps |
| `PORT_RANGE_END` | `9999` | Fim da faixa de portas p/ apps |
| `TEMPLATES_HOST_PATH` | `/opt/ianoie/templates` | Caminho dos templates no host (montado nos containers) |
| `TEMPLATES_DIR` | `/app/templates` | Caminho dos templates YAML (dentro do container) |
| `DEFAULT_ADMIN_EMAIL` | `admin@aimization.com` | Email do admin inicial |
| `DEFAULT_ADMIN_PASSWORD` | `change-me-in-production` | Senha do admin inicial |

### Comandos Úteis

```bash
# Ver logs
docker compose -f docker/docker-compose.yml logs -f api worker

# Parar tudo
docker compose -f docker/docker-compose.yml down

# Reset completo (remove volumes)
docker compose -f docker/docker-compose.yml down -v

# Verificar acesso à GPU
docker run --rm --gpus all ubuntu nvidia-smi -L

# Lint do backend
cd backend && ruff check src/

# Build do frontend
cd frontend && npm run build
```
