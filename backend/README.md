# AI File & Chat Backend

A complete Django REST Framework backend for an AI-powered file processing and chat application.

---

## Tech Stack

- **Python 3.11+**
- **Django 5** — web framework
- **Django REST Framework** — API layer
- **SimpleJWT** — JWT authentication
- **SQLite** — default database (swap for PostgreSQL in production)
- **Pillow** — image processing for profile pictures

---

## AI Provider Configuration

The chat integration supports:
- `AI_PROVIDER=azure` (default)
- `AI_PROVIDER=huggingface` (for models like `meta-llama/Llama-3.3-70B-Instruct`)

Set values in `.env` (copy from `.env.example`):
- Shared preferences: `AI_SYSTEM_PROMPT`, `AI_TEMPERATURE`, `AI_MAX_TOKENS`
- Azure: `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT`
- Hugging Face: `HUGGINGFACE_API_KEY`, `HUGGINGFACE_MODEL` (optional `HUGGINGFACE_API_URL`)

---

## How to run

```bash
# 1. Clone and enter the project
cd ai_backend_project

# 2. Create a virtual environment
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Apply database migrations
python manage.py makemigrations
python manage.py migrate

# 5. Create a superuser (for Django admin)
python manage.py createsuperuser

# 6. Run the development server
python manage.py runserver
```

Server runs at: **http://127.0.0.1:8000/**
Admin panel: **http://127.0.0.1:8000/admin/**

---

## API

### Authentication (`/api/auth/`)

| Method | Endpoint                            | Auth   | Description                     |
| ------ | ----------------------------------- | ------ | ------------------------------- |
| POST   | `/api/auth/register/`               | Public | Register new user               |
| POST   | `/api/auth/login/`                  | Public | Login, returns JWT tokens       |
| POST   | `/api/auth/logout/`                 | ✅     | Blacklist refresh token         |
| POST   | `/api/auth/token/refresh/`          | Public | Refresh access token            |
| GET    | `/api/auth/profile/`                | ✅     | Get user profile                |
| PATCH  | `/api/auth/profile/update/`         | ✅     | Update name fields              |
| POST   | `/api/auth/profile/picture/`        | ✅     | Upload profile picture          |
| DELETE | `/api/auth/profile/picture/delete/` | ✅     | Delete profile picture          |
| POST   | `/api/auth/change-password/`        | ✅     | Change password (authenticated) |
| POST   | `/api/auth/password-reset/`         | Public | Request password reset token    |
| POST   | `/api/auth/password-reset/confirm/` | Public | Confirm password reset          |

### File Management (`/api/files/`)

| Method | Endpoint                           | Auth | Description                                 |
| ------ | ---------------------------------- | ---- | ------------------------------------------- |
| POST   | `/api/files/upload/`               | ✅   | Upload file (max 20MB, allowed types only)  |
| GET    | `/api/files/`                      | ✅   | List all user files                         |
| GET    | `/api/files/<file_id>/`            | ✅   | Get file metadata                           |
| DELETE | `/api/files/<file_id>/delete/`     | ✅   | Delete file                                 |
| POST   | `/api/files/<file_id>/send-to-ai/` | ✅   | [PLACEHOLDER] Trigger AI file processing    |
| POST   | `/api/files/<file_id>/ai-summary/` | ✅   | [PLACEHOLDER] AI service posts summary here |

### Chat System (`/api/chat/`)

| Method | Endpoint                                       | Auth | Description                                          |
| ------ | ---------------------------------------------- | ---- | ---------------------------------------------------- |
| GET    | `/api/chat/sessions/`                          | ✅   | List all chat sessions                               |
| POST   | `/api/chat/sessions/create/`                   | ✅   | Explicitly create a session                          |
| GET    | `/api/chat/sessions/<session_id>/`             | ✅   | Get session details + messages                       |
| DELETE | `/api/chat/sessions/<session_id>/delete/`      | ✅   | Delete session                                       |
| GET    | `/api/chat/sessions/<session_id>/history/`     | ✅   | Full message history                                 |
| POST   | `/api/chat/sessions/<session_id>/attach-file/` | ✅   | Attach file to session                               |
| POST   | `/api/chat/messages/send/`                     | ✅   | Send message (auto-creates session if no session_id) |
| POST   | `/api/chat/sessions/<session_id>/ai-response/` | ✅   | [PLACEHOLDER] AI service posts response here         |

---

## File Validation Rules

| Max file size | **20 MB**                                  |
| Allowed types | PDF, DOCX, PPTX, XLSX, CSV, JPG, JPEG, PNG |




## AI Integration Guide (For AI Team)

The backend exposes two webhook-style endpoints that the AI service should call:

### File Summary

```
POST /api/files/<file_id>/ai-summary/
Authorization: Bearer <token>
Content-Type: application/json

{
  "file_id": "<uuid>",
  "summary": "This document discusses...",
  "status": "processed"
}
```

### Chat Response

```
POST /api/chat/sessions/<session_id>/ai-response/
Authorization: Bearer <token>
Content-Type: application/json

{
  "session_id": "<uuid>",
  "content": "Based on the file, here is the answer...",
  "message_type": "ai_response"
}
```

---

## Security Notes (Before Going to Production)

1. Replace `SECRET_KEY` with a secure random value from an environment variable.
2. Set `DEBUG=False` and restrict `ALLOWED_HOSTS`.
3. Switch `CORS_ALLOW_ALL_ORIGINS = True` to a whitelist of trusted origins.
4. Replace SQLite with PostgreSQL.
5. Store files in S3 or equivalent (not local disk).
6. Add rate limiting to auth endpoints (use `django-ratelimit` or a reverse proxy).
7. Implement real email sending for password reset (remove `dev_token` from response).
8. Add HTTPS enforcement.
