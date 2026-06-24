import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  PenTool,
  Volume2,
  Video,
  BookText,
  Sparkles,
  ChevronUp,
} from "lucide-react";

const TOOLS = [
  { key: "studyPlan", icon: BookOpen, label: "Study Plan", color: "#6366f1" },
  { key: "gradeEssay", icon: PenTool, label: "Grade Essay", color: "#8b5cf6" },
  { key: "audio", icon: Volume2, label: "Audio", color: "#06b6d4" },
  { key: "video", icon: Video, label: "Video", color: "#f43f5e" },
  { key: "vocab", icon: BookText, label: "Vocabulary", color: "#10b981" },
];

// Toggle button — placed in the input bar by the parent
export function ToolbarToggle({ expanded, onToggle }) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className={`ai-toolbar-toggle ${expanded ? "ai-toolbar-toggle-active" : ""}`}
      title="AI Tools"
    >
      <Sparkles size={18} />
      <motion.span
        animate={{ rotate: expanded ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className="ai-toolbar-toggle-chevron"
      >
        <ChevronUp size={14} />
      </motion.span>
    </motion.button>
  );
}

// Expandable tool grid — placed above the input bar by the parent
export default function AIToolbar({ expanded, activePanel, onSelectTool }) {
  return (
    <AnimatePresence>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="ai-toolbar-expanded"
        >
          <div className="ai-toolbar-grid">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              const isActive = activePanel === tool.key;
              return (
                <motion.button
                  key={tool.key}
                  onClick={() => onSelectTool(tool.key)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  className={`ai-toolbar-btn ${isActive ? "ai-toolbar-btn-active" : ""}`}
                  style={{ "--tool-color": tool.color }}
                  title={tool.label}
                >
                  <Icon size={16} />
                  <span className="ai-toolbar-label">{tool.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
