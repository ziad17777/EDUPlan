import { useState } from "react";
import { Volume2, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateAudio } from "@/lib/aiApi";
import { toast } from "sonner";
import PanelWrapper from "./PanelWrapper";

const LANGUAGES = [
  { value: "auto", label: "Auto Detect" },
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
];

function WaveformLoader() {
  return (
    <div className="audio-waveform">
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} className="audio-waveform-bar" style={{ animationDelay: `${i * 0.08}s` }} />
      ))}
    </div>
  );
}

export default function AudioGenPanel({ onClose, onResult, chatText = "" }) {
  const [text, setText] = useState(chatText);
  const [lang, setLang] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error("Please enter text to convert to audio.");
      return;
    }

    setLoading(true);
    setAudioUrl(null);
    const res = await generateAudio({ text: text.trim(), lang });
    setLoading(false);

    if (res.ok && res.data) {
      const url = res.data.audio_url;
      if (url) {
        setAudioUrl(url);
        toast.success("Audio generated!");
        // Post the audio into chat
        if (onResult) {
          onResult({
            message: `🔊 Audio generated from: "${text.trim().slice(0, 80)}${text.trim().length > 80 ? "…" : ""}"`,
            mediaUrl: url,
            mediaType: "audio",
          });
        }
      } else {
        toast.error("No audio URL returned.");
      }
    } else {
      toast.error(res.error || "Failed to generate audio.");
    }
  };

  return (
    <PanelWrapper icon={Volume2} title="Generate Audio" onClose={onClose}>
      <div className="flex flex-col gap-4">
        {/* Text input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Text to Speech <span className="text-red-400">*</span>
          </label>
          <Textarea
            placeholder="Enter text to convert to speech…"
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
              Generating Audio…
            </>
          ) : (
            <>
              <Volume2 size={16} className="mr-2" />
              Generate Audio
            </>
          )}
        </Button>

        {/* Loading waveform */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-4">
            <WaveformLoader />
            <span className="text-xs text-muted-foreground">Creating audio…</span>
          </div>
        )}

        {/* Audio Player */}
        {audioUrl && (
          <div className="ai-result-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">Generated Audio</span>
              <a
                href={audioUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="ai-copy-btn"
              >
                <Download size={14} />
                <span>Download</span>
              </a>
            </div>
            <audio
              controls
              src={audioUrl}
              className="w-full rounded-lg"
              style={{ height: 48 }}
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
    </PanelWrapper>
  );
}
