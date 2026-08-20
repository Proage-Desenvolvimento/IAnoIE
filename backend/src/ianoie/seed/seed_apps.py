import structlog
from sqlalchemy import delete, select

from ianoie.core.security import hash_password
from ianoie.database import async_session_factory
from ianoie.models.app import App
from ianoie.models.installation import Installation
from ianoie.models.user import User, UserRole

logger = structlog.get_logger()

APPS = [
    {
        "name": "Open WebUI",
        "slug": "open-webui",
        "description": "ChatGPT-style web interface for local LLMs. Feature-rich with RAG, multi-model support.",
        "category": "produtividade",
        "template_path": "open-webui.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 0, "min_vram_gb": 0, "gpu_required": false}',
    },
    {
        "name": "JupyterLab",
        "slug": "jupyterlab",
        "description": "Interactive notebook environment with GPU support for data science and ML development.",
        "category": "inteligencia",
        "template_path": "jupyterlab.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 1, "min_vram_gb": 8, "gpu_required": false}',
    },
    {
        "name": "ComfyUI",
        "slug": "comfyui",
        "description": "Powerful Stable Diffusion UI with node-based workflow for image generation.",
        "category": "estudio",
        "template_path": "comfyui.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 1, "min_vram_gb": 8, "gpu_required": true}',
    },
    {
        "name": "Speakr",
        "slug": "speakr",
        "description": "AI transcription and note-taking with speaker ID. Choose your transcription engine at install or later (Edit config): OpenAI, Mistral, VibeVoice, or your own Whisper/ASR server (asr_endpoint). Login: the admin email + password you set during install.",
        "category": "produtividade",
        "template_path": "speakr.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 0, "min_vram_gb": 0, "gpu_required": false}',
    },
    {
        "name": "OmniVoice",
        "slug": "omnivoice",
        "description": "Zero-shot TTS with voice cloning and voice design for 600+ languages.",
        "category": "estudio",
        "template_path": "omnivoice.yaml",
        "icon_url": None,
        "version": "0.1.2",
        "gpu_requirements": '{"min_gpu_count": 1, "min_vram_gb": 8, "gpu_required": true}',
    },
    {
        "name": "Voicebox",
        "slug": "voicebox",
        "description": "Open-source AI voice studio. Clone voices, generate speech in 23 languages across 7 TTS engines, dictate anywhere, and give AI agents a voice. REST API + MCP. Runs locally on CPU.",
        "category": "estudio",
        "template_path": "voicebox.yaml",
        "icon_url": None,
        "version": "0.2.3",
        "gpu_requirements": '{"min_gpu_count": 0, "min_vram_gb": 0, "gpu_required": false}',
    },
    {
        "name": "n8n",
        "slug": "n8n",
        "description": "Workflow automation platform. Connect apps and automate tasks with a visual node-based editor.",
        "category": "produtividade",
        "template_path": "n8n.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 0, "min_vram_gb": 0, "gpu_required": false}',
    },
    {
        "name": "Open Notebook",
        "slug": "open-notebook",
        "description": "Self-hosted alternative to Google's NotebookLM. Multi-modal research, chat with sources, vector search, multi-speaker podcasts. 16+ AI providers. No GPU required.",
        "category": "inteligencia",
        "template_path": "open-notebook.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 0, "min_vram_gb": 0, "gpu_required": false}',
    },
    {
        "name": "Scrapling",
        "slug": "scrapling",
        "description": "Adaptive web scraping framework — stealth HTTP, real browsers, Cloudflare bypass. Use it from a web terminal (CLI) or expose the MCP server to Claude/Cursor/Claude Code. Both protected by a username/token you set at install.",
        "category": "vendas",
        "template_path": "scrapling.yaml",
        "icon_url": None,
        "version": "0.4.1",
        "gpu_requirements": '{"min_gpu_count": 0, "min_vram_gb": 0, "gpu_required": false}',
    },
    {
        "name": "Flowise",
        "slug": "flowise",
        "description": "Visual low-code builder for LLM apps — drag-and-drop LangChain/LlamaIndex flows, agents and RAG pipelines. Single container, no GPU.",
        "category": "vendas",
        "template_path": "flowise.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 0, "min_vram_gb": 0, "gpu_required": false}',
    },
    {
        "name": "AnythingLLM",
        "slug": "anythingllm",
        "description": "Full-stack RAG app — chat with your documents, build agents, multi-workspace and multi-user. 30+ LLM providers. Single container, no GPU.",
        "category": "inteligencia",
        "template_path": "anythingllm.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 0, "min_vram_gb": 0, "gpu_required": false}',
    },
    {
        "name": "Metabase",
        "slug": "metabase",
        "description": "Open-source BI — ask questions over your databases, build dashboards and share insights, no SQL required. PostgreSQL backend; first user becomes admin via the setup wizard.",
        "category": "inteligencia",
        "template_path": "metabase.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 0, "min_vram_gb": 0, "gpu_required": false}',
    },
    {
        "name": "Khoj",
        "slug": "khoj",
        "description": "AI second brain — chat with your notes, docs and the web, with deep research and optional local models. PostgreSQL (pgvector). No GPU required.",
        "category": "inteligencia",
        "template_path": "khoj.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 0, "min_vram_gb": 0, "gpu_required": false}',
    },
    {
        "name": "Twenty",
        "slug": "twenty",
        "description": "Open-source CRM — a modern, customizable alternative to Salesforce and Hubspot. PostgreSQL + Redis + worker. First signup becomes the workspace owner.",
        "category": "vendas",
        "template_path": "twenty.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 0, "min_vram_gb": 0, "gpu_required": false}',
    },
    {
        "name": "Chatwoot",
        "slug": "chatwoot",
        "description": "Open-source omnichannel customer engagement — live chat, email, WhatsApp and more in one inbox. Rails + Sidekiq + PostgreSQL (pgvector) + Redis.",
        "category": "vendas",
        "template_path": "chatwoot.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 0, "min_vram_gb": 0, "gpu_required": false}',
    },
    {
        "name": "Apache Superset",
        "slug": "superset",
        "description": "Modern data exploration and visualization platform — dashboards, charts and SQL editor over any DB. Flask + Celery + PostgreSQL + Redis. Admin: admin / password set at install.",
        "category": "inteligencia",
        "template_path": "superset.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 0, "min_vram_gb": 0, "gpu_required": false}',
    },
    {
        "name": "Onyx",
        "slug": "onyx",
        "description": "Enterprise AI assistant with connected knowledge — chat, agents and search across all your company data. PostgreSQL + OpenSearch + Redis. LLMs configured in the admin UI. Heavy stack.",
        "category": "inteligencia",
        "template_path": "onyx.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 0, "min_vram_gb": 0, "gpu_required": false}',
    },
    {
        "name": "AppFlowy",
        "slug": "appflowy",
        "description": "Open-source Notion alternative — self-host the AppFlowy collaboration server (workspaces, wikis, realtime, AI). PostgreSQL (pgvector) + Redis + MinIO. Open-core: 1 seat free.",
        "category": "produtividade",
        "template_path": "appflowy.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 0, "min_vram_gb": 0, "gpu_required": false}',
    },
    {
        "name": "Dify",
        "slug": "dify",
        "description": "Open-source LLM app development platform — build agents, workflows, RAG and chatbots visually. Full stack (API + web + worker + plugin daemon + sandbox + PostgreSQL + Redis + Weaviate). LLMs configured in the admin UI.",
        "category": "produtividade",
        "template_path": "dify.yaml",
        "icon_url": None,
        "version": "1.14.2",
        "gpu_requirements": '{"min_gpu_count": 0, "min_vram_gb": 0, "gpu_required": false}',
    },
    {
        "name": "mkt22",
        "slug": "mkt22",
        "description": "AI marketing consultant — structures your marketing plan using external research to reduce uncertainty and sharpen the diagnosis.",
        "category": "consultores",
        "template_path": "mkt22.yaml",
        "icon_url": None,
        "version": "1.1.0",
        "gpu_requirements": '{"min_gpu_count": 0, "min_vram_gb": 0, "gpu_required": false}',
    },
    {
        "name": "RAGFlow",
        "slug": "ragflow",
        "description": "RAG engine with deep document understanding — chunk, embed and chat over complex documents (PDFs, tables, contracts) with grounded citations.",
        "category": "inteligencia",
        "template_path": "ragflow.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 0, "min_vram_gb": 0, "gpu_required": false}',
    },
    {
        "name": "LibreChat",
        "slug": "librechat",
        "description": "Enhanced ChatGPT-clone — unified chat across OpenAI, Anthropic, Gemini and Ollama, with agents, presets and RAG file search.",
        "category": "inteligencia",
        "template_path": "librechat.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 0, "min_vram_gb": 0, "gpu_required": false}',
    },
]


async def sync_apps() -> None:
    """Sincroniza o catálogo de apps no banco com a lista APPS.

    Roda a cada startup da API (idempotente): faz UPSERT por slug (cria os
    novos, atualiza campos mutáveis dos existentes) e remove apps obsoletos
    — porém somente aqueles sem instalações, para nunca cascade-deletar uma
    instalação de usuário (FK ``installations.app_id`` é ``ondelete=CASCADE``).
    """
    async with async_session_factory() as db:
        # 1) Carrega apps existentes num dict por slug (uma query; sem tocar
        #    relationships para evitar MissingGreenlet em sessão async).
        result = await db.execute(select(App))
        existing_by_slug: dict[str, App] = {a.slug: a for a in result.scalars().all()}
        desired_slugs = {app["slug"] for app in APPS}

        # 2) UPSERT: cria se faltar o slug, atualiza apenas campos mutáveis.
        created = 0
        updated = 0
        for app_data in APPS:
            row = existing_by_slug.get(app_data["slug"])
            if row is None:
                db.add(App(**app_data))
                created += 1
                continue

            changed = False
            for field in (
                "name",
                "description",
                "category",
                "template_path",
                "icon_url",
                "version",
                "gpu_requirements",
            ):
                if getattr(row, field) != app_data[field]:
                    setattr(row, field, app_data[field])
                    changed = True
            if changed:
                updated += 1

        # 3) Remoção SEGURA de apps obsoletos — somente os sem instalações.
        #    Nunca acessa ``row.installations`` (lazy em async); usa uma query
        #    distinct() de Installation.app_id para saber quais proteger.
        stale_slugs = set(existing_by_slug) - desired_slugs
        to_delete: list[App] = []
        skipped: list[str] = []
        if stale_slugs:
            stale_ids = [existing_by_slug[s].id for s in stale_slugs]
            protected = {
                row[0]
                for row in (
                    await db.execute(
                        select(Installation.app_id)
                        .where(Installation.app_id.in_(stale_ids))
                        .distinct()
                    )
                ).all()
            }
            for slug in stale_slugs:
                row = existing_by_slug[slug]
                if row.id in protected:
                    skipped.append(slug)
                    logger.warning(
                        "sync_apps_skip_stale_with_installations",
                        slug=slug,
                        app_id=row.id,
                    )
                else:
                    to_delete.append(row)
            if to_delete:
                await db.execute(
                    delete(App).where(App.id.in_([r.id for r in to_delete]))
                )

        logger.info(
            "sync_apps_done",
            created=created,
            updated=updated,
            deleted=len(to_delete),
            skipped_with_installations=len(skipped),
        )

        # 4) Criação do admin padrão — preservada do seed original.
        from ianoie.config import settings
        admin = await db.execute(
            select(User).where(User.email == settings.default_admin_email)
        )
        if not admin.scalar_one_or_none():
            db.add(User(
                email=settings.default_admin_email,
                hashed_password=hash_password(settings.default_admin_password),
                role=UserRole.admin,
            ))

        # 5) Commit único: upserts + remoções + admin atômicos.
        await db.commit()
