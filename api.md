# API Reference — Phoenix Eduplan (backend)

This document describes all public API endpoints implemented in this project, their request/response schemas, authentication, and guidance for integrating the frontend.

Summary
- Base API prefix (typical): `/api/` (adjust to your project's URL config). The app contains three main areas:
  - Auth & Users: `/api/auth/...` (implemented in `users/` app)
  - Files: `/api/files/...` (implemented in `files/` app)
  - Chat / AI integration: `/api/chat/...` (implemented in `chat/` app)
- Authentication: JWT (Simple JWT). After login, pass `Authorization: Bearer <access_token>` on protected endpoints.

Common details
- All endpoints that require authentication are protected with `IsAuthenticated` and return 401 when called without a valid token.
- All JSON request bodies use application/json (except multipart file uploads — use multipart/form-data).
- All UUID path parameters are 36-character UUID strings (e.g. `550e8400-e29b-41d4-a716-446655440000`).

Quick integration checklist for frontend
- Login flow: call `/api/auth/login/` to obtain access & refresh tokens. Store the access token (short lived) in memory or secure storage. Use refresh token to renew.
- Add header: `Authorization: Bearer <access_token>` for protected endpoints.
- File uploads: use `multipart/form-data` to `/api/files/upload/` with a `file` field.
- When calling endpoints that may return a file path (audio/video/database exports), expect a local path or URL; the backend copies into MEDIA and returns a full absolute URL.
- Handle 502 responses: these indicate the AI backend (external space) is unreachable; show a user-friendly message and optionally retry.

--

## Auth & Users

### POST /api/auth/register/
Create account.

Request JSON
{
  "email": "user@example.com",
  "first_name": "First",
  "last_name": "Last",
  "password": "P@ssw0rd!",
  "password_confirm": "P@ssw0rd!"
}

Responses
- 201 Created
{
  "message": "Account created successfully.",
  "user": { /* user profile */ },
  "tokens": { "access": "<jwt>", "refresh": "<jwt>" }
}
- 400 Validation errors (e.g. password mismatch)

Notes: `password` is validated via Django password validators.

---

### POST /api/auth/login/
Authenticate and get JWT tokens.

Request JSON (as expected by Simple JWT)
{
  "email": "user@example.com",
  "password": "P@ssw0rd!"
}

Responses
- 200 OK
{
  "refresh": "<refresh_jwt>",
  "access": "<access_jwt>",
  "user": { /* full user profile */ }
}
- 401/400 - invalid credentials

Use: set `Authorization: Bearer <access>` on protected endpoints.

---

### POST /api/auth/logout/
Invalidate (blacklist) refresh token.

Request JSON
{
  "refresh": "<refresh_token>"
}

Responses
- 200 OK { "message": "Logged out successfully." }
- 400 Invalid or missing token

---

### GET /api/auth/profile/
Get authenticated user's profile.

Headers: Authorization

Response
- 200 OK — user profile JSON (see serializer fields)

---

### PATCH /api/auth/profile/update/
Update first & last name.

Request JSON
{
  "first_name": "New",
  "last_name": "Name"
}

Responses
- 200 OK — returns updated user object
- 400 Validation errors

---

### POST /api/auth/profile/picture/
Upload or replace profile picture.

Form: multipart/form-data — field `profile_picture`

Response
- 200 OK — updated user object
- 400 Validation errors (size/type)

---

### DELETE /api/auth/profile/picture/delete/
Remove profile picture.

Response
- 200 OK { "message": "Profile picture deleted." }
- 404 if not set

---

### POST /api/auth/change-password/
Change password while authenticated.

Request JSON
{
  "old_password": "...",
  "new_password": "...",
  "new_password_confirm": "..."
}

Response
- 200 OK on success
- 400 on validation or incorrect old password

---

### POST /api/auth/password-reset/
Request password reset token (development returns token in response).

Request JSON
{
  "email": "user@example.com"
}

Response
- 200 OK { "message": "Password reset token generated...", "dev_token": "<token>" }

---

### POST /api/auth/password-reset/confirm/
Reset password using token.

Request JSON
{
  "token": "<token>",
  "new_password": "...",
  "new_password_confirm": "..."
}

Response
- 200 OK on success
- 400 invalid or expired token

--

## Files API (`files` app)

Base: `/api/files/`

### GET /api/files/
List user's uploaded files.

Headers: Authorization

Response
- 200 OK
{
  "count": <int>,
  "files": [ { uploaded file object } ]
}

UploadedFile serializer fields (key ones):
- id (UUID)
- original_filename
- file_url (absolute URL)
- file_type (extension)
- mime_type
- file_size (bytes)
- status (uploaded|processing|processed|failed)
- ai_summary (text)
- ai_processed_at

---

### POST /api/files/upload/
Upload a file (PDF, DOCX, PPTX, images, CSV, TXT, etc.).

Form: multipart/form-data
- field `file` (the uploaded file)

Response
- 201 Created
{
  "message": "File uploaded successfully.",
  "file": { /* UploadedFileSerializer output */ }
}
- 400 Validation errors

Notes: validation for allowed extensions/mime types is in `files.validators.validate_uploaded_file`.

---

### GET /api/files/<file_id>/
Get details for a single file (includes ai_summary if present).

Response
- 200 OK — UploadedFile object
- 404 if not found or not owner

---

### DELETE /api/files/<file_id>/delete/
Delete a file.

Response
- 200 OK { "message": "File deleted successfully." }

---

### POST /api/files/<file_id>/send-to-ai/
Send a file to the AI service (the Gradio Space) for processing/summarization.

Behavior:
- The view marks file `status='processing'`, uploads the file (via gradio_client) to the Space endpoint `/on_process`, and records returned summary into `ai_summary` and sets status `processed` / `failed`.
- This endpoint expects the backend to have network access to the Space.

Response
- 200 OK with updated file object and optional `ai_error` if processing failed.
- 404 when file not found.

Notes for frontend: call this after upload to trigger AI processing.

---

### POST /api/files/<file_id>/ai-summary/
Webhook endpoint for manually storing a summary returned by AI (used if the AI calls back to your backend).

Request JSON
{
  "file_id": "<uuid>",
  "summary": "...",
  "status": "processed" | "failed"
}

Response
- 200 OK on success
- 400 Validation errors

--

## Chat & AI integration (`chat` app)

Base: `/api/chat/`

All chat endpoints require `Authorization: Bearer <access_token>`.

### GET /api/chat/sessions/
List user's chat sessions.

Response
- 200 OK
{ "count": N, "sessions": [ /* ChatSessionListSerializer objects */ ] }

ChatSession list fields include: id, title, message_count, last_message preview, created_at, last_activity_at.

---

### POST /api/chat/sessions/create/
Create a new chat session.

Request JSON
{ "title": "Optional title" }

Response: 201 Created
{ "message": "Chat session created.", "session": { session object } }

---

### GET /api/chat/sessions/<session_id>/
Get session details including messages (ChatSessionDetailSerializer).

Response
- 200 OK — includes `messages` list (each message serialized by `ChatMessageSerializer`)

---

### DELETE /api/chat/sessions/<session_id>/delete/
Delete a session.

Response
- 200 OK on success

---

### GET /api/chat/sessions/<session_id>/history/
Get chronological history of messages for a session.

Response
- 200 OK
{
  "session_id": "<uuid>",
  "title": "...",
  "message_count": <int>,
  "messages": [ { ChatMessageSerializer } ]
}

ChatMessage fields (key ones): id, sender (user|ai), message_type (text|file|ai_response), content, attached_file (if any), is_read, created_at.

---

### POST /api/chat/sessions/<session_id>/attach-file/
Attach an existing uploaded file to a session (creates a ChatMessage of type `file`).

Request JSON
{ "file_id": "<uuid>" }

Response
- 201 Created with created ChatMessage object

---

### POST /api/chat/messages/send/
Main message send endpoint. This stores the user message and forwards the message to the external AI Space (ziad177777/EduPlan) using `gradio_client`.

Request JSON (SendMessageSerializer)
{
  "content": "Hello, explain X",
  "attached_file_id": "<uuid>" (optional),
  "session_id": "<uuid>" (optional)  // if absent a new session is created
}

Validation: either content or attached_file_id must be present.

Behavior
- Creates a ChatMessage (sender=user)
- Calls the external Space `/chat_logic` via gradio_client with `message` and `username` (username passed as user id string)
- The returned AI content is stored as a ChatMessage (sender=ai)

Responses
- 201 Created
{
  "session_id": "<uuid>",
  "session_created": true|false,
  "user_message": { /* ChatMessage */ },
  "ai_message": { /* ChatMessage or null */ },
  "ai_error": null | "error string"
}

Errors
- 400 on validation errors
- 502 if the AI client fails (for example if the Space is down)

Frontend integration tips
- Call this endpoint when the user submits a chat input. Show a loading state while waiting. If `ai_error` is present, show a friendly error and optionally retry.
- Use the returned `user_message` and `ai_message` to update the chat UI in-place, rather than re-fetching the entire session.

---

### POST /api/chat/sessions/<session_id>/ai-response/
Webhook for external AI to store its response (if the AI service pushes results back). This is mainly internal and requires authentication.

Request JSON (AIResponseWebhookSerializer)
{
  "session_id": "<uuid>",
  "content": "...",
  "message_type": "ai_response" | "ai_summary"
}

Response
- 201 Created { "message": "AI response stored.", "ai_message": { ... } }

---

### POST /api/chat/plan/generate/
Generate a study plan from active documents.

Request JSON
{ "duration": "1 week" | "2 weeks" | "1 month", "lang": "auto" | "en" | "ar" }

Response
- 200 OK { "duration": ..., "lang": ..., "plan": "<markdown or text>" }
- 502 if AI backend unreachable

---

### POST /api/chat/grade/
Grade an essay.

Request JSON
{ "essay_text": "...", "rubric": "optional", "lang_choice": "auto"|"en"|"ar" }

Response
- 200 OK { "feedback": "<AI string>" }

---

### POST /api/chat/audio/generate/
Generate audio (TTS) from text (or from uploaded documents via backend logic).

Request JSON
{ "text": "...", "lang": "auto" | "en" | "ar" }

Behavior
- Calls the external Space endpoints to generate audio. The backend then stores a copy in MEDIA and returns a public URL.

Response
- 200 OK { "audio_url": "https://<host>/media/generated/audio/<user_id>/<file>.mp3" }
- 502 on AI backend failures

Notes for frontend
- This endpoint requires the user to be authenticated.
- After receiving `audio_url`, you can play it in an HTML5 <audio> element.

---

### POST /api/chat/video/generate/
Generate a video from text (slides + TTS) via the Space.

Request JSON
{ "text": "...", "lang": "auto" | "en" | "ar" }

Response
- 200 OK { "video_url": "https://<host>/media/generated/video/<user_id>/<file>.mp4" }

---

### POST /api/chat/vocab/generate/
Generate vocabulary extraction from user's documents.

Request JSON
{ "lang": "auto" | "en" | "ar" }

Response
- 200 OK { "lang": "...", "vocab": "<markdown/text>" }

---

### GET /api/chat/analytics/
Get analytics about user's activity.

Response
- 200 OK { "analytics": "<markdown/report>" }

---

### GET /api/chat/export/db/
Proxy to fetch the AI space's SQLite DB for debugging. Backend copies the DB into MEDIA and returns a public URL.

Response
- 200 OK { "download_url": "https://<host>/media/generated/exports/<user_id>/file.db" }

---

### GET /api/chat/export/history/
Proxy to fetch user's history ZIP from the AI Space and return a public URL.

Response
- 200 OK { "download_url": "https://<host>/media/generated/exports/<user_id>/history.zip" }


## Error model and codes
- 200 OK — Successful read operations or successful actions.
- 201 Created — Successful resource creation (sessions, messages, uploads).
- 400 Bad Request — Validation errors.
- 401 Unauthorized — Missing or invalid JWT.
- 404 Not Found — Resource doesn't exist or doesn't belong to user.
- 502 Bad Gateway — Upstream AI service (Hugging Face Space) unreachable or returned error.

When a 502 is returned the JSON body contains `{"error": "AI client error: ..."}`.


## Frontend integration guide

Authentication
- Use `/api/auth/login/` to obtain `access` and `refresh` tokens.
- Attach header `Authorization: Bearer <access>` to all protected endpoints.
- Use the refresh endpoint `/api/auth/token/refresh/` when access token expires.

File upload & AI processing
- Upload file to `/api/files/upload/` using `multipart/form-data`.
- The server returns an UploadedFile object with its `id`.
- To have the AI process the file, POST to `/api/files/<file_id>/send-to-ai/`.
- Poll `/api/files/` or GET `/api/files/<file_id>/` to check `status` and `ai_summary`.

Chat UI
- To open or create sessions: call `/api/chat/sessions/` and `/api/chat/sessions/create/`.
- When user submits a message, POST `/api/chat/messages/send/` with `content` and optional `session_id`.
- The response contains both the stored `user_message` and `ai_message` (or `ai_error`).
- Update the chat UI using those returned message objects.

Playing generated media
- Call `/api/chat/audio/generate/` or `/api/chat/video/generate/`.
- The backend returns `audio_url` / `video_url` which are absolute URLs. Use these directly in <audio>/<video> tags.

Handling failures gracefully
- For 502 errors due to AI backend failures, display a helpful message and provide a retry option.
- For long-running generation operations (video), indicate progress in UI and consider polling to avoid blocking.

Security notes
- Do not store access tokens in localStorage unencrypted on shared devices; prefer in-memory and refresh when needed.
- All file uploads should be validated on the backend (the project already validates types/size for some endpoints).


## Appendix — Example frontend snippets

Fetch with access token (JSON request):

```javascript
const token = localStorage.getItem('access');
const resp = await fetch('/api/chat/messages/send/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ content: 'Explain Newton laws' })
});
const data = await resp.json();
```

File upload (multipart):

```javascript
const token = localStorage.getItem('access');
const formData = new FormData();
formData.append('file', fileInput.files[0]);
const resp = await fetch('/api/files/upload/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});
const data = await resp.json();
```

Play generated audio:

```html
<audio controls src="{{audio_url}}"></audio>
```


## Final notes
- The API design keeps the AI integration behind the backend so the frontend doesn't need direct HF credentials.
- If you want the frontend to call the Hugging Face Space directly (e.g., in a client-side deployment), you'll need to update the Space to accept and authenticate such calls.
- I can extend this `api.md` with OpenAPI / Swagger-compatible schema generation using DRF's schema generators (e.g., `spectacular` or `drf-yasg`) if you want an auto-generated, machine-readable API spec.

If you'd like, I can:
- Produce an OpenAPI (YAML/JSON) file from your views/serializers.
- Add example Postman collection.
- Add unit tests for the endpoints and the new helpers.

