import React from "react";
import { Button } from "@/components/ui/button";
import { File , X } from 'lucide-react';

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function FileItem({ file, onRemove }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-background-light dark:bg-gray-800 p-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 flex items-center justify-center rounded-md bg-primary/10 text-primary">
          <File size={16}  className="material-symbols-outlined"/>
        </div>
        <div>
          <div className="font-medium text-sm text-gray-800 dark:text-gray-200">{file.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{formatBytes(file.size)} • {file.status}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onRemove} size="sm">
            <X size={16} />
        </Button>
      </div>
    </div>
  );
}
