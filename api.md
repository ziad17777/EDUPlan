# API Reference

This document describes all public API endpoints, HTTP methods, request and response schemas (JSON), and possible error responses with HTTP status codes.

Notes:
- All endpoints under `/api/` return JSON responses.
- Endpoints marked with ✅ require an Authorization header: `Authorization: Bearer <access_token>`.
- UUIDs are strings in standard UUID format.

## Authentication (/api/auth/)

### POST /api/auth/register/
- Auth: Public
- Description: Register a new user and return initial JWT tokens and user profile.

Request (application/json):
{
  "email": "user@example.com",
  "first_name": "First",
  "last_name": "Last",
  "password": "strongPassword123!",
  "password_confirm": "strongPassword123!"
}

Success (201 Created):
{
  "message": "Account created successfully.",
  "user": { /* UserProfile object */ },
  "tokens": {
    "access": "<jwt_access>",
    "refresh": "<jwt_refresh>"
  }
}

Errors:
- 400 Bad Request — validation errors (email invalid, passwords don't match, weak password)

---

### POST /api/auth/login/
- Auth: Public
- Description: Obtain JWT tokens using credentials.

Request (application/json):
{
  "email": "user@example.com",
  "password": "..."
}

Success (200 OK):
{
  "refresh": "<refresh_token>",
  "access": "<access_token>",
  "user": { /* UserProfile object */ }
}

Errors:
- 401 Unauthorized — invalid credentials

---

### POST /api/auth/logout/
- Auth: ✅
- Description: Blacklist the provided refresh token.

Request (application/json):
{
  "refresh": "<refresh_token>"
}

Success (200 OK):
{
  "message": "Logged out successfully."
}

Errors:
- 400 Bad Request — missing refresh token or invalid/expired token
- 401 Unauthorized — missing/invalid access token

---

### POST /api/auth/token/refresh/
- Auth: Public (uses refresh token)
- Description: Exchange a refresh token for a new access token.

Request:
{
  "refresh": "<refresh_token>"
}

Success (200 OK):
{
  "access": "<new_access_token>"
}

Errors:
- 401 Unauthorized — invalid or expired refresh token

---

### GET /api/auth/profile/
- Auth: ✅
- Description: Get authenticated user's profile.

Success (200 OK): UserProfile object

UserProfile schema:
{
  "id": "<uuid>",
  "email": "user@example.com",
  "first_name": "First",
  "last_name": "Last",
  "full_name": "First Last",
  "profile_picture_url": "https://.../media/..",
  "date_joined": "2025-01-01T12:00:00Z",
  "updated_at": "2025-01-02T12:00:00Z"
}

Errors:
- 401 Unauthorized — missing/invalid access token

---

### PATCH /api/auth/profile/update/
- Auth: ✅
- Description: Update first_name and/or last_name.

Request (application/json):
{
  "first_name": "New",
  "last_name": "Name"
}

Success (200 OK):
{
  "message": "Profile updated successfully.",
  "user": { /* UserProfile object */ }
}

Errors:
- 400 Bad Request — validation errors
- 401 Unauthorized

---

### POST /api/auth/profile/picture/
- Auth: ✅
- Description: Upload or replace profile picture. Multi-part form.

Request (multipart/form-data):
- profile_picture: file (JPEG or PNG, max 5MB)

Success (200 OK):
{
  "message": "Profile picture updated.",
  "user": { /* UserProfile object */ }
}

Errors:
- 400 Bad Request — invalid file type or too large
- 401 Unauthorized

---

### DELETE /api/auth/profile/picture/delete/
- Auth: ✅
- Description: Delete profile picture.

Success (200 OK):
{ "message": "Profile picture deleted." }

Errors:
- 404 Not Found — no profile picture to delete
- 401 Unauthorized

---

### POST /api/auth/change-password/
- Auth: ✅
- Description: Change password for authenticated user.

Request (application/json):
{
  "old_password": "...",
  "new_password": "newStrongPass123!",
  "new_password_confirm": "newStrongPass123!"
}

Success (200 OK):
{ "message": "Password changed successfully." }

Errors:
- 400 Bad Request — validation errors or old password incorrect
- 401 Unauthorized

---

### POST /api/auth/password-reset/
- Auth: Public
- Description: Request password reset token (development returns token in response).

Request (application/json):
{ "email": "user@example.com" }

Success (200 OK):
{
  "message": "Password reset token generated. In production, this would be emailed.",
  "dev_token": "<token>"
}

Errors:
- 400 Bad Request — invalid email format

---

### POST /api/auth/password-reset/confirm/
- Auth: Public
- Description: Reset password using token.

Request (application/json):
{
  "token": "<token>",
  "new_password": "...",
  "new_password_confirm": "..."
}

Success (200 OK):
{ "message": "Password reset successfully." }

Errors:
- 400 Bad Request — invalid/expired token, validation errors

---

## File Management (/api/files/)

### POST /api/files/upload/
- Auth: ✅
- Description: Upload a file. (File validators in `files.validators` enforce allowed types and size.)
- Request: multipart/form-data with `file` field.

Success (201 Created):
{
  "message": "File uploaded successfully.",
  "file": { /* UploadedFile object */ }
}

UploadedFile schema:
{
  "id": "<uuid>",
  "original_filename": "document.pdf",
  "file_url": "https://.../media/uploads/...",
  "file_type": "pdf",
  "mime_type": "application/pdf",
  "file_size": 12345,
  "file_size_mb": 0.012,
  "status": "uploaded|processing|processed|failed",
  "ai_summary": "...",
  "ai_processed_at": "2025-01-02T12:00:00Z",
  "uploaded_at": "2025-01-01T12:00:00Z",
  "updated_at": "2025-01-02T12:00:00Z"
}

Errors:
- 400 Bad Request — no file provided, invalid file type, file too large
- 401 Unauthorized

---

### GET /api/files/
- Auth: ✅
- Description: List files belonging to the authenticated user.

Success (200 OK):
{
  "count": 2,
  "files": [ /* array of UploadedFile objects */ ]
}

Errors:
- 401 Unauthorized

---

### GET /api/files/<file_id>/
- Auth: ✅
- Description: Get detail metadata for a specific file.

Success (200 OK): UploadedFile object

Errors:
- 404 Not Found — file not found or does not belong to user
- 401 Unauthorized

---

### DELETE /api/files/<file_id>/delete/
- Auth: ✅
- Description: Delete a user's file.

Success (200 OK): { "message": "File deleted successfully." }

Errors:
- 404 Not Found — file not found or not owned by user
- 401 Unauthorized

---

### POST /api/files/<file_id>/send-to-ai/
- Auth: ✅
- Description: Send a file to the configured AI service for processing. Response includes ai_error if the external AI failed.

Success (200 OK):
{
  "message": "File sent to AI.",
  "file": { /* UploadedFile object with updated status */ },
  "ai_error": null
}

Possible Errors:
- 404 Not Found — file not found
- 401 Unauthorized
- 502 Bad Gateway (implicit) — if AI service returns an unexpected error; currently the code returns 200 with ai_error populated.

---

### POST /api/files/<file_id>/ai-summary/
- Auth: ✅
- Description: Webhook used by AI to POST the generated summary back to this service.

Request (application/json):
{
  "file_id": "<uuid>",
  "summary": "...",
  "status": "processed|failed"
}

Success (200 OK):
{ "message": "AI summary stored.", "file_id": "<uuid>", "status": "processed" }

Errors:
- 400 Bad Request — validation errors
- 404 Not Found — file not found
- 401 Unauthorized

---

## Chat System (/api/chat/)

### GET /api/chat/sessions/
- Auth: ✅
- Description: List chat sessions for the authenticated user.

Success (200 OK):
{
  "count": 2,
  "sessions": [ /* ChatSessionListSerializer objects */ ]
}

ChatSessionList item:
{
  "id": "<uuid>",
  "title": "...",
  "message_count": 5,
  "last_message": { "sender": "user|ai", "content": "...", "created_at": "..." },
  "created_at": "...",
  "last_activity_at": "..."
}

Errors:
- 401 Unauthorized

---

### POST /api/chat/sessions/create/
- Auth: ✅
- Description: Create a chat session explicitly (optional; sessions are auto-created when sending messages without session_id).

Request (application/json):
{ "title": "Optional title" }

Success (201 Created):
{ "message": "Chat session created.", "session": { /* ChatSession detail */ } }

Errors:
- 400 Bad Request — invalid data
- 401 Unauthorized

---

### GET /api/chat/sessions/<session_id>/
- Auth: ✅
- Description: Get session detail and included messages.

Success (200 OK): ChatSessionDetail object

ChatSessionDetail schema:
{
  "id": "<uuid>",
  "title": "...",
  "message_count": 3,
  "messages": [ /* ChatMessage objects */ ],
  "created_at": "...",
  "last_activity_at": "..."
}

ChatMessage object:
{
  "id": "<uuid>",
  "sender": "user|ai",
  "message_type": "text|file|ai_response|ai_summary",
  "content": "...",
  "attached_file": { /* UploadedFile object or null */ },
  "attached_file_id": "<uuid> (write-only field)",
  "is_read": false,
  "created_at": "..."
}

Errors:
- 404 Not Found — session not found
- 401 Unauthorized

---

### DELETE /api/chat/sessions/<session_id>/delete/
- Auth: ✅
- Description: Delete a chat session.

Success (200 OK): { "message": "Chat session deleted." }

Errors:
- 404 Not Found
- 401 Unauthorized

---

### GET /api/chat/sessions/<session_id>/history/
- Auth: ✅
- Description: Return full chronological message history for the session.

Success (200 OK):
{
  "session_id": "<uuid>",
  "title": "...",
  "message_count": 10,
  "messages": [ /* array of ChatMessage objects */ ]
}

Errors:
- 404 Not Found
- 401 Unauthorized

---

### POST /api/chat/sessions/<session_id>/attach-file/
- Auth: ✅
- Description: Attach an existing uploaded file to the session as a message.

Request (application/json):
{ "file_id": "<uuid>" }

Success (201 Created):
{ "message": "File attached to chat session.", "chat_message": { /* ChatMessage object */ } }

Errors:
- 400 Bad Request — missing file_id
- 404 Not Found — session not found or file not found / not owned by user
- 401 Unauthorized

---

### POST /api/chat/messages/send/
- Auth: ✅
- Description: Send a message to the chat AI. Creates a session if session_id omitted. The server stores the user message and attempts to call the external AI. The response includes any AI reply or an ai_error if the external call failed.

Request (application/json):
{
  "content": "Hello, summarize the attached file.",
  "attached_file_id": "<uuid> (optional)",
  "session_id": "<uuid> (optional)"
}

Success (201 Created):
{
  "session_id": "<uuid>",
  "session_created": true|false,
  "user_message": { /* ChatMessage */ },
  "ai_message": { /* ChatMessage or null */ },
  "ai_error": null | "error description"
}

Errors:
- 400 Bad Request — validation errors (e.g., neither content nor attached_file_id provided)
- 404 Not Found — session or attached file not found
- 401 Unauthorized

---

### POST /api/chat/sessions/<session_id>/ai-response/
- Auth: ✅
- Description: Webhook endpoint for AI service to post responses back to a session.

Request (application/json):
{
  "session_id": "<uuid>",
  "content": "AI reply...",
  "message_type": "ai_response|ai_summary"
}

Success (201 Created):
{ "message": "AI response stored.", "ai_message": { /* ChatMessage */ } }

Errors:
- 400 Bad Request — validation errors
- 404 Not Found — session not found
- 401 Unauthorized

---

## Common Errors & Status Codes
- 200 OK — Success for GET/DELETE/others where appropriate
- 201 Created — Resource created (register, upload, create session, send message)
- 400 Bad Request — Validation errors, missing parameters, invalid types
- 401 Unauthorized — Missing/invalid access token
- 403 Forbidden — User authenticated but not permitted (not used heavily in this project)
- 404 Not Found — Resource doesn't exist or doesn't belong to the user
- 500 Internal Server Error — Unexpected server error


## Notes & Next Steps
- This reference was generated by inspecting route definitions, views, and serializers. It lists every endpoint under `/api/` and describes expected JSON shapes and error responses.
- To make this machine-readable (OpenAPI/Swagger), consider adding DRF's schema generation and documenting serializers with explicit field help_text. I can implement an OpenAPI schema and Swagger UI if you'd like.


---

End of API Reference.
