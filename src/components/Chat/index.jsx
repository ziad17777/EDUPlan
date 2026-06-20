import { useState, useEffect, useRef } from "react";
import AIMessage from "./AIMessage";
import UserMessage from "./UserMessage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authedFetch, getStoredTokens, clearStoredTokens } from "@/lib/api";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Plus, FileText } from "lucide-react";
import { useAuth } from "@/store/auth";

const API_BASE = (typeof window !== 'undefined' && window.EDUPLAN_API_BASE) || 'http://127.0.0.1:8000/api';

export default function Chat({ onToggleDocs }) {
  const { user } = useAuth();
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatRef = useRef(null);
  const sessionIdRef = useRef(null);
  const navigate = useNavigate();

  // Auto scroll when messages update
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Load session based on URL id
  useEffect(() => {
    const loadSession = async () => {
      try {
        const tokens = getStoredTokens();
        if (!tokens || !tokens.access) return;

        if (id) {
          // Fetch specific session
          sessionIdRef.current = id;
          const msgRes = await authedFetch(`${API_BASE}/chat/sessions/${id}/`);
          if (msgRes.ok) {
            const msgData = await msgRes.json().catch(() => null);
            if (msgData?.messages) {
              const formattedMsgs = msgData.messages.map(m => ({
                id: m.id,
                type: m.sender,
                message: m.content,
                status: 'idle',
                username: m.sender === 'user' ? 'You' : 'AI Assistant',
                avatar: '',
                animate: false
              }));
              setMessages(formattedMsgs);
            }
          } else {
            setError("Session not found or failed to load.");
            setMessages([]);
          }
        } else {
          // If no ID is passed, start fresh
          sessionIdRef.current = null;
          setMessages([]);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to load session", err);
      }
    };

    loadSession();
  }, [id, navigate]);

  const handleAuthError = () => {
    clearStoredTokens();
    navigate('/auth/signin');
  };

  const handleNewChat = () => {
    // Navigate to the base chat route to clear the ID and start fresh
    navigate('/app');
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();

    // Optimistic: show user message immediately
    const tempUserId = `temp-user-${Date.now()}`;
    const optimisticUserMsg = {
      id: tempUserId,
      type: "user",
      username: "You",
      avatar: "",
      message: userText,
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);

    // Show AI loading placeholder
    const tempAiId = `temp-ai-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempAiId, type: "ai", message: "", status: "loading" },
    ]);

    try {
      const body = { content: userText };
      if (sessionIdRef.current) {
        body.session_id = sessionIdRef.current;
      }

      const res = await authedFetch(`${API_BASE}/chat/messages/send/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        handleAuthError();
        return;
      }

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const errMsg = data?.detail || data?.error || `Failed to send message (${res.status})`;
        // Remove loading AI placeholder and show error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempAiId
              ? { ...msg, message: errMsg, status: "error" }
              : msg
          )
        );
        setIsLoading(false);
        return;
      }

      // Success — update session ID
      if (data.session_id) {
        sessionIdRef.current = data.session_id;
        // If we didn't have an ID in the URL, redirect to the new session
        if (!id) {
          navigate(`/app/chat/${data.session_id}`);
        }
      }

      // Replace optimistic user message with server version
      const serverUserMsg = data.user_message;
      const serverAiMsg = data.ai_message;

      setMessages((prev) => {
        let updated = prev.map((msg) => {
          if (msg.id === tempUserId && serverUserMsg) {
            return {
              id: serverUserMsg.id,
              type: "user",
              username: "You",
              avatar: "",
              message: serverUserMsg.content,
              created_at: serverUserMsg.created_at,
            };
          }
          if (msg.id === tempAiId) {
            if (serverAiMsg) {
              return {
                id: serverAiMsg.id,
                type: "ai",
                message: serverAiMsg.content,
                status: "idle",
                created_at: serverAiMsg.created_at,
                animate: true
              };
            }
            // ai_message is null — check for ai_error
            if (data.ai_error) {
              return {
                ...msg,
                message: `AI Error: ${data.ai_error}`,
                status: "error",
              };
            }
            // No AI response yet — show waiting
            return {
              ...msg,
              message: "Waiting for AI response...",
              status: "loading",
            };
          }
          return msg;
        });
        return updated;
      });
    } catch (err) {
      console.error('Send message error', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempAiId
            ? { ...msg, message: "Network error. Please try again.", status: "error" }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100dvh-52px)] max-h-[calc(100dvh-52px)] w-full flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-900 z-10">
        <h2 className="font-semibold text-lg">Chat</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onToggleDocs} className="hidden sm:flex">
            <FileText size={16} className="mr-2" /> Documents
          </Button>
          <Button variant="outline" size="icon" onClick={onToggleDocs} className="flex sm:hidden">
            <FileText size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={handleNewChat} disabled={isLoading}>
            <Plus size={16} className="mr-2 hidden sm:inline" /> <span className="hidden sm:inline">New Chat</span>
            <Plus size={16} className="sm:hidden" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="px-6 py-2 bg-red-500/10 text-red-500 text-sm border-b border-red-500/20">
          {error}
        </div>
      )}

      {/* Chat messages */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6"
      >
        {/* Show welcome message when chat is empty */}
        {messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-slate-500 dark:text-slate-400 text-center">
            👋 Welcome to <span className="text-primary font-semibold mx-1">EduPlan Chat</span>!  
            <br />
            Type your message below to start chatting.
          </div>
        ) : (
          messages.map((msg) =>
            msg.type === "ai" ? (
              <AIMessage key={msg.id} message={msg.message} status={msg.status} animate={msg.animate} />
            ) : (
              <UserMessage
                key={msg.id}
                username={msg.username}
                avatar={user?.profile_picture_url || msg.avatar}
                message={msg.message}
              />
            )
          )
        )}
      </div>

      {/* Input area */}
      <div className="flex items-center gap-2 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
        <Input
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="h-10 px-4"
        >
          {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Send"}
        </Button>
      </div>
    </section>
  );
}
