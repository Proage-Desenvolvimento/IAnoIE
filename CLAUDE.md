# IAnoIE — GPU AI App Platform for NVIDIA DGX Spark

Plataforma web tipo Softaculous para instalar e gerenciar aplicações de IA na NVIDIA DGX Spark com um clique. Usuário não precisa entender Docker, CUDA ou Linux.

**Hardware alvo:** NVIDIA DGX Spark (1x GB10 Grace Blackwell SoC, 128 GB unified memory, desktop)
**Organização:** Proage-Desenvolvimento (Brasil)
**Stack:** Python 3.11+ / FastAPI / PostgreSQL / Celery + Redis / React 19 + TypeScript / Tailwind CSS / Traefik

---

## Arquitetura

```
Browser (React) -> Traefik (:8888) -> FastAPI (:8000) -> PostgreSQL
                                            |-> Celery Worker -> Docker Engine (socket)
                                            |-> Celery Beat -> GPU Metrics (pynvml) + System Metrics (psutil)
                                   -> Redis (broker + backend)
```

- Traefik (porta host 8888) descobre containers via labels Docker e faz roteamento por path `/app/{id}/`
- Celery tasks usam sessão síncrona (psycopg2); FastAPI usa async (asyncpg)
- Templates YAML definem apps; renderer converte em configs Docker com labels Traefik + GPU device_requests
- LLM Providers (OpenAI/Gemini/Anthropic/Ollama): chaves de API criptografadas com Fernet em `core/crypto.py`; o provider padrão é injetado como variável de ambiente no container da instalação

---

## Estrutura do Projeto

```
IAnoIE/
├── backend/                  # Python (FastAPI)
│   ├── pyproject.toml        # deps: fastapi, sqlalchemy[asyncio], asyncpg, celery[redis], docker, pynvml, etc.
│   ├── Dockerfile
│   └── src/ianoie/
│       ├── main.py           # App factory, lifespan (create_all + seed)
│       ├── config.py         # Pydantic Settings (.env)
│       ├── database.py       # async engine (asyncpg) + sync engine (psycopg2) + session factories
│       ├── api/v1/           # Rotas: auth, apps, installations, jobs, gpu, logs (ws), system, llm_providers
│       ├── models/           # SQLAlchemy ORM: User, App, Installation, AppLog, GPUMetrics, Job, LLMProvider, SystemMetrics
│       ├── schemas/          # Pydantic request/response
│       ├── services/         # Camada de negócio: InstallationService, LLMProviderService (CRUD + teste + crypto)
│       ├── docker_ops/       # Docker SDK: ContainerManager, ImageManager, NetworkManager, VolumeManager, GPUDetector
│       ├── templates/        # Template engine: loader.py (YAML), renderer.py (-> ContainerConfig)
│       ├── workers/          # Celery: celery_app.py, tasks/{install,uninstall,gpu_monitor,system_monitor,reconfigure}.py
│       ├── core/             # security.py (JWT+bcrypt), exceptions.py, middleware.py, crypto.py (Fernet)
│       └── seed/             # seed_apps.py (6 apps + admin user)
├── frontend/                 # React 19 + TypeScript + Tailwind 4
│   ├── package.json          # deps: react, react-router-dom, @tanstack/react-query, recharts, lucide-react, ky, zod, react-hook-form
│   ├── vite.config.ts        # proxy /api -> localhost:8000
│   └── src/
│       ├── api/              # client.ts (ky com JWT interceptor) + endpoints: auth, apps, installations, jobs, gpu, llm-providers, system
│       ├── hooks/            # useAuth, useApps, useInstallations, useGpuMetrics, useLogStream, useJobPolling, useLLMProviders, useSystemMetrics
│       ├── components/
│       │   ├── ui/           # Button, Badge, Card, Dialog, Progress, Spinner, EmptyState, StatusBadge
│       │   ├── layout/       # AppShell (sidebar+outlet), Sidebar (nav+logout)
│       │   ├── logs/         # LogViewer (terminal-style, WebSocket streaming, filter, auto-scroll)
│       │   └── config/       # ConfigForm (formulário dinâmico a partir dos config_fields do template)
│       ├── pages/            # Login, Dashboard, Catalog, MyApps, AppDetail, GpuMonitor, LLMProviders, SystemMonitor
│       └── lib/              # types.ts, utils.ts (cn, formatBytes), constants.ts
├── templates/                # 6 YAML app templates: open-webui, jupyterlab, comfyui, n8n, omnivoice, speakr
├── docker/
│   ├── docker-compose.yml    # postgres, redis, api, worker, beat, frontend, traefik (porta host 8888)
│   ├── docker-compose.dev.yml
│   ├── docker-compose.prod.yml
│   ├── traefik/              # config dinâmica do Traefik
│   └── omnivoice/            # Dockerfile do app OmniVoice
├── scripts/
│   ├── setup-dgx.sh         # DGX Spark (Ubuntu): Docker + NVIDIA Container Toolkit + rede
│   ├── setup-vps.sh         # VPS genérico multi-OS (Ubuntu/Debian/Alma/Rocky/CentOS/RHEL), detecta GPU
│   ├── install.sh           # Instalação de produção (auto-gera JWT_SECRET e ENCRYPTION_KEY)
│   ├── update.sh            # Atualiza instalação git-clone (git pull + rebuild do que mudou; --backup/--rollback)
│   └── backup.sh            # Backup de volumes/dados
└── .env.example
```

---

## O que já foi construído

### Backend (completo)
- [x] FastAPI app com lifespan (auto-create tables + seed)
- [x] PostgreSQL via asyncpg (FastAPI) + psycopg2 (Celery)
- [x] 8 modelos SQLAlchemy: User (+UserRole admin/user), App, Installation, AppLog, GPUMetrics, Job, LLMProvider (+LLMProviderType), SystemMetrics
- [x] JWT auth (login, register, /me) com bcrypt
- [x] CRUD de apps com paginação, filtro por categoria, busca (+ endpoint de template-config)
- [x] CRUD de installations com service layer (InstallationService) + PATCH de config (reconfigure)
- [x] Celery app com broker Redis, beat schedule (GPU metrics a cada 60s + System metrics a cada 30s)
- [x] Tasks: install_app, uninstall_app, start_app, stop_app, restart_app, collect_gpu_metrics, collect_system_metrics, reconfigure_app
- [x] Template engine: loader (YAML -> dict), renderer (dict -> ContainerConfig com labels Traefik)
- [x] Docker ops: ContainerManager (create/start/stop/remove/wait_healthy), ImageManager, NetworkManager, VolumeManager
- [x] GPUDetector via pynvml (util, vram, temp, power, uuid)
- [x] System Monitor via psutil (CPU, memória, disco, rede) com retenção configurável
- [x] LLM Providers: CRUD + teste de conexão (OpenAI/Gemini/Anthropic/Ollama) + toggle de provider padrão, chaves de API criptografadas com Fernet (`core/crypto.py`)
- [x] WebSocket endpoint para stream de logs de container
- [x] SecurityHeadersMiddleware (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- [x] Seed de 6 apps + admin user padrão (admin@aimization.com / admin)
- [x] 6 templates YAML de apps prontos (open-webui, jupyterlab, comfyui, n8n, omnivoice, speakr)

### Frontend (completo)
- [x] 8 componentes UI reutilizáveis (Button, Badge, Card, Dialog, Progress, Spinner, EmptyState, StatusBadge)
- [x] LogViewer terminal-style com WebSocket, filtro, pause, auto-scroll
- [x] ConfigForm: formulário dinâmico gerado a partir dos config_fields do template (string/select/boolean/number)
- [x] 8 páginas: Login, Dashboard, Catalog, MyApps, AppDetail, GpuMonitor, LLMProviders, SystemMonitor
- [x] Catalog: busca + filtro por categoria, cards com ícone/cor por categoria, dialog de install com GPU selector e config form, progress bar em tempo real via polling de job
- [x] MyApps: lista com status badge, lifecycle controls (start/stop/restart/uninstall), inline log viewer expandível, edição de config (reconfigure)
- [x] AppDetail: detalhes da instalação + log viewer full + controls
- [x] Dashboard: stats cards, running apps, GPU overview com bars
- [x] GpuMonitor: cards por GPU com utilization/VRAM bars, temp color-coded, power/metrics
- [x] LLMProviders: CRUD de providers, teste de conexão, definir provider padrão
- [x] SystemMonitor: métricas em tempo real (CPU/RAM/disco/rede) com histórico de 24h (recharts)
- [x] API client com JWT interceptor (ky), 8 módulos de API (+ llm-providers, system)
- [x] 8 hooks: useAuth, useApps, useInstallations, useGpuMetrics, useLogStream, useJobPolling, useLLMProviders, useSystemMetrics

### Infraestrutura (completo)
- [x] docker-compose.yml com 7 serviços: postgres, redis, api, worker, beat, frontend, traefik (porta host 8888)
- [x] docker-compose.dev.yml (apenas infra p/ dev) e docker-compose.prod.yml (imagens GHCR)
- [x] Compatível com SELinux enforcing (RHEL/AlmaLinux/Rocky): todos os bind mounts do host usam `:z` (`docker-compose.yml`, `.dev.yml`, `.prod.yml`); `setup-vps.sh` informa o modo do SELinux e checa `container-selinux`. Removido o mount morto `/proc:/host_proc:ro` do serviço `api` (nenhum código lê `/host_proc`)
- [x] Dockerfiles para backend (python:3.11-slim + libpq), frontend (node build + nginx) e omnivoice (build próprio)
- [x] nginx.conf com proxy /api/ -> backend
- [x] setup-dgx.sh (DGX Spark/Ubuntu) e setup-vps.sh (VPS genérico multi-OS) para provisionamento
- [x] install.sh / update.sh / backup.sh para gerenciar instalação de produção
- [x] GitHub Actions (build.yml) publica imagens api/frontend no GHCR a cada push na main + em releases

---

## O que ainda precisa ser feito

### Crítico (para rodar)
> Concluído
- [x] `npm install` no frontend e testar `npm run build` sem erros
- [x] Criar a rede Docker: `docker network create ianoie-proxy`
- [x] Subir o stack: `docker compose -f docker/docker-compose.yml up -d`
- [x] Testar o fluxo completo: login -> catalog -> install -> logs -> manage
- [x] Corrigir qualquer erro de import ou tipo que aparecer ao rodar

### Backend — Melhorias
- [ ] Alembic migrations (atualmente usa `create_all` no lifespan)
- [ ] Testes unitários (pytest + mocked Docker client)
- [ ] Testes de integração (docker-compose + API calls)
- [ ] Rate limiting com slowapi nos endpoints de auth
- [ ] Docker socket proxy (tecnativa/docker-socket-proxy) para produção
- [x] Encriptação de secrets com Fernet — implementado em `core/crypto.py` para chaves de API dos LLM providers
- [x] Health check endpoint do Celery worker — `GET /api/v1/worker/health` (auth de usuário) em `api/v1/worker.py` + `services/worker_service.py` (Celery `control.ping`/`inspect` via `asyncio.to_thread`); healthcheck do container `worker` no `docker-compose.yml` (`celery inspect ping | grep -q pong`); card de status no SystemMonitor (frontend)
- [ ] Graceful shutdown do worker (cleanup containers órfãos)
- [x] Retry logic melhorada no install_app — rollback de containers criados parcialmente no `except` (install.py e reconfigure.py removem os containers parciais antes do retry, evitando a cascata de 409 name-conflict). Readiness gate por **check TCP** no worker (`wait_for_port`) em vez do healthcheck do Docker (as imagens não têm `curl`); o `container_manager` não injeta mais healthcheck curl
- [ ] Logs de instalação salvos no banco (AppLog) não apenas streamed

### Frontend — Melhorias
- [ ] Skeleton loaders reais (substituir os divs com animate-pulse)
- [ ] Toast notifications (sonner ou similar) para feedback de ações
- [ ] Error boundary para capturar erros React
- [ ] Refresh automático da lista de installations quando um job completa
- [ ] Polling de status das installations (não só jobs)
- [ ] Indicador visual de "new app available" no sidebar
- [ ] Responsividade mobile (sidebar collapsível)
- [ ] Dark mode (Tailwind já suporta, falta adicionar o toggle)

### Funcionalidades — Fase 2
- [ ] Multi-user com roles (admin/user/viewer)
- [ ] Backup/restore de volumes
- [ ] App update flow (pull new image, recreate container)
- [ ] Custom domain por app
- [ ] HTTPS com Let's Encrypt (Traefik TLS + cert resolver)
- [ ] Dashboard de uso de recursos (CPU/memória por container)

### Funcionalidades — Fase 3
- [ ] Kubernetes (Helm chart, pod-based lifecycle)
- [ ] NVIDIA NGC integration (browse/pull NGC containers)
- [ ] Marketplace (templates comunitários com upload)
- [ ] SSO/SAML
- [ ] Audit logging
- [ ] Billing/quotas

---

## Como rodar

### Desenvolvimento local

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
# Precisa de PostgreSQL e Redis rodando localmente, ou usar docker-compose só pra infra:
docker compose -f docker/docker-compose.dev.yml up postgres redis

# Frontend
cd frontend
npm install
npm run dev   # http://localhost:5173, proxy /api -> localhost:8000
```

### Docker Compose (produção)

```bash
# Primeira vez na DGX Spark (Ubuntu)
sudo bash scripts/setup-dgx.sh
# ...ou em VPS genérico (Ubuntu/Debian/Alma/Rocky/CentOS/RHEL) — detecta GPU e instala o toolkit se houver:
sudo bash scripts/setup-vps.sh
# SELinux pode ficar em enforcing (RHEL/AlmaLinux): os bind mounts do compose já usam :z

# Subir tudo
docker network create ianoie-proxy
cp .env.example .env  # editar senhas/secret + ENCRYPTION_KEY (Fernet)
docker compose -f docker/docker-compose.yml up -d
# (produção: rode `sudo bash scripts/install.sh` — ele auto-gera JWT_SECRET e ENCRYPTION_KEY)

# Acessar: http://<dgx-spark-ip>:8888
# Login: admin@aimization.com / admin
```

### Atualizar instalação de produção (deploy via git clone)

O deploy da VPS (kano.make2.com.br) é **build from source** (git clone + `build:` no compose) — **não usa GHCR**. Atualize com `scripts/update.sh`, que faz `git pull` e rebuilda **só o que mudou**:

```bash
./scripts/update.sh                  # pull + rebuild do que mudou
./scripts/update.sh --backup         # pg_dump do banco antes
./scripts/update.sh --rebuild-all    # força rebuild dos 4 (api worker beat frontend)
./scripts/update.sh --services "api worker beat"   # só esses
./scripts/update.sh --rollback       # volta pro commit anterior + rebuild
```

O script detecta sozinho o que rebuildar (compara o commit antigo com o novo):

| O que mudou | Ação |
|---|---|
| Só `templates/*.yaml` | **nada** — bind-mounted nos containers, já está live |
| `backend/` (Python) | rebuild `api worker beat` |
| `frontend/` (React/TS) | rebuild `frontend` |
| `docker-compose.yml` / `.env` | recria todos os serviços (`up -d`) |
| Nova coluna em modelo SQLAlchemy | **cuidado**: o app usa `create_all` (não faz migration); precisa `ALTER TABLE` manual |

> **Sempre inclua o `beat`** no rebuild de backend — ele compartilha a imagem do backend e importa os módulos de task no startup; sem rebuild, fica com código velho.
>
> **Seed (`seed_apps.py`)** só roda em banco vazio — mudanças (descrição, lista de apps) **não se aplicam** a um DB já populado; use `UPDATE`/`INSERT` manual.
>
> Os dados dos volumes do PostgreSQL/Redis são preservados entre updates.

---

## Convenções

- **Backend:** ruff (lint), pytest (testes), structlog (logs), sync sessions no Celery, async no FastAPI
- **Frontend:** componentes em `components/ui/` são primitivos genéricos; componentes de domínio ficam em `components/{domain}/`; páginas em `pages/`
- **Templates YAML:** schema `ianoie-template/v1` com metadata, gpu, config, services; renderer resolve dependências e gera labels Traefik
- **Docker:** todos containers gerenciados têm label `ianoie.managed=true` e `ianoie.installation_id`. Os bind mounts do host (`/var/run/docker.sock`, `templates/`) usam o sufixo **`:z`** (label compartilhada `container_file_t`) para compatibilidade com SELinux em modo **enforcing** no RHEL/AlmaLinux — sempre `:z`, nunca `:Z`, pois múltiplos containers compartilham o mesmo socket
- **GPU:** DGX Spark tem 1x GB10 Grace Blackwell (detecção dinâmica via pynvml); Docker DeviceRequest com `capabilities=[["gpu"]]` e `device_ids=[uuids]` para passthrough; suporte a seleção de múltiplas GPUs para compatibilidade com DGX maiores
- **LLM Providers:** chaves de API nunca ficam em texto plano — `core/crypto.py` (Fernet) grava na coluna `api_key_encrypted` de `LLMProvider`; o provider marcado como padrão é injetado como variável de ambiente no container da instalação
- **Auth:** JWT no header `Authorization: Bearer <token>`, armazenado em `localStorage` no frontend
- **Rotas API:** tudo sob `/api/v1/`; WebSocket em `/api/v1/ws/logs/{id}?token=`
- **Frontend API client:** ky com interceptor JWT e redirect 401 -> /login

---

## Comandos úteis

```bash
# Backend
cd backend && pip install -e .                # instalar deps
cd backend && python -m ianoie.main           # rodar API standalone
celery -A ianoie.workers.celery_app:celery_app worker --loglevel=info   # worker
celery -A ianoie.workers.celery_app:celery_app beat --loglevel=info     # scheduler
ruff check src/                               # lint
pytest                                        # testes

# Frontend
cd frontend && npm install && npm run dev     # dev server
cd frontend && npm run build                  # build produção

# Docker
docker compose -f docker/docker-compose.yml up -d
docker compose -f docker/docker-compose.yml logs -f api worker
docker compose -f docker/docker-compose.yml down -v  # reset completo

# GPU debug
docker run --rm --gpus all ubuntu nvidia-smi -L
```

---

## Variáveis de ambiente (.env)

| Variável | Default | Descrição |
|----------|---------|-----------|
| `APP_NAME` | `IAnoIE` | Nome da aplicação |
| `DEBUG` | `false` | Modo debug |
| `POSTGRES_USER` | `ianoie` | Usuário do PostgreSQL |
| `POSTGRES_PASSWORD` | `change-me-in-production` | Senha do PostgreSQL |
| `POSTGRES_DB` | `ianoie` | Nome do banco |
| `DATABASE_URL` | `postgresql+asyncpg://ianoie:...@localhost:5432/ianoie` | Async DB (FastAPI) |
| `DATABASE_URL_SYNC` | `postgresql+psycopg2://ianoie:...@localhost:5432/ianoie` | Sync DB (Celery) |
| `DOCKER_HOST` | `unix:///var/run/docker.sock` | Docker socket |
| `DOCKER_TIMEOUT` | `120` | Timeout (s) do Docker client |
| `JWT_SECRET` | `change-me-to-a-random-secret-in-production` | Secret do JWT (`openssl rand -hex 32`) |
| `JWT_ALGORITHM` | `HS256` | Algoritmo do JWT |
| `JWT_EXPIRE_HOURS` | `24` | Expiração do token (horas) |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis genérico |
| `CELERY_BROKER_URL` | `redis://localhost:6379/1` | Celery broker |
| `CELERY_RESULT_BACKEND` | `redis://localhost:6379/2` | Celery result backend |
| `ENCRYPTION_KEY` | `change-me-to-a-valid-fernet-key` | Chave Fernet p/ criptografar as chaves de API dos LLM providers |
| `GPU_POLL_INTERVAL_SECONDS` | `60` | Intervalo do beat de GPU metrics |
| `GPU_METRICS_RETENTION_DAYS` | `7` | Dias de retenção de métricas GPU |
| `SYSTEM_METRICS_RETENTION_DAYS` | `7` | Dias de retenção de métricas de sistema |
| `PORT_RANGE_START` | `9000` | Início da faixa de portas alocadas p/ apps |
| `PORT_RANGE_END` | `9999` | Fim da faixa de portas alocadas p/ apps |
| `TEMPLATES_HOST_PATH` | `/opt/ianoie/templates` | Caminho dos templates no host (montado nos containers) |
| `TEMPLATES_DIR` | `/app/templates` | Diretório dos YAML templates (dentro do container) |
| `DEFAULT_ADMIN_EMAIL` | `admin@aimization.com` | Email do admin inicial |
| `DEFAULT_ADMIN_PASSWORD` | `change-me-in-production` | Senha do admin inicial |
