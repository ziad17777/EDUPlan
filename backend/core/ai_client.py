"""
ai_client.py — AI provider integration for EDUPlan.

Supports Azure OpenAI and Hugging Face (Llama 3.3-compatible) behind one
stable API used by chat/views.py and files/views.py.
"""

import logging
import requests
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


def _get_provider() -> str:
    return getattr(settings, "AI_PROVIDER", "azure").strip().lower()


def _get_system_prompt() -> str:
    return getattr(settings, "AI_SYSTEM_PROMPT", "").strip()


def _build_hf_prompt(message: str, history: list[dict[str, str]]) -> str:
    system_prompt = _get_system_prompt()
    sections = []
    if system_prompt:
        sections.append(f"System:\n{system_prompt}")
    for item in history:
        role = item.get("role", "")
        content = item.get("content", "")
        if not content:
            continue
        speaker = "Assistant" if role == "assistant" else "User"
        sections.append(f"{speaker}:\n{content}")
    sections.append(f"User:\n{message}\nAssistant:")
    return "\n\n".join(sections)


def _send_via_azure(message: str, history: list[dict[str, str]]) -> dict:
    client = _get_client()
    deployment = getattr(settings, "AZURE_OPENAI_DEPLOYMENT", "gpt-4o")
    messages = [{"role": "system", "content": _get_system_prompt()}]
    messages.extend(history)
    messages.append({"role": "user", "content": message})

    try:
        response = client.chat.completions.create(
            model=deployment,
            messages=messages,
            temperature=getattr(settings, "AI_TEMPERATURE", 0.7),
            max_tokens=getattr(settings, "AI_MAX_TOKENS", 1024),
        )
    except Exception as exc:
        logger.exception("Azure OpenAI chat request failed: %s", exc)
        raise AIServiceError(f"Azure OpenAI error: {exc}") from exc

    reply = response.choices[0].message.content
    return {"reply": reply}


def _send_via_huggingface(message: str, history: list[dict[str, str]]) -> dict:
    api_key = getattr(settings, "HUGGINGFACE_API_KEY", "")
    model = getattr(settings, "HUGGINGFACE_MODEL", "")
    endpoint = getattr(settings, "HUGGINGFACE_API_URL", "")
    if not api_key:
        raise AIServiceError("HUGGINGFACE_API_KEY must be set for Hugging Face provider.")
    if not model:
        raise AIServiceError("HUGGINGFACE_MODEL must be set for Hugging Face provider.")
    if not endpoint:
        raise AIServiceError("HUGGINGFACE_API_URL must be set for Hugging Face provider.")

    payload = {
        "inputs": _build_hf_prompt(message=message, history=history),
        "parameters": {
            "max_new_tokens": getattr(settings, "AI_MAX_TOKENS", 1024),
            "temperature": getattr(settings, "AI_TEMPERATURE", 0.7),
            "return_full_text": False,
        },
    }
    timeout = getattr(settings, "AI_REQUEST_TIMEOUT_SECONDS", 60)
    headers = {
        "Authorization": "Bearer " + api_key,
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(
            endpoint,
            headers=headers,
            json=payload,
            timeout=timeout,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        logger.exception("Hugging Face chat request failed: %s", exc)
        raise AIServiceError(f"Hugging Face error: {exc}") from exc

    data = response.json()
    reply = None
    if isinstance(data, list) and data:
        reply = data[0].get("generated_text")
    elif isinstance(data, dict):
        reply = data.get("generated_text")
        if not reply and data.get("error"):
            raise AIServiceError(f"Hugging Face error: {data.get('error')}")

    if not reply:
        raise AIServiceError("Hugging Face returned no generated_text.")
    return {"reply": reply.strip()}


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
    provider = _get_provider()
    if provider == "azure":
        return _send_via_azure(message=message, history=history)
    if provider == "huggingface":
        return _send_via_huggingface(message=message, history=history)
    raise AIServiceError(f"Unsupported AI_PROVIDER '{provider}'. Use 'azure' or 'huggingface'.")


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
    """Verify the configured AI provider connection is reachable."""
    provider = _get_provider()
    if provider == "azure":
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
                "provider": "azure",
                "model": response.model,
                "deployment": deployment,
            }
        except Exception as exc:
            logger.exception("Azure OpenAI health check failed: %s", exc)
            raise AIServiceError(str(exc)) from exc

    if provider == "huggingface":
        model = getattr(settings, "HUGGINGFACE_MODEL", "")
        _send_via_huggingface(message="ping", history=[])
        return {
            "status": "ok",
            "provider": "huggingface",
            "model": model,
        }

    raise AIServiceError(f"Unsupported AI_PROVIDER '{provider}'.")
