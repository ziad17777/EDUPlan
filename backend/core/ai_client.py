import requests
from django.conf import settings


class AIServiceError(RuntimeError):
    pass


def _base_url() -> str:
    base = getattr(settings, "AI_SERVICE_BASE_URL", "")
    if not base:
        raise AIServiceError("AI service base URL is not configured.")
    return base.rstrip("/")


def _headers() -> dict:
    headers = {}
    token = getattr(settings, "AI_SERVICE_TOKEN", "")
    if token:
        headers["X-Internal-Token"] = token
    return headers


def _timeout() -> int:
    return int(getattr(settings, "AI_SERVICE_TIMEOUT", 60))


def _request(method: str, path: str, **kwargs):
    url = f"{_base_url()}{path}"
    headers = _headers()
    extra_headers = kwargs.pop("headers", None)
    if extra_headers:
        headers.update(extra_headers)
    try:
        response = requests.request(method, url, headers=headers, timeout=_timeout(), **kwargs)
    except requests.RequestException as exc:
        raise AIServiceError(str(exc)) from exc
    if response.status_code >= 400:
        raise AIServiceError(f"AI service error ({response.status_code})")
    if response.content:
        try:
            return response.json()
        except ValueError:
            return {"raw": response.text}
    return {}


def send_chat_message(session_id: str, username: str, message: str, history: list[dict[str, str]]):
    payload = {
        "session_id": str(session_id),
        "username": username,
        "message": message,
        "history": history,
    }
    return _request("post", "/api/chat", json=payload)


def upload_file(session_id: str, username: str, file_path: str, filename: str, content_type: str):
    with open(file_path, "rb") as handle:
        files = {"files": (filename, handle, content_type)}
        data = {"session_id": str(session_id), "username": username}
        return _request("post", "/api/upload", data=data, files=files)


def health_check():
    return _request("get", "/api/health")
