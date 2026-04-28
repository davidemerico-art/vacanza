"use client";

import { useState, useEffect } from "react";

interface Prenotazione {
  id: number;
  date: string;
  user: string;
  tipo: 'intera' | 'mezza';
}

export default function Prenotazioni() {
  const [userType] = useState<'user' | 'admin' | null>(() => {
    if (typeof window === 'undefined') return null;
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    const type = localStorage.getItem('userType') as 'user' | 'admin' | null;
    return loggedIn && type === 'admin' ? type : null;
  });
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>(() => {
    return [];
  });
  const [costoNotte, setCostoNotte] = useState(() => {
    if (typeof window === 'undefined') return 100;
    return 100;
  });

  useEffect(() => {
    if (!userType) {
      window.location.href = '/';
      return;
    }
    const loadPrenotazioni = async () => {
      const res = await fetch('/api/bookings');
      if (!res.ok) return;
      const data = await res.json();
      setPrenotazioni(data);
    };
    loadPrenotazioni();
  }, [userType]);

  const handleCostoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCosto = parseInt(e.target.value);
    setCostoNotte(newCosto);
  };

  const handleDeletePrenotazione = async (id: number) => {
    await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    const res = await fetch('/api/bookings');
    if (!res.ok) return;
    const data = await res.json();
    setPrenotazioni(data);
  };

  if (!userType) return <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:bg-gray-900 flex items-center justify-center"><div className="text-xl">Caricamento...</div></div>;

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
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => (window.location.href = "/messaggi")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Messaggi
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-center mb-8 text-gray-800 dark:text-gray-200">
          Gestione Prenotazioni
        </h1>

        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Costo per Notte (€)</label>
          <input
            type="number"
            value={costoNotte}
            onChange={handleCostoChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Tutte le Prenotazioni</h2>
          {prenotazioni.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">Nessuna prenotazione.</p>
          ) : (
            <ul className="space-y-2">
              {prenotazioni.map((p) => (
                <li key={p.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{p.date}</span> - {p.user} ({p.tipo})
                  </div>
                  <button
                    onClick={() => handleDeletePrenotazione(p.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Elimina
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}