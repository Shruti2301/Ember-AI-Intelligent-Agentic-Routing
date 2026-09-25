# syntax=docker/dockerfile:1
#
# Laya — the prompt classifier behind Ember's router.
# Code:    https://github.com/NandhaKishorM/laya (Apache-2.0)
# Weights: https://huggingface.co/convaiinnovations/laya (Apache-2.0, not gated)
#
# CPU-only on purpose: the EC2 host has no GPU, and the default torch wheel
# would drag in ~2GB of CUDA libraries we'd never use.
#
# English only. The HF repo also carries multilingual/ and typed-decisions/
# checkpoints (~1.5GB together); we skip them, and Ember pins every request
# to the English checkpoint with "model": "english".
#
# Weights are baked in at build time, so the container starts offline: no
# Hugging Face download on boot, no rate limits, no dependency on HF uptime.
# No token is needed, but one makes the build's download faster:
#   HF_TOKEN=hf_xxx docker compose build laya

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    HF_HOME=/models

# Install CPU torch first so laya's torch requirement is already satisfied
# and pip doesn't pull the CUDA build.
RUN pip install torch --index-url https://download.pytorch.org/whl/cpu \
 && pip install "laya[serve]"

# Create the user and download as it: a chown after the download would copy
# the ~800MB weights into a second layer.
RUN useradd --create-home --uid 1000 laya \
 && mkdir -p /models && chown laya:laya /models
USER laya

RUN --mount=type=secret,id=hf_token,env=HF_TOKEN,uid=1000 \
    python -c "from huggingface_hub import snapshot_download; \
snapshot_download('convaiinnovations/laya', ignore_patterns=['multilingual/*', 'typed-decisions/*'])"

ENV HF_HUB_OFFLINE=1 \
    LAYA_MODELS=english \
    LAYA_DEVICE=cpu \
    LAYA_HOST=0.0.0.0 \
    LAYA_PORT=8000
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/docs', timeout=4)" || exit 1

CMD ["laya-serve"]
