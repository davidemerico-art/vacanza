"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/useTranslation";

type UserType = "user" | "admin" | null;
type AuthState = { loggedIn: boolean; userType: UserType };
type PhotoItem = { id: number; url: string };

type Mode = "select" | "user-login" | "user-register" | "admin-login";

export default function Home() {
  const { t, locale } = useTranslation();
  const [mode, setMode] = useState<Mode>("select");
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "" });
  const [adminCode, setAdminCode] = useState("");
  const [adminCode2, setAdminCode2] = useState("");
  const [auth, setAuth] = useState<AuthState>({ loggedIn: false, userType: null });
  const [authResolved, setAuthResolved] = useState(false);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [newPhoto, setNewPhoto] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [bnbDescription, setBnbDescription] = useState("");
  const [bnbDescriptionEn, setBnbDescriptionEn] = useState("");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const nextPhoto = () => {
    if (photos.length === 0) return;
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    if (photos.length === 0) return;
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const fetchPhotos = async () => {
    try {
      const res = await fetch("/api/photos");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setPhotos(data as PhotoItem[]);
        setCurrentPhotoIndex(0);
      }
    } catch (error) {
      console.error("Errore caricamento foto:", error);
    }
  };

  const fetchBnbDescription = async () => {
    try {
      const res = await fetch("/api/settings/bnb-description");
      if (!res.ok) return;
      const data = await res.json();
      setBnbDescription(data.description || "");
      setBnbDescriptionEn(data.descriptionEn || "");
    } catch (error) {
      console.error("Errore caricamento descrizione:", error);
    }
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn") === "true";
    const userType = (localStorage.getItem("userType") as UserType) || null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuth({ loggedIn, userType });
    setAuthResolved(true);
  }, []);

  useEffect(() => {
    if (auth.loggedIn) {
      fetchPhotos();
      fetchBnbDescription();
    }
  }, [auth.loggedIn]);

  const saveLogin = (type: UserType, email: string, name: string) => {
    setAuth({ loggedIn: true, userType: type });
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("userType", type || "");
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userName", name);
  };

  const handleUserRegister = async () => {
    if (!userForm.name || !userForm.email || !userForm.password) {
      alert(t("home.errorFields"));
      return;
    }

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register", ...userForm }),
    });
    const result = await response.json();

    if (result.success) {
      alert(t("home.successRegister"));
      setMode("user-login");
      setUserForm({ name: "", email: "", password: "" });
    } else {
      alert(result.message || t("home.errorRegister"));
    }
  };

  const handleUserLogin = async () => {
    if (!userForm.email || !userForm.password) {
      alert(t("home.errorFields"));
      return;
    }

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", email: userForm.email, password: userForm.password }),
    });
    const result = await response.json();

    if (result.success) {
      saveLogin("user", result.user.email, result.user.name);
      setMode("select");
      fetchPhotos();
    } else {
      alert(result.message || t("home.errorLogin"));
    }
  };

  const handleAdminLogin = () => {
    const codes = [adminCode, adminCode2].sort();
    const validCodes = ["foresta", "veloda"].sort();
    
    if (codes[0] === validCodes[0] && codes[1] === validCodes[1]) {
      saveLogin("admin", "", "Admin");
      setAdminCode("");
      setAdminCode2("");
      fetchPhotos();
      fetchBnbDescription();
    } else {
      alert(t("home.errorAdminCode"));
    }
  };

  const handleAddPhoto = async () => {
    if (!newPhoto.trim() && !photoFile) {
      alert(t("home.errorPhotoUrl"));
      return;
    }

    let response: Response;
    if (photoFile) {
      const formData = new FormData();
      formData.append("file", photoFile);
      if (newPhoto.trim()) {
        formData.append("url", newPhoto.trim());
      }

      response = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });
    } else {
      response = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newPhoto.trim() }),
      });
    }

    const result = await response.json();

    if (response.ok) {
      setNewPhoto("");
      setPhotoFile(null);
      fetchPhotos();
    } else {
      alert(result.message || t("home.errorSavePhoto"));
    }
  };

  const handleDeletePhoto = async (id: number) => {
    if (!confirm(t("home.deleteConfirm") || "Sei sicuro di voler eliminare questa foto?")) {
      return;
    }

    const response = await fetch(`/api/photos/${id}`, { method: "DELETE" });
    if (response.ok) {
      fetchPhotos();
    } else {
      alert(t("home.errorSavePhoto"));
    }
  };

  const handleSaveDescription = async () => {
    const response = await fetch("/api/settings/bnb-description", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: bnbDescription, descriptionEn: bnbDescriptionEn }),
    });

    if (response.ok) {
      alert(t("home.saveDescription") || "Descrizione salvata!");
      fetchBnbDescription();
    } else {
      alert(t("home.errorSavePhoto"));
    }
  };

  const handleLogout = () => {
    setAuth({ loggedIn: false, userType: null });
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userType");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    setMode("select");
  };

  if (!authResolved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-700 dark:text-gray-200">{t("home.loadingAuth")}</div>
      </div>
    );
  }

  if (!auth.loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gray-900 font-sans" suppressHydrationWarning>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-center mb-8">
            <img src="/logopng.png" alt="Casa Vacanza" className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400">{t("home.heading")}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t("home.tagline")}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
            {mode === "select" && (
              <>
                <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-gray-200">
                  {t("home.selectAccount")}
                </h1>
                <div className="space-y-4">
                  <button
                    onClick={() => setMode("user-login")}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {t("home.userOption")}
                  </button>
                </div>
              </>
            )}

            {mode === "user-login" && (
              <>
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t("home.userLoginTitle")}</h2>
                <input
                  type="email"
                  placeholder={t("home.email")}
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="password"
                  placeholder={t("home.password")}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleUserLogin}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-3 font-medium"
                >
                  {t("home.login")}
                </button>
                <button
                  onClick={() => setMode("user-register")}
                  className="w-full py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {t("home.register")}
                </button>
                <button
                  onClick={() => setMode("select")}
                  className="w-full py-3 mt-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  {t("home.backButton")}
                </button>
              </>
            )}

            {mode === "user-register" && (
              <>
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t("home.userRegisterTitle")}</h2>
                <input
                  type="text"
                  placeholder={t("home.name")}
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder={t("home.email")}
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="password"
                  placeholder={t("home.password")}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleUserRegister}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mb-3 font-medium"
                >
                  {t("home.register")}
                </button>
                <button
                  onClick={() => setMode("user-login")}
                  className="w-full py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  {t("home.backToLogin")}
                </button>
              </>
            )}

            {mode === "admin-login" && (
              <>
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t("home.adminLoginTitle")}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t("home.adminLoginDescription")}</p>
                <input
                  type="text"
                  placeholder={t("home.adminCode1")}
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder={t("home.adminCode2")}
                  value={adminCode2}
                  onChange={(e) => setAdminCode2(e.target.value)}
                  className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={handleAdminLogin}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mb-3 font-medium"
                >
                  {t("home.login")}
                </button>
                <button
                  onClick={() => setMode("select")}
                  className="w-full py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  {t("home.backButton")}
                </button>
              </>
            )}
          </div>
          
          {mode === "select" && (
            <div className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-700 w-full text-center">
              <button
                onClick={() => setMode("admin-login")}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                {t("home.adminArea")}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const displayedPhoto = photos.length > 0
    ? photos[currentPhotoIndex]
    : { id: 0, url: "https://via.placeholder.com/800x400?text=Casa+Vacanza+1" };

  if (auth.userType === "user") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gray-900" suppressHydrationWarning>
        <header className="bg-white dark:bg-gray-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => (window.location.href = "/")}>
              <img src="/logopng.png" alt="Casa Vacanza" className="h-10 w-10" />
              <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Casa Vacanza</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => (window.location.href = "/messaggi")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {t("home.messages")}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                {t("common.logout")}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="relative w-full bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-2xl mb-12 overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <img src={displayedPhoto.url} alt={`Casa ${currentPhotoIndex + 1}`} className="w-full h-full object-contain" loading="eager" decoding="async" />
            {/* Freccia sinistra */}
            <button
              onClick={prevPhoto}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white hover:bg-blue-600 text-gray-900 hover:text-white px-4 py-3 rounded-full hover:scale-110 transition-all shadow-lg text-2xl font-bold z-10"
              aria-label="Foto precedente"
            >
              ‹
            </button>
            
            {/* Freccia destra */}
            <button
              onClick={nextPhoto}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white hover:bg-blue-600 text-gray-900 hover:text-white px-4 py-3 rounded-full hover:scale-110 transition-all shadow-lg text-2xl font-bold z-10"
              aria-label="Foto successiva"
            >
              ›
            </button>

            {/* Numero foto */}
            <div className="absolute top-6 right-6 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
              {photos.length > 0 ? `${currentPhotoIndex + 1} / ${photos.length}` : "0 / 0"}
            </div>

            {/* Dot indicators clicabili */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 bg-black bg-opacity-50 px-4 py-3 rounded-full backdrop-blur-sm">
              {photos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`transition-all cursor-pointer ${
                    index === currentPhotoIndex
                      ? "bg-white w-8 h-3 rounded-full"
                      : "bg-white bg-opacity-40 hover:bg-opacity-70 w-3 h-3 rounded-full"
                  }`}
                  aria-label={`Vai a foto ${index + 1}`}
                ></button>
              ))}
            </div>
          </div>

          {(bnbDescription || bnbDescriptionEn) && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t("home.bnbDescription")}</h2>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {locale === "en" ? (bnbDescriptionEn || bnbDescription) : (bnbDescription || bnbDescriptionEn)}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t("home.location")}</h2>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3083.1234!2d18.1714!3d40.3515!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1344108b8c7c7c7c7%3A0x1234567890abcdef!2zTGVjY2UsIEl0YWxpYQ!5e0!3m2!1sit!2sit!4v1234567890!5m2!1sit!2sit"
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: '8px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p>📍 Casa: Via Vecchia Frigole 35, Lecce</p>
                <p>🏛️ Centro: Centro storico di Lecce</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t("home.actions")}</h2>
              <div className="space-y-4">
                <button
                  onClick={() => window.location.href = '/servizi'}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {t("home.services")}
                </button>
                <button
                  onClick={() => window.location.href = '/pernottare'}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  {t("home.booking")}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (auth.userType === "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:bg-gray-900" suppressHydrationWarning>
        <header className="bg-white dark:bg-gray-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => (window.location.href = "/")}>
              <img src="/logopng.png" alt="Casa Vacanza" className="h-10 w-10" />
              <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">{t("home.adminPanel")}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => (window.location.href = "/messaggi")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {t("home.messages")}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                {t("common.logout")}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t("home.uploadPhotos")}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <input
                  type="text"
                  placeholder={t("home.imageUrl")}
                  value={newPhoto}
                  onChange={(e) => setNewPhoto(e.target.value)}
                  className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t("home.photoFile")}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-gray-700 dark:text-gray-200"
                />
                {photoFile && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{photoFile.name}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleAddPhoto}
              className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              {t("home.addPhoto")}
            </button>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{t("home.imageUrl")} o {t("home.photoFile")}.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t("home.currentPhotos")}</h2>
            {photos.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">{t("home.noPhotos")}</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img src={photo.url} alt={`Foto ${photo.id}`} className="w-full h-32 object-cover" />
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="w-full py-2 bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      {t("common.delete")}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t("home.bnbDescription")}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Italiano
                </label>
                <textarea
                  value={bnbDescription}
                  onChange={(e) => setBnbDescription(e.target.value)}
                  placeholder={t("home.bnbDescriptionPlaceholder")}
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  English
                </label>
                <textarea
                  value={bnbDescriptionEn}
                  onChange={(e) => setBnbDescriptionEn(e.target.value)}
                  placeholder={t("home.bnbDescriptionPlaceholder")}
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
                />
              </div>
            </div>
            <button
              onClick={handleSaveDescription}
              className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              {t("home.saveDescription")}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t("home.serviceManagement")}</h2>
              <button
                onClick={() => window.location.href = '/servizi'}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {t("home.goToServices")}
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t("home.bookingManagement")}</h2>
              <button
                onClick={() => window.location.href = '/prenotazioni'}
                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                {t("home.viewBookings")}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
