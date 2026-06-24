import { useState } from "react";
import { Video, Loader2, Download, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateVideo } from "@/lib/aiApi";
import { toast } from "sonner";
import PanelWrapper from "./PanelWrapper";

const LANGUAGES = [
  { value: "auto", label: "Auto Detect" },
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
];

export default function VideoGenPanel({ onClose, onResult }) {
  const [text, setText] = useState("");
  const [lang, setLang] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error("Please enter a script/text for the video.");
      return;
    }

    setLoading(true);
    setVideoUrl(null);
    const res = await generateVideo({ text: text.trim(), lang });
    setLoading(false);

    if (res.ok && res.data) {
      const url = res.data.video_url;
      if (url) {
        setVideoUrl(url);
        toast.success("Video generated!");
        // Post the video into chat
        if (onResult) {
          onResult({
            message: `🎬 Video generated from: "${text.trim().slice(0, 80)}${text.trim().length > 80 ? "…" : ""}"`,
            mediaUrl: url,
            mediaType: "video",
          });
        }
      } else {
        toast.error("No video URL returned.");
      }
    } else {
      toast.error(res.error || "Failed to generate video.");
    }
  };

  return (
    <PanelWrapper icon={Video} title="Generate Video" onClose={onClose}>
      <div className="flex flex-col gap-4">
        {/* Notice */}
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-300/90 leading-relaxed">
            Video generation may take <strong>several minutes</strong>. Please keep this panel open and be patient.
          </p>
        </div>

        {/* Text input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Script / Text <span className="text-red-400">*</span>
          </label>
          <Textarea
            placeholder="Enter the script or text for your video…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
            className="ai-textarea min-h-[100px]"
          />
        </div>

        {/* Language */}
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
          disabled={loading || !text.trim()}
          className="ai-generate-btn"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Generating Video…
            </>
          ) : (
            <>
              <Video size={16} className="mr-2" />
              Generate Video
            </>
          )}
        </Button>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="video-loading-ring" />
            <span className="text-xs text-muted-foreground">Processing video — this may take a while…</span>
          </div>
        )}

        {/* Video Player */}
        {videoUrl && (
          <div className="ai-result-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">Generated Video</span>
              <a
                href={videoUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="ai-copy-btn"
              >
                <Download size={14} />
                <span>Download</span>
              </a>
            </div>
            <video
              controls
              src={videoUrl}
              className="w-full rounded-lg max-h-[300px] bg-black"
            >
              Your browser does not support the video element.
            </video>
          </div>
        )}
      </div>
    </PanelWrapper>
  );
}
