import React from "react";
import FileItem from "./FileItem";

export default function DocumentList({ files = [], onRemove }) {
  if (!files || files.length === 0) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">No documents uploaded yet.</div>;
  }

  return (
    <div className="flex flex-col gap-2 ">
      {files.map((f) => (
        <FileItem key={f.id} file={f} onRemove={() => onRemove(f.id)} />
      ))}
    </div>
  );
}
