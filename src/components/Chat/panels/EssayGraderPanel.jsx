import { useState } from "react";
import { PenTool, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { gradeEssay } from "@/lib/aiApi";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PanelWrapper from "./PanelWrapper";

const LANGUAGES = [
  { value: "auto", label: "Auto Detect" },
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
];

export default function EssayGraderPanel({ onClose, onResult }) {
  const [essayText, setEssayText] = useState("");
  const [rubric, setRubric] = useState("");
  const [langChoice, setLangChoice] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGrade = async () => {
    if (!essayText.trim()) {
      toast.error("Please enter your essay text.");
      return;
    }

    setLoading(true);
    setResult(null);
    const res = await gradeEssay({
      essay_text: essayText.trim(),
      rubric: rubric.trim(),
      lang_choice: langChoice,
    });
    setLoading(false);

    if (res.ok && res.data) {
      const feedback = res.data.feedback || JSON.stringify(res.data);
      setResult(feedback);
      toast.success("Essay graded!");
      // Post result to chat
      if (onResult) {
        onResult({ message: feedback });
      }
    } else {
      toast.error(res.error || "Failed to grade essay.");
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
    <PanelWrapper icon={PenTool} title="Grade Essay" onClose={onClose}>
      <div className="flex flex-col gap-4">
        {/* Essay input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Essay Text <span className="text-red-400">*</span>
          </label>
          <Textarea
            placeholder="Paste or type your essay here…"
            value={essayText}
            onChange={(e) => setEssayText(e.target.value)}
            disabled={loading}
            className="ai-textarea min-h-[120px]"
          />
        </div>

        {/* Rubric */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Grading Rubric <span className="text-muted-foreground/60">(optional)</span>
          </label>
          <Textarea
            placeholder="e.g., Grade on clarity, structure, and argument strength."
            value={rubric}
            onChange={(e) => setRubric(e.target.value)}
            disabled={loading}
            className="ai-textarea min-h-[60px]"
          />
        </div>

        {/* Language */}
        <div className="flex flex-col gap-1.5 max-w-[200px]">
          <label className="text-xs font-medium text-muted-foreground">Language</label>
          <select
            value={langChoice}
            onChange={(e) => setLangChoice(e.target.value)}
            disabled={loading}
            className="ai-select"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleGrade}
          disabled={loading || !essayText.trim()}
          className="ai-generate-btn"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Grading Essay…
            </>
          ) : (
            <>
              <PenTool size={16} className="mr-2" />
              Grade Essay
            </>
          )}
        </Button>

        {/* Loading skeleton */}
        {loading && (
          <div className="flex flex-col gap-2">
            <div className="ai-skeleton h-6 w-1/3" />
            <div className="ai-skeleton h-4 w-full" />
            <div className="ai-skeleton h-4 w-5/6" />
            <div className="ai-skeleton h-4 w-4/5" />
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="ai-result-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Feedback</span>
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
