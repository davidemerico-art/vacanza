"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslation } from "@/lib/useTranslation";

type Message = {
  id: number;
  senderType: "user" | "admin";
  senderName: string;
  userEmail: string | null;
  content: string;
  contentEn: string;
  createdAt: string;
};

type UserItem = {
  id: number;
  name: string;
  email: string;
};

export default function MessaggiPage() {
  const { t, locale } = useTranslation();
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
  const userEmail = useSyncExternalStore(
    () => () => {},
    () => localStorage.getItem("userEmail") || "",
    () => ""
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [phoneInput, setPhoneInput] = useState("");

  const loadUsers = async () => {
    const res = await fetch("/api/users");
    if (!res.ok) return;
    const data = await res.json();
    setUsers(data);
    if (!selectedUserEmail && data.length > 0) {
      setSelectedUserEmail(data[0].email);
    }
  };

  const loadMessages = async (email?: string) => {
    const conversationEmail = email || (userType === "user" ? userEmail : selectedUserEmail);
    if (!conversationEmail) {
      setMessages([]);
      return;
    }

    const res = await fetch(`/api/messages?userEmail=${encodeURIComponent(conversationEmail)}`);
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

    loadAdminPhone();
    if (userType === "admin") {
      loadUsers();
    } else {
      loadMessages(userEmail);
    }
  }, [userType, userEmail]);

  useEffect(() => {
    if (userType === "admin" && selectedUserEmail) {
      loadMessages(selectedUserEmail);
    }
  }, [selectedUserEmail, userType]);

  const handleSend = async () => {
    if (!userType || !newMessage.trim()) return;

    const conversationEmail = userType === "admin" ? selectedUserEmail : userEmail;
    if (!conversationEmail) {
      alert(t("messaggi.selectUserPrompt"));
      return;
    }

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderType: userType,
        senderName,
        content: newMessage,
        userEmail: conversationEmail,
      }),
    });

    if (!res.ok) return;
    setNewMessage("");
    loadMessages(conversationEmail);
  };

  const handleDeleteMessage = async (id: number) => {
    if (!confirm(t("messaggi.deleteConfirm"))) return;
    const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (userType === "admin") {
        loadMessages(selectedUserEmail);
      } else {
        loadMessages(userEmail);
      }
    }
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

  const selectedUser = users.find((user) => user.email === selectedUserEmail);

  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gray-900 flex items-center justify-center" suppressHydrationWarning>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="text-xl font-semibold mb-2">{t("messaggi.accessRequired")}</div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t("messaggi.loginRequired")}
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("messaggi.backHome")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gray-900" suppressHydrationWarning>
      <header className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{t("messaggi.title")}</h1>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("common.home")}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {userType === "admin" ? (
          <div className="mb-4 bg-white dark:bg-gray-800 rounded-xl shadow p-4 space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{t("messaggi.adminPhone")}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Es. +39 333 1234567"
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleSavePhone}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {t("messaggi.save")}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {t("messaggi.selectUser")}
              </p>
              {users.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("messaggi.noUsers")}
                </p>
              ) : (
                <select
                  value={selectedUserEmail}
                  onChange={(e) => setSelectedUserEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.email}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-4 bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t("messaggi.adminPhone")}: {" "}
              <span className="font-semibold text-blue-700 dark:text-blue-300">
                {adminPhone || t("messaggi.phoneNumber")}
              </span>
            </p>
          </div>
        )}

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {userType === "admin"
              ? `${t("messaggi.conversationWith")} ${selectedUser?.name || selectedUserEmail || t("messaggi.selectUser")}`
              : t("messaggi.conversationWithAdmin")}
          </h2>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 h-[60vh] overflow-y-auto space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg relative group ${
                message.senderType === "admin"
                  ? "bg-green-100 dark:bg-green-900/40"
                  : "bg-blue-100 dark:bg-blue-900/40"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {message.senderName} ({message.senderType})
                  </p>
                  <p className="text-gray-700 dark:text-gray-200">
                    {locale === "en" ? (message.contentEn || message.content) : message.content}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteMessage(message.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 text-xs rounded transition-all"
                  title={t("messaggi.deleteMessage")}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t("messaggi.messagePlaceholder")}
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button
            onClick={handleSend}
            className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("messaggi.sendMessage")}
          </button>
        </div>
      </main>
    </div>
  );
}
