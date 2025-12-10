import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import AIMessage from "@/components/Chat/AIMessage";
import UserMessage from "@/components/Chat/UserMessage";

const SESSIONS_KEY = "eduplan_chat_sessions";

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]");
      setSessions(stored);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const clearAll = () => {
    localStorage.removeItem(SESSIONS_KEY);
    setSessions([]);
    setSelected(null);
  };

  const removeSession = (id) => {
    const filtered = sessions.filter((s) => s.id !== id);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));
    setSessions(filtered);
    if (selected && selected.id === id) setSelected(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="col-span-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chat History</h2>
          <Button variant="destructive" size="sm" onClick={clearAll} disabled={sessions.length===0}>Clear</Button>
        </div>
        <div className="mt-4 space-y-3">
          {sessions.length === 0 && <div className="text-sm text-gray-500">No history yet.</div>}
          {sessions.map((s) => (
            <div key={s.id} className="rounded-md border p-3 cursor-pointer hover:bg-primary/5" onClick={() => setSelected(s)}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Session - {new Date(s.createdAt).toLocaleString()}</div>
                  <div className="text-sm text-gray-500">{(s.messages||[]).length} messages</div>
                </div>
                <div>
                  <Button variant="ghost" size="sm" onClick={(e)=>{e.stopPropagation(); removeSession(s.id);}}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-2">
        {!selected ? (
          <div className="text-sm text-gray-500">Select a session to view messages.</div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">Session from {new Date(selected.createdAt).toLocaleString()}</div>
            <div className="flex flex-col gap-4">
              {(selected.messages || []).map((msg) =>
                msg.type === "ai" ? (
                  <AIMessage key={msg.id} message={msg.message} status={msg.status} />
                ) : (
                  <UserMessage key={msg.id} username={msg.username} avatar={msg.avatar} message={msg.message} />
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
