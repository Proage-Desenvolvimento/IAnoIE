# OmniVoice — Zero-shot TTS with voice cloning for 600+ languages
# https://github.com/k2-fsa/OmniVoice
FROM pytorch/pytorch:2.8.0-cuda12.8-cudnn9-runtime

WORKDIR /app

# System deps for audio processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install OmniVoice + dependencies
RUN pip install --no-cache-dir \
    omnivoice==0.1.2 \
    transformers==5.3.0 \
    accelerate \
    pydub \
    tensorboardX \
    webdataset \
    soundfile \
    gradio

# Pre-download model at build time (saves ~5GB download on first run)
RUN python3 -c "from omnivoice import OmniVoice; OmniVoice.from_pretrained('k2-fsa/OmniVoice', device_map='cpu', dtype=None, load_asr=False)" || true

EXPOSE 7860

HEALTHCHECK --interval=30s --timeout=10s --start-period=300s --retries=5 \
    CMD curl -sf http://localhost:7860/ || exit 1

# Launch Gradio demo
ENTRYPOINT ["omnivoice-demo"]
CMD ["--ip", "0.0.0.0", "--port", "7860", "--device", "cuda"]
