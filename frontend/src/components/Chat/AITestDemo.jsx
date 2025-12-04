import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AIMessage from "./AIMessage";

export default function AITestDemo() {
  const [status, setStatus] = useState("idle");
  const [msg, setMsg] = useState("");

  const runDemo = () => {
    setStatus("loading");
    setMsg("");
    setTimeout(() => {
      setStatus("idle");
      setMsg(
        "Sure! The Renaissance was a period of great cultural, artistic, and scientific advancement in Europe between the 14th and 17th centuries."
      );
    }, 1500);
  };

  useEffect(runDemo, []);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 flex flex-col items-center justify-center p-8">
      <AIMessage message={msg} status={status} />
      <Button onClick={runDemo} className="mt-6">
        🔄 Replay Animation
      </Button>
    </div>
  );
}
