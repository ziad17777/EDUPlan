import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PanelWrapper({ icon: Icon, title, onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.97 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="ai-panel"
    >
      {/* Header */}
      <div className="ai-panel-header">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="ai-panel-icon">
              <Icon size={18} />
            </div>
          )}
          <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="h-7 w-7 rounded-full hover:bg-white/10 dark:hover:bg-white/10"
        >
          <X size={14} />
        </Button>
      </div>

      {/* Body */}
      <div className="ai-panel-body">
        {children}
      </div>
    </motion.div>
  );
}
