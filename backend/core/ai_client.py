"""
ai_client.py — Direct Azure OpenAI integration for EDUPlan.

Replaces the old Gradio/HuggingFace HTTP proxy with the official Azure OpenAI
Python SDK. Every function keeps the same signature so chat/views.py and
files/views.py need zero changes.

Required environment variables (set in .env or shell):
    AZURE_OPENAI_ENDPOINT       e.g. https://my-resource.openai.azure.com/
    AZURE_OPENAI_API_KEY        your Azure OpenAI API key
    AZURE_OPENAI_DEPLOYMENT     your deployment name, e.g. "gpt-4o"
    AZURE_OPENAI_API_VERSION    e.g. "2024-02-01"  (optional, has default)
"""

import logging
from django.conf import settings

logger = logging.getLogger(__name__)

# ── Lazy client singleton ────────────────────────────────────────────────────
_client = None

def _get_client():
    global _client
    if _client is not None:
        return _client

    try:
        from openai import AzureOpenAI
    except ImportError as exc:
        raise AIServiceError(
            "openai package is not installed. Run: pip install openai"
        ) from exc

    endpoint = getattr(settings, "AZURE_OPENAI_ENDPOINT", "")
    api_key  = getattr(settings, "AZURE_OPENAI_API_KEY", "")

    if not endpoint or not api_key:
        raise AIServiceError(
            "AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY must be set "
            "in your environment or settings."
        )

    api_version = getattr(settings, "AZURE_OPENAI_API_VERSION", "2024-02-01")

    _client = AzureOpenAI(
        azure_endpoint=endpoint,
        api_key=api_key,
        api_version=api_version,
    )
    return _client


class AIServiceError(RuntimeError):
    """Raised when the Azure OpenAI service returns an error or is unreachable."""
    pass


# ── System prompt ────────────────────────────────────────────────────────────
_SYSTEM_PROMPT = """You are Phoenix, an AI study assistant inside EDUPlan.
You help students with:
- Creating personalised study plans (daily / weekly)
- Breaking topics into clear learning steps
- Explaining difficult concepts simply
- Answering questions about uploaded course materials

Be concise, encouraging, and academically accurate.
If a document was uploaded, refer to it when answering relevant questions."""


# ── Public API (same signatures as the old Gradio proxy) ────────────────────

def send_chat_message(
    session_id: str,
    username: str,
    message: str,
    history: list[dict[str, str]],
) -> dict:
    """
    Send a user message to Azure OpenAI and return {'reply': '...'}.

    `history` is a list of {'role': 'user'|'assistant', 'content': '...'}
    dicts representing the conversation so far (excluding the current message).
    """
    client = _get_client()
    deployment = getattr(settings, "AZURE_OPENAI_DEPLOYMENT", "gpt-4o")

    messages = [{"role": "system", "content": _SYSTEM_PROMPT}]
    messages.extend(history)
    messages.append({"role": "user", "content": message})

    try:
        response = client.chat.completions.create(
            model=deployment,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )
    except Exception as exc:
        logger.exception("Azure OpenAI chat request failed: %s", exc)
        raise AIServiceError(f"Azure OpenAI error: {exc}") from exc

    reply = response.choices[0].message.content
    return {"reply": reply}


def upload_file(
    session_id: str,
    username: str,
    file_path: str,
    filename: str,
    content_type: str,
) -> dict:
    """
    Index a file for RAG use.

    Azure OpenAI does not have a direct file-upload endpoint like the old
    Gradio service did. Returning a success stub here so the existing
    upload flow keeps working without breaking.  If you want real RAG,
    integrate Azure AI Search or LangChain + FAISS here.
    """
    logger.info(
        "upload_file called for session=%s file=%s (RAG indexing not yet wired)",
        session_id, filename,
    )
    return {"status": "accepted", "filename": filename}


def health_check() -> dict:
    """Verify the Azure OpenAI connection is reachable."""
    client = _get_client()
    deployment = getattr(settings, "AZURE_OPENAI_DEPLOYMENT", "gpt-4o")
    try:
        response = client.chat.completions.create(
            model=deployment,
            messages=[{"role": "user", "content": "ping"}],
            max_tokens=5,
        )
        return {
            "status": "ok",
            "model": response.model,
            "deployment": deployment,
        }
    except Exception as exc:
        logger.exception("Azure OpenAI health check failed: %s", exc)
        raise AIServiceError(str(exc)) from exc
