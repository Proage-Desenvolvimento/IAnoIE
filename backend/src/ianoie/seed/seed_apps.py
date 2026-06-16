from sqlalchemy import select

from ianoie.core.security import hash_password
from ianoie.database import async_session_factory
from ianoie.models.app import App
from ianoie.models.user import User, UserRole

APPS = [
    {
        "name": "Open WebUI",
        "slug": "open-webui",
        "description": "ChatGPT-style web interface for local LLMs. Feature-rich with RAG, multi-model support.",
        "category": "llm",
        "template_path": "open-webui.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 0, "min_vram_gb": 0, "gpu_required": false}',
    },
    {
        "name": "JupyterLab",
        "slug": "jupyterlab",
        "description": "Interactive notebook environment with GPU support for data science and ML development.",
        "category": "notebook",
        "template_path": "jupyterlab.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 1, "min_vram_gb": 8, "gpu_required": false}',
    },
    {
        "name": "ComfyUI",
        "slug": "comfyui",
        "description": "Powerful Stable Diffusion UI with node-based workflow for image generation.",
        "category": "imaging",
        "template_path": "comfyui.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 1, "min_vram_gb": 8, "gpu_required": true}',
    },
    {
        "name": "Speakr",
        "slug": "speakr",
        "description": "AI transcription and note-taking with speaker ID. Choose your transcription engine at install or later (Edit config): OpenAI, Mistral, VibeVoice, or your own Whisper/ASR server (asr_endpoint). Login: admin / admin.",
        "category": "productivity",
        "template_path": "speakr.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 0, "min_vram_gb": 0, "gpu_required": false}',
    },
    {
        "name": "OmniVoice",
        "slug": "omnivoice",
        "description": "Zero-shot TTS with voice cloning and voice design for 600+ languages.",
        "category": "productivity",
        "template_path": "omnivoice.yaml",
        "icon_url": None,
        "version": "0.1.2",
        "gpu_requirements": '{"min_gpu_count": 1, "min_vram_gb": 8, "gpu_required": true}',
    },
    {
        "name": "n8n",
        "slug": "n8n",
        "description": "Workflow automation platform. Connect apps and automate tasks with a visual node-based editor.",
        "category": "automation",
        "template_path": "n8n.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 0, "min_vram_gb": 0, "gpu_required": false}',
    },
    {
        "name": "Open Notebook",
        "slug": "open-notebook",
        "description": "Self-hosted alternative to Google's NotebookLM. Multi-modal research, chat with sources, vector search, multi-speaker podcasts. 16+ AI providers. No GPU required.",
        "category": "notebook",
        "template_path": "open-notebook.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 0, "min_vram_gb": 0, "gpu_required": false}',
    },
]


async def seed_initial_apps() -> None:
    async with async_session_factory() as db:
        existing = await db.execute(select(App))
        if existing.scalars().first():
            return

        for app_data in APPS:
            db.add(App(**app_data))

        # Create default admin user
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

        await db.commit()
