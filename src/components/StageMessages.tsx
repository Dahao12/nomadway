"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  stage_id: string;
  sender_type: "admin" | "client";
  sender_name: string;
  message: string;
  created_at: string;
  read_at: string | null;
}

interface StageMessagesProps {
  clientId: string;
  stageId: string;
  stageName: string;
  messages: Message[];
  currentUserId: string;
  onNewMessage?: () => void;
  isClientView?: boolean;
}

export default function StageMessages({
  clientId,
  stageId,
  stageName,
  messages,
  currentUserId,
  onNewMessage,
  isClientView = false,
}: StageMessagesProps) {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          stage_id: stageId,
          sender_type: isClientView ? "client" : "admin",
          sender_name: isClientView ? "Cliente" : "Admin",
          message: newMessage.trim(),
        }),
      });

      if (response.ok) {
        setNewMessage("");
        onNewMessage?.();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="flex flex-col h-[400px] bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <span className="font-semibold text-gray-900">{stageName}</span>
          <span className="text-xs text-gray-400 ml-auto">{localMessages.length} mensagens</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {localMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Nenhuma mensagem ainda. Comece a conversa!
          </div>
        ) : (
          localMessages.map((msg) => {
            const isAdmin = msg.sender_type === "admin";
            return (
              <div
                key={msg.id}
                className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                    isAdmin
                      ? "bg-gray-100 text-gray-900 rounded-bl-sm"
                      : "bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-br-sm"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${isAdmin ? "text-primary-600" : "text-white/80"}`}>
                      {msg.sender_name}
                    </span>
                    <span className={`text-xs ${isAdmin ? "text-gray-400" : "text-white/60"}`}>
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                  <p className={`text-sm ${isAdmin ? "text-gray-700" : "text-white"}`}>
                    {msg.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/50">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Digite sua mensagem..."
            className="flex-1 border-gray-200 focus:ring-primary-500 focus:border-primary-500"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="px-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
          >
            {sending ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}