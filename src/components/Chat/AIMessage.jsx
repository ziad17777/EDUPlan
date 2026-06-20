import { useState, useEffect, useMemo } from "react";
import { Loader2, AlertCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { detectTextDirection } from "@/lib/textDirection";

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

// Custom code block with copy button
function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const language = className?.replace("language-", "") || "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      console.error("Copy failed");
    }
  };

  return (
    <div className="relative group/code my-2">
      {language && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900 dark:bg-gray-950 rounded-t-lg border-b border-gray-700">
          <span className="text-xs text-gray-400 font-mono">{language}</span>
          <button
            onClick={handleCopy}
            className="text-xs text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-1"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
      <pre className={`bg-gray-900 dark:bg-gray-950 text-gray-100 p-3 overflow-x-auto text-sm font-mono ${language ? "rounded-b-lg" : "rounded-lg"}`}>
        <code>{children}</code>
      </pre>
      {!language && (
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </button>
      )}
    </div>
  );
}

// Custom markdown components mapping
const markdownComponents = {
  h1: ({ children }) => <h1 className="text-xl font-bold mt-3 mb-2 first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="text-lg font-bold mt-3 mb-1.5 first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-semibold mt-2 mb-1 first:mt-0">{children}</h3>,
  h4: ({ children }) => <h4 className="text-sm font-semibold mt-2 mb-1 first:mt-0">{children}</h4>,
  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-0.5 ml-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-0.5 ml-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-3 border-primary/50 pl-3 my-2 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
      {children}
    </a>
  ),
  hr: () => <hr className="my-3 border-gray-300 dark:border-gray-600" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-300/50 dark:bg-gray-700/50">{children}</thead>,
  th: ({ children }) => <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-left font-semibold">{children}</th>,
  td: ({ children }) => <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">{children}</td>,
  code: ({ children, className, node, ...rest }) => {
    // Check if this is an inline code or a code block
    // react-markdown wraps code blocks in <pre><code>, inline code is just <code>
    const isInline = !className && (!node?.position || node?.tagName === "code");

    if (isInline) {
      return (
        <code className="bg-gray-300/60 dark:bg-gray-700/60 px-1.5 py-0.5 rounded text-sm font-mono" {...rest}>
          {children}
        </code>
      );
    }

    return <CodeBlock className={className}>{children}</CodeBlock>;
  },
  pre: ({ children }) => {
    // Just pass through — the code component handles rendering
    return <>{children}</>;
  },
};

export default function AIMessage({ message = "", status = "idle", speed = 30, animate = false }) {
  const [displayedText, setDisplayedText] = useState(animate ? "" : message);
  const [copied, setCopied] = useState(false);
  const dir = useMemo(() => detectTextDirection(message), [message]);

  // Typing effect
  useEffect(() => {
    if (status !== "idle" || !message) return;
    if (!animate) {
      setDisplayedText(message);
      return;
    }

    let i = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + message.charAt(i));
      i++;
      if (i >= message.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [message, status, speed, animate]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      console.error("Copy failed");
    }
  };

  const renderContent = () => {
    if (status === "loading") {
      return <TypingDots />;
    }

    // Always render markdown, even while typing, so the user sees proper formatting instantly
    return (
      <div className="ai-markdown-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {displayedText}
        </ReactMarkdown>
      </div>
    );
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
          <Avatar className="h-full w-full">
            <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=EduPlan&backgroundColor=transparent" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Message bubble */}
      <div className="flex flex-col gap-1 relative group">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Assistant</p>

        <div
          dir={dir}
          className={`rounded-lg p-3 max-w-2xl relative transition-colors ${status === "error"
            ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
            : "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
            }`}
        >
          {renderContent()}

          {/* Copy button */}
          {status === "idle" && message && (
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCopy}
              className={`absolute top-1 ${dir === "ltr" ? "right-1" : "left-1"} opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6`}
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
