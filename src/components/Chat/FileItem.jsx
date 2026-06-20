import React from "react";
import { Button } from "@/components/ui/button";
import { File, X, BrainCircuit, Loader2 } from 'lucide-react';

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

const API_BASE = (typeof window !== 'undefined' && window.EDUPLAN_API_BASE) || 'http://127.0.0.1:8000/api';

export default function FileItem({ file, onDeleteRemote, onSendToAi }) {
  const isServerFile = !!file.server;
  const isProcessing = isServerFile && file.server.status === 'processing';
  const isProcessed = isServerFile && file.server.status === 'processed';
  
  return (
    <div className="flex flex-col gap-2 rounded-md border bg-background-light dark:bg-gray-800 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <File size={16} />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate max-w-[200px]" title={file.name}>
              {file.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatBytes(file.size)} • {isServerFile ? file.server.status : file.status}
              {file.error ? ` • ${file.error}` : ''}
            </div>
            {isServerFile && file.server.file_url && (
              <div className="mt-1 text-xs text-primary hover:underline">
                <a href={`${API_BASE.replace('/api', '')}${file.server.file_url}`} target="_blank" rel="noreferrer">
                  View file
                </a>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          {isProcessing && (
            <div className="flex items-center text-xs text-primary px-2 border border-primary/20 bg-primary/5 rounded h-8">
              <Loader2 size={14} className="animate-spin mr-1" /> Analyzing...
            </div>
          )}

          {/* Delete Button */}
          {isServerFile && (
            <Button 
              variant="ghost" 
              onClick={(e) => {
                if (window.confirm("Are you sure you want to delete this file?")) {
                  onDeleteRemote(e);
                }
              }} 
              size="sm"
              className="h-8 w-8 p-0 text-red-400 hover:text-red-500 hover:bg-red-400/10"
              title="Delete file"
            >
              <X size={16} />
            </Button>
          )}
        </div>
      </div>
      
      {/* Display AI Summary if available */}
      {isProcessed && file.server.ai_summary && (
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 bg-primary/5 p-2 rounded border border-primary/10">
          <div className="font-semibold text-primary mb-1 flex items-center">
            <BrainCircuit size={12} className="mr-1" /> AI Summary
          </div>
          <p className="line-clamp-3" title={file.server.ai_summary}>
            {file.server.ai_summary}
          </p>
        </div>
      )}
    </div>
  );
}
