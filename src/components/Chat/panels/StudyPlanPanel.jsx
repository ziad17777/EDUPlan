import { useState } from "react";
import { BookOpen, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateStudyPlan } from "@/lib/aiApi";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PanelWrapper from "./PanelWrapper";

const DURATIONS = [
  { value: "1 week", label: "1 Week" },
  { value: "2 weeks", label: "2 Weeks" },
  { value: "1 month", label: "1 Month" },
];

const LANGUAGES = [
  { value: "auto", label: "Auto Detect" },
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
];

export default function StudyPlanPanel({ onClose, onResult }) {
  const [duration, setDuration] = useState("2 weeks");
  const [lang, setLang] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    const res = await generateStudyPlan({ duration, lang });
    setLoading(false);

    if (res.ok && res.data) {
      const plan = res.data.plan || JSON.stringify(res.data);
      setResult(plan);
      toast.success("Study plan generated!");
      // Post result to chat
      if (onResult) {
        onResult({ message: plan });
      }
    } else {
      toast.error(res.error || "Failed to generate study plan.");
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
    <PanelWrapper icon={BookOpen} title="Generate Study Plan" onClose={onClose}>
      <div className="flex flex-col gap-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
            <label className="text-xs font-medium text-muted-foreground">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={loading}
              className="ai-select"
            >
              {DURATIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
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
        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="ai-generate-btn"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Generating Plan…
            </>
          ) : (
            <>
              <BookOpen size={16} className="mr-2" />
              Generate Study Plan
            </>
          )}
        </Button>

        {/* Loading skeleton */}
        {loading && (
          <div className="flex flex-col gap-2">
            <div className="ai-skeleton h-4 w-3/4" />
            <div className="ai-skeleton h-4 w-full" />
            <div className="ai-skeleton h-4 w-5/6" />
            <div className="ai-skeleton h-4 w-2/3" />
            <div className="ai-skeleton h-4 w-full" />
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="ai-result-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Generated Plan</span>
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
