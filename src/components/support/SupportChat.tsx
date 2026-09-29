"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const quickActions = [
  {
    label: "Wallet Balance",
    message: "What is my current wallet balance?",
  },
  {
    label: "Deposits",
    message: "Show me the status of my recent deposits.",
  },
  {
    label: "Withdrawals",
    message: "What is the status of my latest withdrawal?",
  },
  {
    label: "My Bikes",
    message: "Which bikes do I currently own?",
  },
  {
    label: "Mining",
    message: "How much have I earned from mining recently?",
  },
  {
    label: "Missions",
    message: "What is my current mission progress?",
  },
  {
    label: "Referrals",
    message: "How many referrals do I have?",
  },
];

export default function SupportChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm Shopy Support. I can help you with your wallet, deposits, withdrawals, bikes, mining, missions, referrals, and account information.",
    },
  ]);

  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  async function sendMessage(customMessage?: string) {
    const trimmed = (customMessage ?? message).trim();

    if (!trimmed || loading) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    const conversation = [
      ...messages,
      userMessage,
    ];

    setMessages(conversation);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/support/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: conversation.map((item) => ({
            role: item.role,
            content: item.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to contact Shopy Support"
        );
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.answer,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[min(650px,calc(100vh-120px))] w-[calc(100vw-32px)] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl sm:right-6">
          <div className="flex items-center justify-between bg-lime-400 px-4 py-4">
            <div>
              <h2 className="font-semibold text-zinc-950">
                Shopy Support
              </h2>

              <p className="text-xs text-zinc-700">
                Account-aware customer assistance
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/10 text-lg text-zinc-950 transition hover:bg-black/20"
              aria-label="Close support chat"
            >
              ×
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-zinc-50 p-4">
            {messages.length === 1 && !loading && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-500">
                  Quick help
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => sendMessage(action.message)}
                      className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-left text-xs font-medium text-zinc-700 transition hover:border-lime-400 hover:bg-lime-50"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((item) => (
              <div
                key={item.id}
                className={`flex ${
                  item.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                    item.role === "user"
                      ? "rounded-br-md bg-zinc-950 text-white"
                      : "rounded-bl-md border border-zinc-200 bg-white text-zinc-800"
                  }`}
                >
                  {item.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-500">
                  Shopy Support is checking your account...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-zinc-200 bg-white p-3">
            <div className="flex items-end gap-2 rounded-2xl border border-zinc-300 bg-zinc-50 p-2 focus-within:border-lime-500">
              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask about your account..."
                rows={1}
                maxLength={2000}
                className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
              />

              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={!message.trim() || loading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-400 text-zinc-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                ↑
              </button>
            </div>

            <p className="mt-2 text-center text-[10px] text-zinc-400">
              Shopy Support can only access information from your account.
            </p>
          </div>
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-lime-400 text-xl text-zinc-950 shadow-xl transition hover:scale-105 hover:bg-lime-300"
          aria-label="Open Shopy Support"
        >
          ?
        </button>
      )}
    </>
  );
}