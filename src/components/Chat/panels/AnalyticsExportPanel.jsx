import { useState } from "react";
import { BarChart3, Download, Loader2, Database, FileArchive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchAnalytics, exportDatabase, exportHistory } from "@/lib/aiApi";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PanelWrapper from "./PanelWrapper";

const TABS = [
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "export", label: "Export", icon: Download },
];

export default function AnalyticsExportPanel({ onClose }) {
  const [activeTab, setActiveTab] = useState("analytics");
  const [loading, setLoading] = useState(false);
  const [analyticsResult, setAnalyticsResult] = useState(null);
  const [exportLoading, setExportLoading] = useState(null); // 'db' | 'history' | null

  // ─── Analytics ───────────────────
  const handleFetchAnalytics = async () => {
    setLoading(true);
    setAnalyticsResult(null);
    const res = await fetchAnalytics();
    setLoading(false);

    if (res.ok && res.data) {
      setAnalyticsResult(res.data.analytics || JSON.stringify(res.data));
      toast.success("Analytics loaded!");
    } else {
      toast.error(res.error || "Failed to fetch analytics.");
    }
  };

  // ─── Export ──────────────────────
  const handleExport = async (type) => {
    setExportLoading(type);
    const res = type === "db" ? await exportDatabase() : await exportHistory();
    setExportLoading(null);

    if (res.ok && res.data?.download_url) {
      // Open the download URL in a new tab
      window.open(res.data.download_url, "_blank");
      toast.success(`${type === "db" ? "Database" : "Chat history"} export started!`);
    } else {
      toast.error(res.error || `Failed to export ${type === "db" ? "database" : "history"}.`);
    }
  };

  return (
    <PanelWrapper icon={BarChart3} title="Analytics & Export" onClose={onClose}>
      <div className="flex flex-col gap-4">
        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-lg bg-white/5 dark:bg-white/5 border border-white/10">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="flex flex-col gap-4">
            <Button
              onClick={handleFetchAnalytics}
              disabled={loading}
              className="ai-generate-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Loading Analytics…
                </>
              ) : (
                <>
                  <BarChart3 size={16} className="mr-2" />
                  Load Analytics
                </>
              )}
            </Button>

            {loading && (
              <div className="flex flex-col gap-2">
                <div className="ai-skeleton h-4 w-1/2" />
                <div className="ai-skeleton h-4 w-full" />
                <div className="ai-skeleton h-4 w-3/4" />
              </div>
            )}

            {analyticsResult && (
              <div className="ai-result-card">
                <span className="text-xs font-medium text-muted-foreground mb-2 block">Usage Summary</span>
                <div className="ai-markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{analyticsResult}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Export Tab */}
        {activeTab === "export" && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Download a snapshot of the database or a ZIP of your chat history.
            </p>

            <Button
              onClick={() => handleExport("db")}
              disabled={exportLoading !== null}
              variant="outline"
              className="ai-export-btn"
            >
              {exportLoading === "db" ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <Database size={16} className="mr-2" />
              )}
              Export Database
            </Button>

            <Button
              onClick={() => handleExport("history")}
              disabled={exportLoading !== null}
              variant="outline"
              className="ai-export-btn"
            >
              {exportLoading === "history" ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <FileArchive size={16} className="mr-2" />
              )}
              Export Chat History
            </Button>
          </div>
        )}
      </div>
    </PanelWrapper>
  );
}
