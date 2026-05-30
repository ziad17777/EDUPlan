// src/components/Chat/index.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Paperclip, X, AlertTriangle } from "lucide-react";

import AIMessage from "./AIMessage";
import UserMessage from "./UserMessage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { sendMessage, uploadFile } from "@/api/chat";
import { useAuth } from "@/store/auth-context";

export default function Chat({ initialSessionId = null }) {
  const { user } = useAuth();

  // ── State ────────────────────────────────────────────────────────────────
  const [messages,   setMessages]   = useState([]);
  const [input,      setInput]      = useState("");
  const [isLoading,  setIsLoading]  = useState(false);
  const [sessionId,  setSessionId]  = useState(initialSessionId);
  const [error,      setError]      = useState("");

  // File attachment state
  const [pendingFile,     setPendingFile]     = useState(null);   // File object
  const [uploadedFileId,  setUploadedFileId]  = useState(null);   // UUID from backend
  const [isUploading,     setIsUploading]     = useState(false);

  const chatRef   = useRef(null);
  const fileInput = useRef(null);

  // ── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // ── File selection ───────────────────────────────────────────────────────
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setUploadedFileId(null);        // reset previous upload
    e.target.value = "";            // allow re-selecting same file
  }, []);

  const removeFile = useCallback(() => {
    setPendingFile(null);
    setUploadedFileId(null);
  }, []);

  // ── Send message ─────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!input.trim() && !pendingFile) return;
    setError("");
    setIsLoading(true);

    // Optimistic user message
    const tempId = Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id:       tempId,
        type:     "user",
        username: user?.first_name ?? user?.email ?? "You",
        avatar:   `https://api.dicebear.com/9.x/identicon/svg?seed=${user?.email ?? "user"}`,
        message:  input.trim() || `📎 ${pendingFile?.name}`,
      },
    ]);

    const userText = input.trim();
    setInput("");

    // AI loading placeholder
    const aiTempId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      { id: aiTempId, type: "ai", message: "", status: "loading" },
    ]);

    try {
      // 1) Upload file first if one is pending
      let fileId = uploadedFileId;
      if (pendingFile && !fileId) {
        setIsUploading(true);
        try {
          const uploadRes = await uploadFile(pendingFile, sessionId);
          fileId = uploadRes.file?.id ?? null;
          setUploadedFileId(fileId);
        } finally {
          setIsUploading(false);
          setPendingFile(null);
        }
      }

      // 2) Send text message (+ optional file reference)
      const res = await sendMessage({
        content:        userText,
        sessionId:      sessionId,
        attachedFileId: fileId,
      });

      // 3) Persist session ID for subsequent messages
      if (!sessionId && res.session_id) {
        setSessionId(res.session_id);
      }

      // 4) Replace AI placeholder with real reply
      const aiReply = res.ai_message?.content ?? "";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiTempId
            ? { ...msg, message: aiReply, status: "idle" }
            : msg
        )
      );
    } catch (err) {
      const errMsg = err?.data?.ai_error ?? err?.data?.error ?? err.message ?? "Something went wrong.";
      setError(errMsg);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiTempId
            ? { ...msg, message: "Sorry, I couldn't get a response. Please try again.", status: "error" }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, pendingFile, uploadedFileId, sessionId, user]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <section className="min-h-[calc(100dvh-52px)] max-h-[calc(100dvh-52px)] w-full col-span-4 md:col-span-3 flex flex-col justify-between">

      {/* ── Messages ─────────────────────────────────────────────────────── */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-slate-500 dark:text-slate-400 text-center">
            👋 Welcome to{" "}
            <span className="text-primary font-semibold mx-1">EduPlan Chat</span>!
            <br />
            Ask Phoenix anything about your studies, or attach a file to analyse.
          </div>
        ) : (
          messages.map((msg) =>
            msg.type === "ai" ? (
              <AIMessage key={msg.id} message={msg.message} status={msg.status} />
            ) : (
              <UserMessage
                key={msg.id}
                username={msg.username}
                avatar={msg.avatar}
                message={msg.message}
              />
            )
          )
        )}
      </div>

      {/* ── Error banner ─────────────────────────────────────────────────── */}
      {error && (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-2 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error}
          <button className="ml-auto hover:opacity-70" onClick={() => setError("")}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Pending file badge ───────────────────────────────────────────── */}
      {pendingFile && (
        <div className="mx-4 mb-1 flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-sm">
          <Paperclip className="h-4 w-4 text-primary" />
          <span className="truncate max-w-[200px] text-primary">{pendingFile.name}</span>
          {isUploading && <span className="text-xs text-slate-400 ml-1">Uploading…</span>}
          <button className="ml-auto hover:opacity-70" onClick={removeFile}>
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      )}

      {/* ── Input bar ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-t border-gray-200 dark:border-gray-700 px-4 py-3">

        {/* Hidden file input */}
        <input
          ref={fileInput}
          type="file"
          accept=".pdf,.docx,.pptx,.xlsx,.csv,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Attach button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 flex-shrink-0"
          onClick={() => fileInput.current?.click()}
          disabled={isLoading}
          title="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <Input
          placeholder="Type your message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="flex-1"
        />

        <Button
          onClick={handleSend}
          disabled={isLoading || (!input.trim() && !pendingFile)}
          className="h-10 px-4"
        >
          {isLoading ? "…" : "Send"}
        </Button>
      </div>
    </section>
  );
}
