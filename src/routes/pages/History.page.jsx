import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { authedFetch, getStoredTokens, clearStoredTokens } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Loader2, Trash2, MessageSquare } from "lucide-react";

const API_BASE = (typeof window !== 'undefined' && window.EDUPLAN_API_BASE) || 'http://127.0.0.1:8000/api';

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // fetch sessions from server
  useEffect(() => {
    const tokens = getStoredTokens();
    if (!tokens || !tokens.access) {
      navigate('/auth/signin');
      return;
    }

    const fetchSessions = async () => {
      try {
        const res = await authedFetch(`${API_BASE}/chat/sessions/`);
        if (res.status === 401) {
          clearStoredTokens();
          navigate('/auth/signin');
          return;
        }
        const data = await res.json().catch(() => null);
        if (res.ok && data) {
          // response: { count, sessions: [...] }
          const sessionList = Array.isArray(data.sessions) ? data.sessions : (Array.isArray(data) ? data : []);
          setSessions(sessionList);
        } else {
          setError('Failed to load chat history');
        }
      } catch (err) {
        setError('Network error loading history');
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [navigate]);

  const deleteSession = async (id, e) => {
    if (e) e.stopPropagation();
    if (!confirm('Delete this chat session?')) return;

    try {
      const res = await authedFetch(`${API_BASE}/chat/sessions/${id}/delete/`, { method: 'DELETE' });
      if (res.ok || res.status === 404) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const openSession = (id) => {
    navigate(`/app/chat/${id}`);
  };

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="animate-spin h-6 w-6 text-primary" />
      <span className="ml-2 text-gray-500">Loading history…</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Chat History</h2>
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      <div className="space-y-4">
        {sessions.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p>No chat history yet.</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/app')}>Start a new chat</Button>
          </div>
        )}

        {sessions.map((s) => (
          <div
            key={s.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-white dark:bg-gray-800 hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => openSession(s.id)}
          >
            <div className="min-w-0 flex-1 mb-3 sm:mb-0">
              <h3 className="font-medium text-lg text-gray-900 dark:text-white truncate pr-4 group-hover:text-primary transition-colors">
                {s.title || 'Untitled Session'}
              </h3>
              {s.last_message && (
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                  <span className="font-medium opacity-70">{s.last_message.sender === 'user' ? 'You: ' : 'AI: '}</span>
                  {s.last_message.content}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  {s.message_count || 0} messages
                </span>
                <span>
                  {s.last_activity_at ? new Date(s.last_activity_at).toLocaleString() : new Date(s.created_at).toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-end sm:ml-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => deleteSession(s.id, e)}
                className="text-red-400 hover:text-red-500 hover:bg-red-400/10"
                title="Delete session"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
              <Button
                size="sm"
                className="ml-2"
                onClick={(e) => { e.stopPropagation(); openSession(s.id); }}
              >
                Open Chat
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
