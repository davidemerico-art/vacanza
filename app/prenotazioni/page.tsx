import { useState, useEffect } from "react";

interface Prenotazione {
  id: string;
  date: string;
  user: string;
  tipo: 'intera' | 'mezza';
}

export default function Prenotazioni() {
  const [userType, setUserType] = useState<'user' | 'admin' | null>(null);
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([]);
  const [costoNotte, setCostoNotte] = useState(100); // default costo

  useEffect(() => {
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    const type = localStorage.getItem('userType') as 'user' | 'admin' | null;
    if (loggedIn && type === 'admin') {
      setUserType(type);
    } else {
      window.location.href = '/';
    }
    const savedPrenotazioni = JSON.parse(localStorage.getItem('prenotazioni') || '[]');
    setPrenotazioni(savedPrenotazioni);
    const savedCosto = localStorage.getItem('costoNotte');
    if (savedCosto) setCostoNotte(parseInt(savedCosto));
  }, []);

  const handleCostoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCosto = parseInt(e.target.value);
    setCostoNotte(newCosto);
    localStorage.setItem('costoNotte', newCosto.toString());
  };

  const handleDeletePrenotazione = (id: string) => {
    const updated = prenotazioni.filter(p => p.id !== id);
    setPrenotazioni(updated);
    localStorage.setItem('prenotazioni', JSON.stringify(updated));
  };

  if (!userType) return <div>Caricamento...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <h1 className="text-3xl font-semibold text-center mb-8 text-black dark:text-zinc-50">
        Gestione Prenotazioni
      </h1>

      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <label className="block text-sm font-medium mb-2">Costo per Notte (€)</label>
        <input
          type="number"
          value={costoNotte}
          onChange={handleCostoChange}
          className="w-full p-3 border rounded"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Tutte le Prenotazioni</h2>
        {prenotazioni.length === 0 ? (
          <p>Nessuna prenotazione.</p>
        ) : (
          <ul className="space-y-2">
            {prenotazioni.map((p) => (
              <li key={p.id} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded">
                <div>
                  <span className="font-medium">{p.date}</span> - {p.user} ({p.tipo})
                </div>
                <button
                  onClick={() => handleDeletePrenotazione(p.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Elimina
                </button>
              </li>
            ))}
          </ul>
        )}
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