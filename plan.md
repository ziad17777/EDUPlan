# Integration Plan — Frontend ↔ Backend API

Last updated: 2026-06-14

Purpose
- Provide a prioritized, actionable plan to integrate the Django REST API (described in `Backend.md` and `api.md`) with this React frontend.
- Include per-endpoint developer prompts, UI mapping, edge cases, and verification steps. No code changes here — this is a plan and a set of prompts to implement the integration safely.

Assumptions
- Frontend base API URL: `window.EDUPLAN_API_BASE` or fallback `http://127.0.0.1:8000/api`.
- LocalStorage keys used by the app: `eduplan_tokens` (object with { access, refresh }) and `eduplan_user` (legacy user object).
- The frontend will attach `Authorization: Bearer <access>` for protected endpoints and will call refresh when a 401 is returned.
- Backend endpoints and shapes are those documented in `api.md` and `Backend.md`.

High-level priorities (order to implement)
1. Authentication (register, login/refresh, logout, profile) — required for everything else.
2. File Management (upload, list, delete, file detail) — important for AI features and chat attachments.
3. Chat System (sessions, messages send/list) — depends on auth and files.
4. AI webhooks / placeholders (ai-summary, ai-response) — server-to-server hooks; frontend only needs to show status / ai summary when present.

Quality gates (for every integration step)
- Lint & typecheck (run project lint/ts/ESLint if configured).
- Smoke test each endpoint with a minimal happy-path call from the UI.
- Add unit tests / integration tests where feasible (local fetch mocks or jest/msw tests).
- Verify in browser: tokens stored under `eduplan_tokens`; Authorization header present for protected calls; refresh flow works on 401.

Token handling policy (recommended)
- Store tokens in `localStorage.eduplan_tokens` as { access, refresh } (existing pattern).
- Use a single helper (`authedFetch` or equivalent) that:
  - Attaches `Authorization: Bearer <access>` to the request when available.
  - On 401 and if a refresh token exists, call POST `/api/auth/token/refresh/` with { refresh } to obtain { access } and retry the original request once.
  - If refresh fails, clear tokens and surface a soft sign-in prompt or navigate to the sign-in page.

Detailed integration checklist and prompts by area

1) Authentication
- Endpoints to integrate
  * POST /api/auth/register/ — create account and receive tokens + user
  * POST /api/auth/login/ — obtain { refresh, access, user }
  * POST /api/auth/token/refresh/ — send { refresh } and receive { access }
  * POST /api/auth/logout/ — blacklist refresh (optional, call with Authorization)
  * GET /api/auth/profile/ — (if available) fetch full profile
  * PATCH /api/auth/profile/update/, POST profile picture endpoints, etc.

- Frontend tasks
  1. Implement login and register forms to POST the documented payload shapes. Persist returned tokens to `eduplan_tokens` and user info to `eduplan_user` (or user context).
  2. Implement a central `auth` provider/context with signin/signup/signout and a short-lived in-memory `user` object for UI state.
  3. Implement `authRefresh(refreshToken)` wrapper that calls `/api/auth/token/refresh/` and returns the new access token (or normalized response). Use it from authedFetch.
  4. Silent refresh on app mount (optional but recommended): when the app initializes and an access token is present but expired, attempt refresh using refresh token. If refresh succeeds, keep user signed in; otherwise clear tokens.

- Prompts for implementer (copy-paste friendly)
  * "Implement a signin function that POSTs to `/api/auth/login/` with `{ email, password }`, saves `{ access, refresh }` to `localStorage.eduplan_tokens`, and stores `{ username }` in `localStorage.eduplan_user`. On success navigate to `/app`. On 401 show invalid credentials." 
  * "Implement `authRefresh(refresh)` that POSTs to `/api/auth/token/refresh/` with `{ refresh }`, returns `{ access }` on 200, and returns a normalized error when 401 happens." 
  * "Add a top-level silent refresh effect in `AuthProvider` that runs once on mount: if access token is present but decoding/validation fails, call `authRefresh()` and update stored tokens. If refresh fails, clear tokens and set unauthenticated state." 

Edge cases and UX decisions for auth
- Refresh token expiration: show a modal 'Session expired — please sign in' rather than immediate redirect from every component. Give the user a chance to stay on the page and sign in.
- Concurrent refresh requests: ensure only one refresh runs at a time (a small queue or lock) and subsequent requests wait for it.
- Persisted user object vs server profile: prefer reading basic claims from decoded access token for immediate UI; call GET /api/auth/profile/ when available to populate richer fields and allow edits.

2) File Management
- Endpoints to integrate
  * POST /api/files/upload/ — multipart/form-data with field `file` (max 20MB, allowed types)
  * GET /api/files/ — list user files
  * GET /api/files/<file_id>/ — file metadata
  * DELETE /api/files/<file_id>/delete/ — delete a file
  * POST /api/files/<file_id>/send-to-ai/ — trigger processing

- Frontend tasks
  1. Create a file uploader component that:
     - Validates extension and size client-side before upload (match server allowed types and 20MB limit).
     - Uses `multipart/form-data` and the `file` field when POSTing.
     - Uses `authedFetch` that supports refresh-and-retry for 401.
     - Shows per-file upload progress/status (uploading, uploaded, error).
  2. Create a file list page/side-panel showing server files via GET `/api/files/`. Map server `file_url` to full URL by prefixing API base.
  3. Wire Delete button to call DELETE `/api/files/<id>/delete/` and remove from UI on success.
  4. Allow attachment of existing uploaded file to chat session (see Chat section).

- Prompts for implementer
  * "Implement a document uploader component that POSTs a FormData containing `file` to `/api/files/upload/`. Use `authedFetch` (attaches Authorization and auto-refreshes). On 201, add returned `file` to the local file list." 
  * "Implement GET `/api/files/` consumer: fetch the list, display name, uploaded_at, file_size_mb, status, and a 'Review' link that opens the file URL (API base + file.file_url)." 
  * "Implement DELETE `/api/files/<id>/delete/` on the server; frontend should call it and on 200 remove the item from the list and show a success toast." 

Edge cases and UX
- Large files and upload interruptions: implement retry/backoff (optional) or show clear error with retry button.
- Simultaneous uploads: queue or allow parallel uploads with per-file progress indicators.
- Invalid files: pre-validate types by extension + optional MIME check, show immediate rejection before server call.

3) Chat System
- Endpoints to integrate
  * GET /api/chat/sessions/ — list sessions
  * POST /api/chat/sessions/create/ — create session (optional)
  * GET /api/chat/sessions/<id>/ — session detail + messages
  * GET /api/chat/sessions/<id>/history/ — full history
  * POST /api/chat/messages/send/ — send a message; may create session automatically
  * POST /api/chat/sessions/<id>/attach-file/ — attach existing uploaded file to session

- Frontend tasks
  1. Implement Sessions list view to call GET `/api/chat/sessions/`, render last_message, message_count and link to session detail.
  2. Implement Chat view (session detail) that loads messages and renders them. Use GET `/api/chat/sessions/<id>/` (or /history/ for full history).
  3. Send messages via POST `/api/chat/messages/send/` with `{ content, attached_file_id?, session_id? }`. On 201, append user_message and ai_message (if any) returned by server.
  4. Attach a file to session using POST `/api/chat/sessions/<id>/attach-file/` with `{ file_id }`. Append returned chat message.
  5. Handle optimistic UI for sending messages (show sending state); replace with server message on success or error state on failure.

- Prompts for implementer
  * "Implement message sending: POST `/api/chat/messages/send/` with `{ content, session_id?, attached_file_id? }`. On 201 append `user_message` and `ai_message` from response. If `ai_message` is null, show a pending spinner until webhook/ai-response is received (or poll if webhook not available)." 
  * "Implement session list: GET `/api/chat/sessions/` and map each entry to a clickable item that opens `/app/chat/:sessionId`. Include 'new session' button that POSTs to `/api/chat/sessions/create/` if explicit creation is desired." 

Edge cases and UX
- AI may be slow: display a pending state for ai reply and allow cancellation of requests where supported.
- Chat messages might be posted by external AI webhooks; if webhook behavior is asynchronous, consider WebSocket or polling strategy (or rely on server push if available).

4) AI webhooks and status
- The frontend only needs to display file status and AI-generated summaries or message replies when the server provides them. No direct client-to-AI calls are required.
- For placeholders like `/api/files/<id>/ai-summary/` and `/api/chat/.../ai-response/` the frontend should poll file/message status or check the returned objects for `ai_summary` fields and display them.

Testing & verification checklist
- Auth
  - Register a new account => tokens stored and user set; navigating to /app shows app UI.
  - Expire access token (manually or by time) => authedFetch should call refresh and retry; UI still works if refresh valid.
  - Expire refresh token => authedFetch should clear tokens and app should show sign-in flows.

- Files
  - Upload valid file (<=20MB, allowed type) => server returns 201 and file appears in list with correct URL.
  - Upload invalid file (type/size) => show client-side rejection or server 400 with error display.
  - Delete file => removed from list.

- Chat
  - Create session and send message => new session created (if server does) and messages shown.
  - Attach an uploaded file to a message => server returns chat message with attached file.

Developer prompts / copy-paste integration snippets (plain language)
- Authentication:
  - "Add a signin handler in `AuthProvider` that POSTs `email`/`password` to `/api/auth/login/`. On 200 save `access` and `refresh` to `localStorage.eduplan_tokens` and user info to `localStorage.eduplan_user`. Use `navigate('/app')` on success and show errors on failure."
  - "Implement `authRefresh(refreshToken)` which posts to `/api/auth/token/refresh/` and returns the new access token. Ensure calling code stores the updated access token." 

- Files:
  - "Implement a `DocumentUploader` that validates file size <= 20MB then posts FormData with field `file` to `/api/files/upload/`. Ensure `Content-Type` is not manually set (browser sets boundary). Use `authedFetch` so requests refresh on 401. On 201 add returned file object to the UI list." 
  - "Implement `getFiles()` which GETs `/api/files/` and transforms the response shape `{ count, files }` into the local list model. Prefix `file_url` with API base to create a downloadable link." 

- Chat:
  - "Implement `sendMessage({ content, session_id, attached_file_id })` that POSTs to `/api/chat/messages/send/`. On 201 update UI with `user_message` and `ai_message`. If `ai_message` missing, show pending state and poll session history or rely on webhook updates." 

Operational notes & backend pre-requisites
- Ensure backend runs migrations (`python manage.py migrate`) and that `django-cors-headers` is configured for your frontend origin (development: allow `http://localhost:5173`).
- Confirm exact endpoint paths for files and auth on your running backend; docs provide both `/api/files/upload/` and an older `/api/files/` listing — standardize on the canonical paths in `api.md`.

Recording decisions / versioning
- When implementing, commit small atomic changes and add tests for each API integration point.
- Use feature flags or an environment variable to flip between mocked API and real API while developing (helps CI and demos).

Wrap-up
- This plan prioritizes auth and resilient token handling, then files, then chat. It recommends a single `authedFetch` helper (refresh-and-retry) and explicit UX choices for session expiry. Each endpoint has a corresponding natural-language prompt you can use to implement the integration.
- If you want, I can now:
  - Generate per-endpoint code stubs (fetch wrappers, types, and minimal UI hooks), or
  - Create a checklist PR that implements the `authedFetch` and silent-refresh in `AuthProvider` and wires the uploader to it.
