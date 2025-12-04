import { useState, useEffect } from "react";
import { BrainCircuit, Loader2, AlertCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

// Typing animation (3 bouncing dots)
function TypingDots() {
  return (
    <div className="flex space-x-1 mt-1">
      <span className="w-2 h-2 bg-gray-500 dark:bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 bg-gray-500 dark:bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 bg-gray-500 dark:bg-gray-300 rounded-full animate-bounce" />
    </div>
  );
}

export default function AIMessage({ message = "", status = "idle", speed = 30 }) {
  const [displayedText, setDisplayedText] = useState("");
  const [copied, setCopied] = useState(false);

  // Typing effect
  useEffect(() => {
    if (status !== "idle" || !message) return;

    let i = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + message.charAt(i));
      i++;
      if (i >= message.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [message, status, speed]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      console.error("Copy failed");
    }
  };

  return (
    <article className="flex items-start gap-4 animate-fade-in">
      {/* Icon */}
      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
        {status === "loading" ? (
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
        ) : status === "error" ? (
          <AlertCircle className="h-5 w-5 text-red-500" />
        ) : (
          <BrainCircuit className="h-5 w-5 text-primary" />
        )}
      </div>

      {/* Message bubble */}
      <div className="flex flex-col gap-1 relative group">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Assistant</p>

        <div
          className={`rounded-lg p-3 max-w-md relative transition-colors ${
            status === "error"
              ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
              : "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
          }`}
        >
          {status === "loading" ? (
            <TypingDots />
          ) : (
            <p className="whitespace-pre-wrap">{displayedText}</p>
          )}

          {/* Copy button */}
          {status === "idle" && message && (
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCopy}
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-gray-500 dark:text-gray-300" />
              )}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
