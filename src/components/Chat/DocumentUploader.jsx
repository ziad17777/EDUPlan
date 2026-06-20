import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import DocumentList from "./DocumentList";
import { getStoredTokens, clearStoredTokens, authedFetch } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from "sonner";

const API_BASE = (typeof window !== 'undefined' && window.EDUPLAN_API_BASE) || 'http://127.0.0.1:8000/api';

// allowed extensions (match backend validation)
const ALLOWED_EXTS = ['.pdf', '.docx', '.pptx', '.xlsx', '.csv', '.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

function extOf(name) {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i).toLowerCase() : '';
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function DocumentUploader({ sessionId }) {
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [authError, setAuthError] = useState(null);
  const [loadingServerFiles, setLoadingServerFiles] = useState(false);
  // Queue of files waiting to be attached once a session is created
  const pendingAttachRef = useRef([]);
  const navigate = useNavigate();

  // Clear files when session changes
  useEffect(() => {
    setFiles([]);
    setAuthError(null);
    pendingAttachRef.current = [];
  }, [sessionId]);

  // Attach a file to the current session
  const attachFileToSession = useCallback(async (fileServerId, currentSessionId) => {
    if (!currentSessionId || !fileServerId) return;
    try {
      await authedFetch(`${API_BASE}/chat/sessions/${currentSessionId}/attach-file/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: fileServerId }),
      });
    } catch (err) {
      console.error('Failed to attach file to session', err);
    }
  }, []);

  // Load files belonging to the current session (from session messages)
  useEffect(() => {
    if (!sessionId) return;
    let mounted = true;

    const loadSessionFiles = async () => {
      setLoadingServerFiles(true);
      const tokens = getStoredTokens();
      if (!tokens || !tokens.access) {
        setAuthError('Not authenticated. Please sign in to see your uploaded files.');
        setLoadingServerFiles(false);
        return;
      }
      try {
        // Fetch session detail which includes messages with attached_file
        const res = await authedFetch(`${API_BASE}/chat/sessions/${sessionId}/`);
        if (!mounted) return;
        if (res.status === 401) {
          clearStoredTokens();
          setAuthError('Not authenticated. Redirecting to sign in...');
          navigate('/auth/signin');
          setLoadingServerFiles(false);
          return;
        }
        const data = await res.json().catch(() => null);
        if (data?.messages) {
          // Extract unique files from messages that have attached_file
          const fileMap = new Map();
          for (const msg of data.messages) {
            if (msg.attached_file && msg.attached_file.id) {
              fileMap.set(msg.attached_file.id, msg.attached_file);
            }
          }
          const sessionFiles = Array.from(fileMap.values());
          if (sessionFiles.length > 0) {
            const mapped = sessionFiles.map((s) => ({
              id: `server-${s.id}`,
              file: null,
              name: s.original_filename || s.original_name || s.name || s.file,
              size: s.file_size || 0,
              status: 'uploaded',
              error: null,
              server: s,
            }));
            setFiles(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to load session files', err);
      } finally {
        if (mounted) setLoadingServerFiles(false);
      }
    };

    loadSessionFiles();
    return () => { mounted = false };
  }, [sessionId, navigate]);

  const onPick = async (e) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length === 0) return;

    const newFiles = picked.map((f) => {
      const ext = extOf(f.name);
      const isValidType = ALLOWED_EXTS.includes(ext);
      const isValidSize = f.size <= MAX_FILE_SIZE;
      let status = 'ready';
      let error = null;
      if (!isValidType) {
        status = 'rejected';
        error = `Unsupported file type (${ext}). Allowed: ${ALLOWED_EXTS.join(', ')}`;
        toast.error(`Cannot upload ${f.name}: ${error}`);
      } else if (!isValidSize) {
        status = 'rejected';
        error = `File too large (${formatSize(f.size)}). Max: 20 MB`;
        toast.error(`Cannot upload ${f.name}: ${error}`);
      }
      return {
        id: `${f.name}-${f.size}-${Date.now()}`,
        file: f,
        name: f.name,
        size: f.size,
        status,
        error,
        server: null,
      };
    });

    // Add to state immediately
    setFiles((prev) => [...newFiles, ...prev]);
    e.target.value = null;

    // Filter valid files and trigger auto-upload
    const validFiles = newFiles.filter(f => f.status === 'ready');
    if (validFiles.length > 0) {
      await autoUploadFiles(validFiles);
    }
  };

  const autoUploadFiles = async (filesToUpload) => {
    const tokens = getStoredTokens();
    if (!tokens || !tokens.access) {
      setFiles((prev) => prev.map((p) => (filesToUpload.find(f => f.id === p.id) ? { ...p, status: 'error', error: 'Not authenticated.' } : p)));
      setAuthError('Not authenticated. Please sign in to upload files.');
      toast.error('Not authenticated. Please sign in to upload files.');
      return;
    }

    for (let i = 0; i < filesToUpload.length; i++) {
      const f = filesToUpload[i];

      setFiles((prev) => prev.map((p) => (p.id === f.id ? { ...p, status: 'uploading', error: null } : p)));

      try {
        const form = new FormData();
        form.append('file', f.file, f.name);

        const res = await authedFetch(`${API_BASE}/files/upload/`, { method: 'POST', body: form });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          if (res.status === 401) {
            clearStoredTokens();
            setAuthError('Session expired. Redirecting to sign in...');
            toast.error('Session expired. Redirecting to sign in...');
            navigate('/auth/signin');
            return;
          }
          const err = (data && (data.error || data.detail || JSON.stringify(data))) || `Upload failed (${res.status})`;
          setFiles((prev) => prev.map((p) => (p.id === f.id ? { ...p, status: 'error', error: err } : p)));
          toast.error(`Upload failed for ${f.name}: ${err}`);
        } else {
          // Success
          const serverFile = data?.file || data;
          setFiles((prev) => prev.map((p) => (p.id === f.id ? { ...p, status: 'uploaded', server: serverFile } : p)));
          toast.success(`${f.name} uploaded successfully.`);

          // Attach file to current session if one exists
          if (sessionId && serverFile?.id) {
            await attachFileToSession(serverFile.id, sessionId);
          } else if (serverFile?.id) {
            // No session yet — queue for attachment when session is created
            pendingAttachRef.current.push(serverFile.id);
          }

          // Auto-trigger AI Analysis
          await autoSendToAi(serverFile, f.id);
        }
      } catch (err) {
        setFiles((prev) => prev.map((p) => (p.id === f.id ? { ...p, status: 'error', error: String(err) } : p)));
        toast.error(`Upload failed for ${f.name}: Network error`);
      }
    }
  };

  const autoSendToAi = async (fileServer, localId) => {
    if (!fileServer || !fileServer.id) return;

    // update status to processing
    setFiles((prev) => prev.map((p) =>
      p.id === localId ? { ...p, server: { ...p.server, status: 'processing' } } : p
    ));

    try {
      const res = await authedFetch(`${API_BASE}/files/${fileServer.id}/send-to-ai/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        const updatedFile = data.file || data;
        setFiles((prev) => prev.map((p) =>
          p.id === localId ? { ...p, server: { ...p.server, ...updatedFile } } : p
        ));
        if (data.ai_error) {
          toast.error(`AI processing error: ${data.ai_error}`);
        } else {
          toast.success(`${fileServer.original_filename || fileServer.name || 'File'} sent to AI successfully.`);
        }
      } else {
        setFiles((prev) => prev.map((p) =>
          p.id === localId ? { ...p, server: { ...p.server, status: 'uploaded' } } : p
        ));
        toast.error(data?.detail || data?.error || 'Failed to send to AI');
      }
    } catch (err) {
      console.error('Send to AI failed', err);
      setFiles((prev) => prev.map((p) =>
        p.id === localId ? { ...p, server: { ...p.server, status: 'uploaded' } } : p
      ));
      toast.error('Failed to send to AI: Network error');
    }
  };

  // manual AI trigger just in case
  const onSendToAi = async (fileServer) => {
    const pFile = files.find(f => f.server?.id === fileServer.id);
    if (pFile) {
      await autoSendToAi(fileServer, pFile.id);
    }
  };

  const onRemove = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const onDeleteRemote = async (fileServer) => {
    if (!fileServer || !fileServer.id) return;

    try {
      const res = await authedFetch(`${API_BASE}/files/${fileServer.id}/delete/`, { method: 'DELETE' });
      if (res.status === 401) {
        clearStoredTokens();
        navigate('/auth/signin');
        return;
      }
      if (res.ok || res.status === 404) {
        setFiles((prev) => prev.filter((p) => p.server?.id !== fileServer.id));
        toast.success("File deleted.");
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.detail || data?.error || `Delete failed (${res.status})`);
      }
    } catch (err) {
      console.error('Delete failed', err);
      toast.error('Delete failed: Network error');
    }
  };

  return (
    <aside className="w-full p-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Documents</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload documents to let the AI analyze them.</p>

      {!sessionId && (
        <div className="mt-3 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2">
          Start a chat first — documents you upload will be attached to the active chat session.
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {loadingServerFiles && <div className="text-sm text-gray-500">Loading session documents...</div>}
        {authError && <div className="text-sm text-red-400">{authError}</div>}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            id="doc-file-input"
            type="file"
            multiple
            accept=".pdf,.docx,.pptx,.xlsx,.csv,.jpg,.jpeg,.png"
            onChange={onPick}
            className="hidden"
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={!sessionId} className="px-3 w-full" >Upload Document</Button>
        </div>

        <div>
          <DocumentList files={files} onRemove={onRemove} onDeleteRemote={onDeleteRemote} onSendToAi={onSendToAi} />
        </div>
      </div>
    </aside>
  );
}
