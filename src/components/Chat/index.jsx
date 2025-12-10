import { useState, useEffect, useRef } from "react";
import AIMessage from "./AIMessage";
import UserMessage from "./UserMessage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Chat() {
  const [messages, setMessages] = useState([]); // start empty
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef(null);
  const sessionIdRef = useRef(null);
  const SESSIONS_KEY = "eduplan_chat_sessions";

  // Auto scroll when messages update
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // create new session on mount and persist messages to localStorage
  useEffect(() => {
    try {
      const id = Date.now();
      sessionIdRef.current = id;
      const stored = JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]");
      const session = { id, createdAt: new Date().toISOString(), messages: [] };
      stored.unshift(session);
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(stored));
    } catch (e) {
      // ignore localStorage errors
      console.warn("Could not create chat session", e);
    }
  }, []);

  // persist messages to the current session
  useEffect(() => {
    if (!sessionIdRef.current) return;
    try {
      const stored = JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]");
      const idx = stored.findIndex((s) => s.id === sessionIdRef.current);
      if (idx >= 0) {
        stored[idx] = { ...stored[idx], messages };
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(stored));
      }
    } catch (e) {
      console.warn("Could not persist chat messages", e);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      username: "You",
      avatar: "https://api.dicebear.com/9.x/identicon/svg?seed=raafat",
      message: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Add placeholder AI message (loading)
    const aiId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      { id: aiId, type: "ai", message: "", status: "loading" },
    ]);

    // Simulate AI response delay (replace this with API later)
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiId
            ? {
                ...msg,
                message: "Thanks for your message! How can I help you with your studies today?",
                status: "idle",
              }
            : msg
        )
      );
      setIsLoading(false);
    }, 2000);
  };

  return (
    <section className="min-h-[calc(100dvh-52px)] max-h-[calc(100dvh-52px)] w-full col-span-4 md:col-span-3 flex flex-col justify-between">
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

      {/* Input area */}
      <div className="flex items-center gap-2 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
        <Input
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="h-10 px-4"
        >
          Send
        </Button>
      </div>
    </section>
  );
}
