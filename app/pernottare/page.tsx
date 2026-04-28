import { useState, useEffect } from "react";

interface Prenotazione {
  id: string;
  date: string;
  user: string;
  tipo: 'intera' | 'mezza';
}

export default function Pernottare() {
  const [userType, setUserType] = useState<'user' | 'admin' | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [tipoPensione, setTipoPensione] = useState<'intera' | 'mezza'>('intera');
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    const type = localStorage.getItem('userType') as 'user' | 'admin' | null;
    if (loggedIn && type === 'user') {
      setUserType(type);
      setUserName(localStorage.getItem('userName') || '');
    } else {
      window.location.href = '/';
    }
    const savedPrenotazioni = JSON.parse(localStorage.getItem('prenotazioni') || '[]');
    setPrenotazioni(savedPrenotazioni);
  }, []);

  const isDateBooked = (date: string) => {
    return prenotazioni.some(p => p.date === date);
  };

  const handlePrenota = () => {
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
      const newPrenotazioni = dates.map(date => ({
        id: Date.now().toString() + date,
        date,
        user: userName,
        tipo: tipoPensione
      }));
      const updated = [...prenotazioni, ...newPrenotazioni];
      setPrenotazioni(updated);
      localStorage.setItem('prenotazioni', JSON.stringify(updated));
      alert('Prenotazione effettuata!');
      setCheckIn('');
      setCheckOut('');
    } else {
      alert('Seleziona le date.');
    }
  };

  if (!userType) return <div>Caricamento...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <h1 className="text-3xl font-semibold text-center mb-8 text-black dark:text-zinc-50">
        Prenota il tuo Soggiorno
      </h1>

      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Check-in</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full p-3 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Check-out</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full p-3 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Tipo di Pensione</label>
          <select
            value={tipoPensione}
            onChange={(e) => setTipoPensione(e.target.value as 'intera' | 'mezza')}
            className="w-full p-3 border rounded"
          >
            <option value="intera">Pensione Intera</option>
            <option value="mezza">Mezza Pensione</option>
          </select>
        </div>
        <button
          onClick={handlePrenota}
          className="w-full py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          Prenota
        </button>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          Torna alla Home
        </button>
      </div>
    </div>
  );
}