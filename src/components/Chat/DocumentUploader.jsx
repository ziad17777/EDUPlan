import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DocumentList from "./DocumentList";

export default function DocumentUploader() {
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);

  const onPick = (e) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length === 0) return;
    const mapped = picked.map((f) => ({
      id: `${f.name}-${f.size}-${Date.now()}`,
      file: f,
      name: f.name,
      size: f.size,
      status: "ready",
    }));
    setFiles((prev) => [...mapped, ...prev]);
    // reset input value so same file can be picked again
    e.target.value = null;
  };

  const onRemove = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const onUploadAll = async () => {
    // simulate upload for each file
    setFiles((prev) => prev.map((f) => ({ ...f, status: "uploading" })));
    // fake delay per file
    for (let i = 0; i < files.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 600));
      setFiles((prev) =>
        prev.map((p, idx) => (idx === i ? { ...p, status: "uploaded" } : p))
      );
    }
  };

  return (
    <aside className="w-full p-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Documents</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload documents to let the AI analyze them.</p>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            id="doc-file-input"
            type="file"
            multiple
            onChange={onPick}
            className="hidden"
          />
          <Button onClick={() => fileInputRef.current?.click()} className="px-3">Upload Document</Button>
          <Button variant="outline" onClick={onUploadAll} className="px-3" disabled={files.length === 0}>
            Upload All
          </Button>
        </div>

        <div>
          <DocumentList files={files} onRemove={onRemove} />
        </div>
      </div>
    </aside>
  );
}
