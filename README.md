# IAnoIE — GPU AI App Platform for NVIDIA DGX

One-click AI app installer and manager for NVIDIA DGX machines. Like Softaculous, but for AI workloads — no Docker, CUDA, or Linux knowledge required.

**Repository:** [github.com/Proage-Desenvolvimento/IAnoIE](https://github.com/Proage-Desenvolvimento/IAnoIE)

---

## 🇺🇸 English

### What is IAnoIE?

IAnoIE is a web platform that lets you install and manage AI applications on NVIDIA DGX machines with a single click. Deploy Ollama, ComfyUI, JupyterLab, and more without touching Docker or the command line.

### Architecture

```
Browser (React) → Traefik (:80) → FastAPI (:8000) → PostgreSQL
                                          |→ Celery Worker → Docker Engine (socket)
                                          |→ Celery Beat → GPU Metrics (pynvml)
                                 → Redis (broker + backend)
```

- **Traefik** discovers containers via Docker labels and routes by path `/app/{id}/`
- **Celery** tasks use a synchronous session (psycopg2); FastAPI uses async (asyncpg)
- **YAML templates** define apps; a renderer converts them into Docker configs with Traefik labels + GPU device requests

### Quick Start

Every push to `main` triggers a [GitHub Actions](./.github/workflows/build.yml) pipeline that builds and publishes Docker images to GHCR. You don't need to build anything — just clone, configure, and run.

**1. Clone the repository and run setup** (first time only):

```bash
git clone https://github.com/Proage-Desenvolvimento/IAnoIE.git
cd IAnoIE
sudo bash scripts/setup-dgx.sh
```

This installs Docker, NVIDIA Container Toolkit, and creates the `ianoie-proxy` network.

> **No git?** You can run the setup directly from the URL:
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
- `DEFAULT_ADMIN_PASSWORD` — admin user password

**3. Start the platform**:

```bash
docker compose -f docker/docker-compose.yml up -d
```

**4. Open in browser**:

```
http://<dgx-ip>
```

Default login: `admin@ianoie.local` / `admin` (change the password after first login)

### Available Apps

| App | Description |
|-----|-------------|
| **Ollama** | Run LLMs locally (Llama, Mistral, etc.) |
| **Open WebUI** | Web interface for Ollama (ChatGPT-like) |
| **Ollama + Open WebUI** | Both bundled together |
| **JupyterLab** | Interactive notebooks for data science |
| **ComfyUI** | Stable Diffusion workflow engine |
| **Triton Inference** | NVIDIA inference server |
| **vLLM** | High-throughput LLM serving |

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
├── templates/                # 7 YAML app templates
├── docker/
│   ├── docker-compose.yml    # Production compose
│   └── docker-compose.dev.yml
├── scripts/
│   └── setup-dgx.sh         # DGX provisioning script
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
| `POSTGRES_USER` | `ianoie` | PostgreSQL user |
| `POSTGRES_PASSWORD` | `change-me-in-production` | PostgreSQL password |
| `POSTGRES_DB` | `ianoie` | Database name |
| `DATABASE_URL` | `postgresql+asyncpg://...` | Async DB URL (FastAPI) |
| `DATABASE_URL_SYNC` | `postgresql+psycopg2://...` | Sync DB URL (Celery) |
| `JWT_SECRET` | `change-me-...` | JWT signing secret |
| `JWT_EXPIRE_HOURS` | `24` | Token expiration |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection |
| `CELERY_BROKER_URL` | `redis://localhost:6379/1` | Celery broker |
| `CELERY_RESULT_BACKEND` | `redis://localhost:6379/2` | Celery results |
| `DOCKER_HOST` | `unix:///var/run/docker.sock` | Docker socket |
| `TEMPLATES_DIR` | `/app/templates` | YAML templates path |
| `DEFAULT_ADMIN_EMAIL` | `admin@ianoie.local` | Initial admin email |
| `DEFAULT_ADMIN_PASSWORD` | `change-me-in-production` | Initial admin password |
| `GPU_POLL_INTERVAL_SECONDS` | `60` | GPU metrics interval |
| `GPU_METRICS_RETENTION_DAYS` | `7` | Metrics retention |

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

### O que é o IAnoIE?

O IAnoIE é uma plataforma web que permite instalar e gerenciar aplicações de IA em máquinas DGX da NVIDIA com um clique. Deploy de Ollama, ComfyUI, JupyterLab e mais, sem precisar tocar em Docker ou linha de comando.

### Arquitetura

```
Browser (React) → Traefik (:80) → FastAPI (:8000) → PostgreSQL
                                          |→ Celery Worker → Docker Engine (socket)
                                          |→ Celery Beat → GPU Metrics (pynvml)
                                 → Redis (broker + backend)
```

- O **Traefik** descobre containers via labels Docker e faz roteamento por path `/app/{id}/`
- As tasks do **Celery** usam sessão síncrona (psycopg2); o FastAPI usa async (asyncpg)
- **Templates YAML** definem as apps; um renderer converte em configs Docker com labels Traefik + device requests de GPU

### Início Rápido

A cada push na `main`, uma [GitHub Actions](./.github/workflows/build.yml) compila e publica as imagens Docker no GHCR. Não precisa compilar nada — só clonar, configurar e rodar.

**1. Clonar o repositório e rodar o setup** (só na primeira vez):

```bash
git clone https://github.com/Proage-Desenvolvimento/IAnoIE.git
cd IAnoIE
sudo bash scripts/setup-dgx.sh
```

Este script instala o Docker, o NVIDIA Container Toolkit e cria a rede `ianoie-proxy`.

> **Sem git?** Pode rodar o setup direto da URL:
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
- `DEFAULT_ADMIN_PASSWORD` — senha do usuário admin

**3. Iniciar a plataforma**:

```bash
docker compose -f docker/docker-compose.yml up -d
```

**4. Abrir no navegador**:

```
http://<ip-da-dgx>
```

Login padrão: `admin@ianoie.local` / `admin` (altere a senha após o primeiro login)

### Aplicativos Disponíveis

| App | Descrição |
|-----|-----------|
| **Ollama** | Execute LLMs localmente (Llama, Mistral, etc.) |
| **Open WebUI** | Interface web para Ollama (estilo ChatGPT) |
| **Ollama + Open WebUI** | Ambos juntos |
| **JupyterLab** | Notebooks interativos para ciência de dados |
| **ComfyUI** | Motor de workflows do Stable Diffusion |
| **Triton Inference** | Servidor de inferência da NVIDIA |
| **vLLM** | Serving de LLMs em alto throughput |

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
├── templates/                # 7 templates YAML de apps
├── docker/
│   ├── docker-compose.yml    # Compose de produção
│   └── docker-compose.dev.yml
├── scripts/
│   └── setup-dgx.sh         # Script de provisionamento DGX
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
| `POSTGRES_USER` | `ianoie` | Usuário do PostgreSQL |
| `POSTGRES_PASSWORD` | `change-me-in-production` | Senha do PostgreSQL |
| `POSTGRES_DB` | `ianoie` | Nome do banco |
| `DATABASE_URL` | `postgresql+asyncpg://...` | URL async do banco (FastAPI) |
| `DATABASE_URL_SYNC` | `postgresql+psycopg2://...` | URL sync do banco (Celery) |
| `JWT_SECRET` | `change-me-...` | Secret de assinatura JWT |
| `JWT_EXPIRE_HOURS` | `24` | Expiração do token |
| `REDIS_URL` | `redis://localhost:6379/0` | Conexão Redis |
| `CELERY_BROKER_URL` | `redis://localhost:6379/1` | Broker do Celery |
| `CELERY_RESULT_BACKEND` | `redis://localhost:6379/2` | Resultados do Celery |
| `DOCKER_HOST` | `unix:///var/run/docker.sock` | Socket Docker |
| `TEMPLATES_DIR` | `/app/templates` | Caminho dos templates YAML |
| `DEFAULT_ADMIN_EMAIL` | `admin@ianoie.local` | Email do admin inicial |
| `DEFAULT_ADMIN_PASSWORD` | `change-me-in-production` | Senha do admin inicial |
| `GPU_POLL_INTERVAL_SECONDS` | `60` | Intervalo de métricas GPU |
| `GPU_METRICS_RETENTION_DAYS` | `7` | Retenção de métricas |

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
