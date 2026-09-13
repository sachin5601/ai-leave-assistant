import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  MessageSquare,
  Bot,
  User as UserIcon,
  AlertTriangle,
  RotateCcw,
  Mail,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { api, friendlyError } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ChatMessage } from "@/types";

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const suggestedQuestions = [
  "How many sick leaves do I have?",
  "What is my total leave balance?",
  "Who is my manager?",
  "What is the leave policy?",
  "How many days in advance should I apply for planned leave?",
];

export function ChatPage() {
  const { session } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending || !session) return;

      const userMsg: ChatMessage = {
        id: makeId(),
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
        status: "sent",
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setSending(true);
      setErrorMsg(null);

      try {
        const { reply } = await api.sendChatMessage(session, trimmed);

        const aiMsg: ChatMessage = {
          id: makeId(),
          role: "assistant",
          content: reply || "I'm sorry, I couldn't process that request.",
          timestamp: Date.now(),
          status: "sent",
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (err) {
        const aiMsg: ChatMessage = {
          id: makeId(),
          role: "assistant",
          content: "",
          timestamp: Date.now(),
          status: "error",
        };
        setMessages((prev) => [...prev, aiMsg]);
        setErrorMsg(friendlyError(err));
      } finally {
        setSending(false);
        inputRef.current?.focus();
      }
    },
    [sending, session],
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  }

  function retryLastMessage() {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;
    // Remove the last error message
    setMessages((prev) => {
      const copy = [...prev];
      if (copy.length > 0 && copy[copy.length - 1].status === "error") {
        copy.pop();
      }
      return copy;
    });
    handleSend(lastUserMsg.content);
  }

  const isEmpty = messages.length === 0 && !sending;

  return (
    <div className="flex flex-col h-full">
      {/* Page title */}
      <div className="px-4 lg:px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI HR Assistant</h2>
            <p className="text-sm text-gray-500">
              Ask about your leave, policies, or apply for time off.
            </p>
          </div>
        </div>
      </div>

      {/* Chat container */}
      <div className="flex-1 flex flex-col px-4 lg:px-6 pb-6 min-h-0">
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm min-h-0">
          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4"
          >
            {isEmpty && (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600">
                  <Sparkles size={32} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  How can I help you today?
                </h3>
                <p className="text-sm text-gray-500 max-w-sm mb-6">
                  I can check your leave balance, explain policies, or help you
                  apply for leave.
                </p>
                <div className="flex flex-col gap-2 w-full max-w-md">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="text-left px-4 py-2.5 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-sm text-gray-700 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {msg.role === "user" ? <UserIcon size={16} /> : <Bot size={16} />}
                </div>
                <div
                  className={`max-w-[75%] ${
                    msg.role === "user" ? "items-end" : "items-start"
                  } flex flex-col gap-1`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-sm"
                        : "bg-gray-100 text-gray-800 rounded-tl-sm"
                    } ${msg.status === "error" ? "bg-red-50 text-red-700" : ""}`}
                  >
                    {msg.status === "error" ? (
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} />
                        <span>Failed to get a response.</span>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                  {msg.emailSent && (
                    <div className="flex items-center gap-1.5 text-xs text-green-600 px-1">
                      <Mail size={12} />
                      <span>Your manager has been notified by email.</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600">
                  <Bot size={16} />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-gray-100 rounded-tl-sm">
                  <Spinner size={18} />
                </div>
              </div>
            )}
          </div>

          {/* Error bar */}
          {errorMsg && (
            <div className="px-4 lg:px-6 pb-2">
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <AlertTriangle size={16} />
                  <span>{errorMsg}</span>
                </div>
                <Button variant="secondary" size="sm" onClick={retryLastMessage}>
                  <RotateCcw size={14} />
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-200 p-3 lg:p-4">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                rows={1}
                disabled={sending}
                className="flex-1 resize-none rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 max-h-32"
                style={{ minHeight: "42px" }}
              />
              <Button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || sending}
                size="md"
                className="shrink-0"
              >
                <Send size={18} />
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-400 text-center">
              Your identity is verified as {session?.employeeId}. You can only
              access your own HR information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
