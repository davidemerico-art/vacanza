"use client";

import { useEffect, useState } from "react";

type Message = {
  id: number;
  senderType: "user" | "admin";
  senderName: string;
  content: string;
  createdAt: string;
};

export default function MessaggiPage() {
  const [userType] = useState<"user" | "admin" | null>(() => {
    if (typeof window === "undefined") return null;
    const loggedIn = localStorage.getItem("loggedIn") === "true";
    const type = localStorage.getItem("userType") as "user" | "admin" | null;
    return loggedIn ? type : null;
  });
  const [senderName] = useState(() => {
    if (typeof window === "undefined") return "";
    const type = localStorage.getItem("userType") as "user" | "admin" | null;
    return localStorage.getItem("userName") || (type === "admin" ? "Admin" : "Utente");
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const loadMessages = async () => {
    const res = await fetch("/api/messages");
    if (!res.ok) return;
    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    if (!userType) {
      window.location.href = "/";
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMessages();
  }, [userType]);

  const handleSend = async () => {
    if (!userType || !newMessage.trim()) return;

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderType: userType,
        senderName,
        content: newMessage,
      }),
    });

    if (!res.ok) return;
    setNewMessage("");
    loadMessages();
  };

  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Messaggi</h1>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Home
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 h-[60vh] overflow-y-auto space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg ${
                message.senderType === "admin"
                  ? "bg-green-100 dark:bg-green-900/40"
                  : "bg-blue-100 dark:bg-blue-900/40"
              }`}
            >
              <p className="font-semibold text-gray-800 dark:text-gray-100">
                {message.senderName} ({message.senderType})
              </p>
              <p className="text-gray-700 dark:text-gray-200">{message.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Scrivi un messaggio..."
            className="flex-1 p-3 border border-gray-300 rounded-lg"
          />
          <button
            onClick={handleSend}
            className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Invia
          </button>
        </div>
      </main>
    </div>
  );
}
