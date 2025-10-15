import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Chat() {
  return (
    <div className="flex flex-col min-h-full  overflow-hidden   justify-between pt-6 col-span-4  md:col-span-3 col-start-1 w-full h-full">
      <div className="flex-1 space-y-6 overflow-y-auto pr-4">
        {/* AI Assistant */}
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">smart_toy</span>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Assistant</p>
            <div className="rounded-lg bg-gray-200 dark:bg-gray-800 p-3 max-w-md">
              <p>Hi there! I'm here to help you with your studies. How can I assist you today?</p>
            </div>
          </div>
        </div>

        {/* User message */}
        <div className="flex items-start justify-end gap-4">
          <div className="flex flex-col items-end gap-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">You</p>
            <div className="rounded-lg bg-primary p-3 text-white max-w-md">
              <p>Can you help me understand the key concepts in my history document?</p>
            </div>
          </div>
          <div
            className="h-10 w-10 flex-shrink-0 rounded-full bg-cover bg-center"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA0aKVFdxSZEv7GAIlg5PImRMqB6x3sssdMuwtfqutl35tzDpKtw97Xp9LDJLfhnKB3i0BfekRD1_4XSYL9qSh49QYmsJ0Bqcmm9ms2uvDlNus-97yalaUTUstHcR3abQdsoBbcQH4NdTRhriqyexg0m4h9eG5iKTD_J9zMnk4FsdRT1qys3b53QFegpBGYA2e7IZgAHUoppeXk8d1z3lxcLu2Wk7_8233GWUPP81yPGZHuNhj_AuviqFfm-Ox50koIgWHJfcT57xhp")',
            }}
          />
        </div>

        {/* AI Typing */}
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary animate-spin">
              progress_activity
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Assistant</p>
            <div className="rounded-lg bg-gray-200 dark:bg-gray-800 p-3 max-w-md">
              <p>
                Of course! Please upload your history document, and I'll analyze it to summarize the key concepts.
              </p>
            </div>
          </div>
        </div>
      </div>
            
      {/* Suggestion buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline">Summarize this document</Button>
        <Button variant="outline">What are the key themes?</Button>
        <Button variant="outline">Create a quiz based on this</Button>
      </div>

      {/* Input box */}
      <div className="mt-4 flex items-center gap-2">
        <Input placeholder="Type your message..." className="flex-1" />
        <Button className="h-10 w-10 p-0 rounded-lg">
          <span className="material-symbols-outlined">send</span>
        </Button>
      </div>
    </div>
  );
}
