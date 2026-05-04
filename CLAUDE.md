# IAnoIE — GPU AI App Platform for NVIDIA DGX

Plataforma web tipo Softaculous para instalar e gerenciar aplicações de IA em máquinas DGX da NVIDIA com um clique. Usuário não precisa entender Docker, CUDA ou Linux.

**Organização:** Proage-Desenvolvimento (Brasil)
**Stack:** Python 3.11+ / FastAPI / PostgreSQL / Celery + Redis / React 19 + TypeScript / Tailwind CSS / Traefik

---

## Arquitetura

```
Browser (React) -> Traefik (:80) -> FastAPI (:8000) -> PostgreSQL
                                            |-> Celery Worker -> Docker Engine (socket)
                                            |-> Celery Beat -> GPU Metrics (pynvml)
                                   -> Redis (broker + backend)
```

- Traefik descobre containers via labels Docker e faz roteamento por path `/app/{id}/`
- Celery tasks usam sessão síncrona (psycopg2); FastAPI usa async (asyncpg)
- Templates YAML definem apps; renderer converte em configs Docker com labels Traefik + GPU device_requests

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
│       ├── api/v1/           # Rotas: auth, apps, installations, jobs, gpu, logs (ws), system
│       ├── models/           # SQLAlchemy ORM: User, App, Installation, AppLog, GPUMetrics, Job
│       ├── schemas/          # Pydantic request/response
│       ├── services/         # Camada de negócio: InstallationService (cria job + dispatch Celery)
│       ├── docker_ops/       # Docker SDK: ContainerManager, ImageManager, NetworkManager, VolumeManager, GPUDetector
│       ├── templates/        # Template engine: loader.py (YAML), renderer.py (-> ContainerConfig)
│       ├── workers/          # Celery: celery_app.py, tasks/install.py, tasks/uninstall.py, tasks/gpu_monitor.py
│       ├── core/             # security.py (JWT+bcrypt), exceptions.py, middleware.py
│       └── seed/             # seed_apps.py (8 apps + admin user)
├── frontend/                 # React 19 + TypeScript + Tailwind 4
│   ├── package.json          # deps: react, react-router-dom, @tanstack/react-query, recharts, lucide-react, ky, zod
│   ├── vite.config.ts        # proxy /api -> localhost:8000
│   └── src/
│       ├── api/              # client.ts (ky com JWT interceptor) + endpoints: auth, apps, installations, jobs, gpu
│       ├── hooks/            # useAuth, useApps, useInstallations, useGpuMetrics, useLogStream, useJobPolling
│       ├── components/
│       │   ├── ui/           # Button, Badge, Card, Dialog, Progress, Spinner, EmptyState, StatusBadge
│       │   ├── layout/       # AppShell (sidebar+outlet), Sidebar (nav+logout)
│       │   └── logs/         # LogViewer (terminal-style, WebSocket streaming, filter, auto-scroll)
│       ├── pages/            # Login, Dashboard, Catalog, MyApps, AppDetail, GpuMonitor
│       └── lib/              # types.ts, utils.ts (cn, formatBytes), constants.ts
├── templates/                # 8 YAML app templates: ollama, open-webui, ollama-openwebui, jupyterlab, comfyui, triton, vllm, n8n
├── docker/
│   ├── docker-compose.yml    # postgres, redis, api, worker, beat, frontend, traefik
│   └── docker-compose.dev.yml
├── scripts/
│   └── setup-dgx.sh         # Instala Docker + NVIDIA Container Toolkit + cria rede
└── .env.example
```

---

## O que já foi construído

### Backend (completo)
- [x] FastAPI app com lifespan (auto-create tables + seed)
- [x] PostgreSQL via asyncpg (FastAPI) + psycopg2 (Celery)
- [x] 6 modelos SQLAlchemy: User, App, Installation, AppLog, GPUMetrics, Job
- [x] JWT auth (login, register, /me) com bcrypt
- [x] CRUD de apps com paginação, filtro por categoria, busca
- [x] CRUD de installations com service layer (InstallationService)
- [x] Celery app com broker Redis, beat schedule (GPU metrics a cada 60s)
- [x] Tasks: install_app, uninstall_app, start_app, stop_app, restart_app, collect_gpu_metrics
- [x] Template engine: loader (YAML -> dict), renderer (dict -> ContainerConfig com labels Traefik)
- [x] Docker ops: ContainerManager (create/start/stop/remove/wait_healthy), ImageManager, NetworkManager, VolumeManager
- [x] GPUDetector via pynvml (util, vram, temp, power, uuid)
- [x] WebSocket endpoint para stream de logs de container
- [x] Seed de 8 apps + admin user padrão (admin@aimization.com / admin)
- [x] 8 templates YAML de apps prontos

### Frontend (completo)
- [x] 8 componentes UI reutilizáveis (Button, Badge, Card, Dialog, Progress, Spinner, EmptyState, StatusBadge)
- [x] LogViewer terminal-style com WebSocket, filtro, pause, auto-scroll
- [x] 6 páginas: Login, Dashboard, Catalog, MyApps, AppDetail, GpuMonitor
- [x] Catalog: busca + filtro por categoria, cards com ícone/cor por categoria, dialog de install com GPU selector, progress bar em tempo real via polling de job
- [x] MyApps: lista com status badge, lifecycle controls (start/stop/restart/uninstall), inline log viewer expandível
- [x] AppDetail: detalhes da instalação + log viewer full + controls
- [x] Dashboard: 4 stats cards, running apps, GPU overview com bars
- [x] GpuMonitor: cards por GPU com utilization/VRAM bars, temp color-coded, power/metrics
- [x] API client com JWT interceptor (ky), 6 módulos de API
- [x] 6 hooks: useAuth, useApps, useInstallations, useGpuMetrics, useLogStream, useJobPolling

### Infraestrutura (completo)
- [x] docker-compose.yml com 7 serviços: postgres, redis, api, worker, beat, frontend, traefik
- [x] Dockerfiles para backend (python:3.11-slim + libpq) e frontend (node build + nginx)
- [x] nginx.conf com proxy /api/ -> backend
- [x] setup-dgx.sh para provisionamento inicial

---

## O que ainda precisa ser feito

### Crítico (para rodar)
- [ ] `npm install` no frontend e testar `npm run build` sem erros
- [ ] Criar a rede Docker: `docker network create ianoie-proxy`
- [ ] Subir o stack: `docker compose -f docker/docker-compose.yml up -d`
- [ ] Testar o fluxo completo: login -> catalog -> install -> logs -> manage
- [ ] Corrigir qualquer erro de import ou tipo que aparecer ao rodar

### Backend — Melhorias
- [ ] Alembic migrations (atualmente usa `create_all` no lifespan)
- [ ] Testes unitários (pytest + mocked Docker client)
- [ ] Testes de integração (docker-compose + API calls)
- [ ] Rate limiting com slowapi nos endpoints de auth
- [ ] Docker socket proxy (tecnativa/docker-socket-proxy) para produção
- [ ] Encriptação de secrets com Fernet no config das installations
- [ ] Health check endpoint do Celery worker
- [ ] Graceful shutdown do worker (cleanup containers órfãos)
- [ ] Retry logic melhorada no install_app (rollback de containers criados parcialmente)
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
- [ ] GPU quotas por usuário
- [ ] Backup/restore de volumes
- [ ] App update flow (pull new image, recreate container)
- [ ] Custom domain por app
- [ ] HTTPS com Let's Encrypt (Traefik TLS + cert resolver)
- [ ] Dashboard de uso de recursos (CPU/memória por container)

### Funcionalidades — Fase 3
- [ ] Kubernetes (Helm chart, pod-based lifecycle)
- [ ] NVIDIA NGC integration (browse/pull NGC containers)
- [ ] Marketplace (templates comunitários com upload)
- [ ] Multi-node DGX
- [ ] MIG support (partition GPUs)
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
# Primeira vez na DGX
sudo bash scripts/setup-dgx.sh

# Subir tudo
docker network create ianoie-proxy
cp .env.example .env  # editar senhas/secret
docker compose -f docker/docker-compose.yml up -d

# Acessar: http://<dgx-ip>
# Login: admin@aimization.com / admin
```

---

## Convenções

- **Backend:** ruff (lint), pytest (testes), structlog (logs), sync sessions no Celery, async no FastAPI
- **Frontend:** componentes em `components/ui/` são primitivos genéricos; componentes de domínio ficam em `components/{domain}/`; páginas em `pages/`
- **Templates YAML:** schema `ianoie-template/v1` com metadata, gpu, config, services; renderer resolve dependências e gera labels Traefik
- **Docker:** todos containers gerenciados têm label `ianoie.managed=true` e `ianoie.installation_id`
- **GPU:** pynvml para detecção/monitoring; Docker DeviceRequest com `capabilities=[["gpu"]]` e `device_ids=[uuids]` para passthrough
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
| `DATABASE_URL` | `postgresql+asyncpg://ianoie:ianoie@localhost:5432/ianoie` | Async DB (FastAPI) |
| `DATABASE_URL_SYNC` | `postgresql+psycopg2://ianoie:ianoie@localhost:5432/ianoie` | Sync DB (Celery) |
| `CELERY_BROKER_URL` | `redis://localhost:6379/1` | Celery broker |
| `CELERY_RESULT_BACKEND` | `redis://localhost:6379/2` | Celery result backend |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis genérico |
| `JWT_SECRET` | `CHANGE-ME` | Secret do JWT |
| `DOCKER_HOST` | `unix:///var/run/docker.sock` | Docker socket |
| `TEMPLATES_DIR` | `/app/templates` | Diretório dos YAML templates |
| `DEFAULT_ADMIN_EMAIL` | `admin@aimization.com` | Email do admin inicial |
| `DEFAULT_ADMIN_PASSWORD` | `admin` | Senha do admin inicial |
| `GPU_POLL_INTERVAL_SECONDS` | `60` | Intervalo do beat de GPU metrics |
| `GPU_METRICS_RETENTION_DAYS` | `7` | Dias de retenção de métricas GPU |
