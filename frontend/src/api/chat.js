// src/api/chat.js
import api from "./client";

export async function createSession(title = "") {
  const data = await api.post("/api/chat/sessions/create/", { title });
  return data.session;
}

export async function listSessions() {
  const data = await api.get("/api/chat/sessions/");
  return data.sessions;
}

export async function getSession(sessionId) {
  return api.get(`/api/chat/sessions/${sessionId}/`);
}

export async function deleteSession(sessionId) {
  return api.delete(`/api/chat/sessions/${sessionId}/delete/`);
}

/**
 * Send a user message and get back the AI reply.
 * Returns { session_id, message, ai_message, session_created, ai_status }
 */
export async function sendMessage({ content, sessionId, attachedFileId }) {
  return api.post("/api/chat/messages/send/", {
    content,
    ...(sessionId       ? { session_id: sessionId }             : {}),
    ...(attachedFileId  ? { attached_file_id: attachedFileId }  : {}),
  });
}

/**
 * Upload a file attached to a session.
 * Returns { file, ai_status? }
 */
export async function uploadFile(file, sessionId) {
  const form = new FormData();
  form.append("file", file);
  if (sessionId) form.append("session_id", sessionId);

  const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
  const tokens = JSON.parse(localStorage.getItem("eduplan_tokens") ?? "null");

  const res = await fetch(`${BASE_URL}/api/files/upload/`, {
    method: "POST",
    headers: tokens?.access ? { Authorization: `Bearer ${tokens.access}` } : {},
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "File upload failed");
  }
  return res.json();
}
