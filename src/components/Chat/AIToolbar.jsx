import { motion } from "framer-motion";
import {
  BookOpen,
  PenTool,
  Volume2,
  Video,
  BookText,
  Sparkles,
} from "lucide-react";

const TOOLS = [
  { key: "studyPlan", icon: BookOpen, label: "Study Plan", color: "#6366f1" },
  { key: "gradeEssay", icon: PenTool, label: "Grade Essay", color: "#8b5cf6" },
  { key: "audio", icon: Volume2, label: "Audio", color: "#06b6d4" },
  { key: "video", icon: Video, label: "Video", color: "#f43f5e" },
  { key: "vocab", icon: BookText, label: "Vocabulary", color: "#10b981" },
];

export default function AIToolbar({ activePanel, onSelectTool }) {
  return (
    <div className="ai-toolbar-container">
      <div className="ai-toolbar-badge">
        <Sparkles size={12} />
        <span>AI Tools</span>
      </div>
      <div className="ai-toolbar-scroll">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activePanel === tool.key;
          return (
            <motion.button
              key={tool.key}
              onClick={() => onSelectTool(tool.key)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              className={`ai-toolbar-btn ${isActive ? "ai-toolbar-btn-active" : ""}`}
              style={{
                "--tool-color": tool.color,
              }}
              title={tool.label}
            >
              <Icon size={16} />
              <span className="ai-toolbar-label">{tool.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
