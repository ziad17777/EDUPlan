import { useState } from "react";
import { BookText, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateVocab } from "@/lib/aiApi";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PanelWrapper from "./PanelWrapper";

const LANGUAGES = [
  { value: "auto", label: "Auto Detect" },
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
];

export default function VocabPanel({ onClose, onResult }) {
  const [lang, setLang] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    const res = await generateVocab({ lang });
    setLoading(false);

    if (res.ok && res.data) {
      const vocab = res.data.vocab || JSON.stringify(res.data);
      setResult(vocab);
      toast.success("Vocabulary list generated!");
      // Post result to chat
      if (onResult) {
        onResult({ message: vocab });
      }
    } else {
      toast.error(res.error || "Failed to generate vocabulary.");
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy.");
    }
  };

  return (
    <PanelWrapper icon={BookText} title="Generate Vocabulary" onClose={onClose}>
      <div className="flex flex-col gap-4">
        {/* Language selector */}
        <div className="flex flex-col gap-1.5 max-w-[200px]">
          <label className="text-xs font-medium text-muted-foreground">Language</label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            disabled={loading}
            className="ai-select"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="ai-generate-btn"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Generating Vocabulary…
            </>
          ) : (
            <>
              <BookText size={16} className="mr-2" />
              Generate Vocabulary
            </>
          )}
        </Button>

        {/* Loading skeleton */}
        {loading && (
          <div className="flex flex-col gap-2">
            <div className="ai-skeleton h-4 w-2/3" />
            <div className="ai-skeleton h-4 w-full" />
            <div className="ai-skeleton h-4 w-4/5" />
            <div className="ai-skeleton h-4 w-3/4" />
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="ai-result-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Vocabulary List</span>
              <button onClick={handleCopy} className="ai-copy-btn">
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
            <div className="ai-markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </PanelWrapper>
  );
}
