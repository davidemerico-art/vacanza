"use client";

import { useState, useEffect } from "react";

interface Prenotazione {
  id: number;
  date: string;
  user: string;
  tipo: 'intera' | 'mezza';
}

export default function Pernottare() {
  const [userType] = useState<'user' | 'admin' | null>(() => {
    if (typeof window === 'undefined') return null;
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    const type = localStorage.getItem('userType') as 'user' | 'admin' | null;
    return loggedIn && type === 'user' ? type : null;
  });
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [tipoPensione, setTipoPensione] = useState<'intera' | 'mezza'>('intera');
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([]);
  const [userName] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('userName') || '';
  });
  const [userEmail] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('userEmail') || '';
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

  const isDateBooked = (date: string) => {
    return prenotazioni.some(p => p.date === date);
  };

  const handlePrenota = async () => {
    if (checkIn && checkOut && userName) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const dates = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split('T')[0]);
      }
      const conflict = dates.some(date => isDateBooked(date));
      if (conflict) {
        alert('Alcune date sono già prenotate.');
        return;
      }
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          userName,
          checkIn,
          checkOut,
          tipo: tipoPensione
        })
      });
      const result = await response.json();
      if (!response.ok) {
        alert(result.message || 'Errore durante la prenotazione.');
        return;
      }
      const listResponse = await fetch('/api/bookings');
      if (listResponse.ok) {
        setPrenotazioni(await listResponse.json());
      }
      alert('Prenotazione effettuata!');
      setCheckIn('');
      setCheckOut('');
    } else {
      alert('Seleziona le date.');
    }
  };

  if (!userType) return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gray-900 flex items-center justify-center"><div className="text-xl">Caricamento...</div></div>;

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
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
          Prenota il tuo Soggiorno
        </h1>

        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Check-in</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Check-out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tipo di Pensione</label>
            <select
              value={tipoPensione}
              onChange={(e) => setTipoPensione(e.target.value as 'intera' | 'mezza')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="intera">Pensione Intera</option>
              <option value="mezza">Mezza Pensione</option>
            </select>
          </div>
          <button
            onClick={handlePrenota}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Prenota
          </button>
        </div>
      </main>
    </div>
  );
}