import { cn } from "@/lib/utils"; // optional if you use shadcn/ui utils

export default function UserMessage({
  message = "",
  avatar,
  username = "You",
}) {
  return (
    <article className="flex items-start justify-end gap-4 animate-fade-in">
      {/* Message content */}
      <div className="flex flex-col items-end gap-1 text-right">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {username}
        </p>

        <div
          className={cn(
            "rounded-lg p-3 text-white max-w-md",
            "bg-primary transition-transform duration-200 hover:scale-[1.01]"
          )}
        >
          <p className="whitespace-pre-wrap">{message}</p>
        </div>
      </div>

      {/* Avatar */}
      <div
        className="h-10 w-10 flex-shrink-0 rounded-full bg-cover bg-center border border-white/20 shadow-sm"
        style={{
          backgroundImage: `url("${
            avatar ||
            "https://lh3.googleusercontent.com/aida-public/AB6AXuA0aKVFdxSZEv7GAIlg5PImRMqB6x3sssdMuwtfqutl35tzDpKtw97Xp9LDJLfhnKB3i0BfekRD1_4XSYL9qSh49QYmsJ0Bqcmm9ms2uvDlNus-97yalaUTUstHcR3abQdsoBbcQH4NdTRhriqyexg0m4h9eG5iKTD_J9zMnk4FsdRT1qys3b53QFegpBGYA2e7IZgAHUoppeXk8d1z3lxcLu2Wk7_8233GWUPP81yPGZHuNhj_AuviqFfm-Ox50koIgWHJfcT57xhp"
          }")`,
        }}
      />
    </article>
  );
}
