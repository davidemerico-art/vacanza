"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type Message = {
  id: number;
  senderType: "user" | "admin";
  senderName: string;
  content: string;
  createdAt: string;
};

export default function MessaggiPage() {
  const userType = useSyncExternalStore(
    () => () => {},
    () => {
      const loggedIn = localStorage.getItem("loggedIn") === "true";
      const type = localStorage.getItem("userType") as "user" | "admin" | null;
      return loggedIn ? type : null;
    },
    () => null
  );
  const senderName = useSyncExternalStore(
    () => () => {},
    () => {
      const type = localStorage.getItem("userType") as "user" | "admin" | null;
      return localStorage.getItem("userName") || (type === "admin" ? "Admin" : "Utente");
    },
    () => ""
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [phoneInput, setPhoneInput] = useState("");

  const loadMessages = async () => {
    const res = await fetch("/api/messages");
    if (!res.ok) return;
    const data = await res.json();
    setMessages(data);
  };

  const loadAdminPhone = async () => {
    const res = await fetch("/api/settings/admin-phone");
    if (!res.ok) return;
    const data = await res.json();
    setAdminPhone(data.phone || "");
    setPhoneInput(data.phone || "");
  };

  useEffect(() => {
    if (!userType) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMessages();
    loadAdminPhone();
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

  const handleSavePhone = async () => {
    if (userType !== "admin") return;
    const res = await fetch("/api/settings/admin-phone", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phoneInput }),
    });
    if (!res.ok) return;
    setAdminPhone(phoneInput.trim());
  };

  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="text-xl font-semibold mb-2">Accesso richiesto</div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Devi fare login prima di usare i messaggi.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Vai al login
          </button>
        </div>
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
        {userType === "admin" ? (
          <div className="mb-4 bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Numero telefono visibile agli utenti</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="Es. +39 333 1234567"
                className="flex-1 p-3 border border-gray-300 rounded-lg"
              />
              <button
                onClick={handleSavePhone}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Salva numero
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-4 bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Telefono admin:{" "}
              <span className="font-semibold text-blue-700 dark:text-blue-300">
                {adminPhone || "Non ancora disponibile"}
              </span>
            </p>
          </div>
        )}

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
