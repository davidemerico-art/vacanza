"use client";

import { useState, useEffect } from "react";

type UserType = "user" | "admin" | null;
type AuthState = { loggedIn: boolean; userType: UserType };
type PhotoItem = { url: string };

type Mode = "select" | "user-login" | "user-register" | "admin-login";

export default function Home() {
  const [mode, setMode] = useState<Mode>("select");
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "" });
  const [adminCode, setAdminCode] = useState("");
  const [auth, setAuth] = useState<AuthState>({ loggedIn: false, userType: null });
  const [authResolved, setAuthResolved] = useState(false);
  const [photos, setPhotos] = useState<string[]>(["https://via.placeholder.com/800x400?text=Casa+Vacanza+1"]);
  const [newPhoto, setNewPhoto] = useState("");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const fetchPhotos = async () => {
    try {
      const res = await fetch("/api/photos");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setPhotos(data.map((item: PhotoItem) => item.url));
        setCurrentPhotoIndex(0);
      }
    } catch (error) {
      console.error("Errore caricamento foto:", error);
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchPhotos();
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
      alert("Compila tutti i campi.");
      return;
    }

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register", ...userForm }),
    });
    const result = await response.json();

    if (result.success) {
      alert("Registrazione completata! Ora puoi accedere.");
      setMode("user-login");
      setUserForm({ name: "", email: "", password: "" });
    } else {
      alert(result.message || "Errore durante la registrazione.");
    }
  };

  const handleUserLogin = async () => {
    if (!userForm.email || !userForm.password) {
      alert("Compila tutti i campi.");
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
      alert(result.message || "Credenziali errate.");
    }
  };

  const handleAdminLogin = () => {
    if (adminCode === "veloda" || adminCode === "foresta") {
      saveLogin("admin", "", "Admin");
      fetchPhotos();
    } else {
      alert("Codice admin errato.");
    }
  };

  const handleAddPhoto = async () => {
    if (!newPhoto.trim()) {
      alert("Inserisci l'URL dell'immagine.");
      return;
    }

    const response = await fetch("/api/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: newPhoto }),
    });
    const result = await response.json();

    if (response.ok) {
      setNewPhoto("");
      fetchPhotos();
    } else {
      alert(result.message || "Errore durante il salvataggio della foto.");
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
        <div className="text-xl text-gray-700 dark:text-gray-200">Caricamento...</div>
      </div>
    );
  }

  if (!auth.loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gray-900 font-sans">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-center mb-8">
            <img src="/logopng.png" alt="Casa Vacanza" className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400">Casa Vacanza</h1>
            <p className="text-gray-600 dark:text-gray-400">Il tuo rifugio perfetto a Lecce</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
            {mode === "select" && (
              <>
                <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-gray-200">
                  Accedi al tuo account
                </h1>
                <div className="space-y-4">
                  <button
                    onClick={() => setMode("user-login")}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Accedi come Utente
                  </button>
                  <button
                    onClick={() => setMode("admin-login")}
                    className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Accedi come Admin
                  </button>
                </div>
              </>
            )}

            {mode === "user-login" && (
              <>
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Login Utente</h2>
                <input
                  type="email"
                  placeholder="Email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleUserLogin}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-3 font-medium"
                >
                  Accedi
                </button>
                <button
                  onClick={() => setMode("user-register")}
                  className="w-full py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Registrati
                </button>
                <button
                  onClick={() => setMode("select")}
                  className="w-full py-3 mt-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Indietro
                </button>
              </>
            )}

            {mode === "user-register" && (
              <>
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Registrazione Utente</h2>
                <input
                  type="text"
                  placeholder="Nome"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleUserRegister}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mb-3 font-medium"
                >
                  Registrati
                </button>
                <button
                  onClick={() => setMode("user-login")}
                  className="w-full py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Torna al Login
                </button>
              </>
            )}

            {mode === "admin-login" && (
              <>
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Login Admin</h2>
                <input
                  type="text"
                  placeholder="Codice Admin"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={handleAdminLogin}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mb-3 font-medium"
                >
                  Accedi
                </button>
                <button
                  onClick={() => setMode("select")}
                  className="w-full py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Indietro
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (auth.userType === "user") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/logopng.png" alt="Casa Vacanza" className="h-10 w-10" />
              <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Casa Vacanza</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => (window.location.href = "/messaggi")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Messaggi
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="relative w-full h-96 overflow-hidden rounded-xl shadow-2xl mb-8 bg-gray-200">
            <img src={photos[currentPhotoIndex]} alt={`Casa ${currentPhotoIndex + 1}`} className="w-full h-full object-cover" />
            <button
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 text-gray-800 px-3 py-2 rounded-full hover:bg-opacity-100 transition-all shadow-lg"
            >
              ‹
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 text-gray-800 px-3 py-2 rounded-full hover:bg-opacity-100 transition-all shadow-lg"
            >
              ›
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {photos.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${index === currentPhotoIndex ? "bg-white" : "bg-white bg-opacity-50"}`}
                ></div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Posizione</h2>
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
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Azioni</h2>
              <div className="space-y-4">
                <button
                  onClick={() => window.location.href = '/servizi'}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  I Nostri Servizi
                </button>
                <button
                  onClick={() => window.location.href = '/pernottare'}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Prenotta il tuo Soggiorno
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/logopng.png" alt="Casa Vacanza" className="h-10 w-10" />
              <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">Casa Vacanza - Admin</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => (window.location.href = "/messaggi")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Messaggi
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Carica Foto della Casa</h2>
            <input
              type="text"
              placeholder="URL immagine"
              value={newPhoto}
              onChange={(e) => setNewPhoto(e.target.value)}
              className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={handleAddPhoto}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Aggiungi Foto
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Gestione Servizi</h2>
              <button
                onClick={() => window.location.href = '/servizi'}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Vai ai Servizi
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Prenotazioni</h2>
              <button
                onClick={() => window.location.href = '/prenotazioni'}
                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Visualizza Prenotazioni
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
