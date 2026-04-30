from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ianoie.database import async_session_factory
from ianoie.models.app import App
from ianoie.models.user import User, UserRole
from ianoie.core.security import hash_password

APPS = [
    {
        "name": "Ollama",
        "slug": "ollama",
        "description": "Run LLMs locally with a simple API. Supports Llama, Mistral, Gemma, and more.",
        "category": "llm",
        "template_path": "ollama.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 1, "min_vram_gb": 8, "gpu_required": true}',
    },
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
        "name": "Open WebUI + Ollama",
        "slug": "open-webui-ollama",
        "description": "Complete LLM stack: Ollama backend + Open WebUI frontend. One-click AI chat.",
        "category": "llm",
        "template_path": "ollama-openwebui.yaml",
        "icon_url": None,
        "version": "1.0.0",
        "gpu_requirements": '{"min_gpu_count": 1, "min_vram_gb": 16, "gpu_required": true}',
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
        "name": "Triton Inference Server",
        "slug": "triton-inference",
        "description": "NVIDIA's inference server supporting TensorFlow, PyTorch, ONNX, and custom backends.",
        "category": "inference",
        "template_path": "triton-inference.yaml",
        "icon_url": None,
        "version": "24.01",
        "gpu_requirements": '{"min_gpu_count": 1, "min_vram_gb": 16, "gpu_required": true}',
    },
    {
        "name": "vLLM",
        "slug": "vllm",
        "description": "High-throughput LLM inference engine with PagedAttention for fast serving.",
        "category": "inference",
        "template_path": "vllm.yaml",
        "icon_url": None,
        "version": "latest",
        "gpu_requirements": '{"min_gpu_count": 1, "min_vram_gb": 16, "gpu_required": true}',
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
