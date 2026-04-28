import { useState, useEffect } from "react";

interface Servizio {
  id: string;
  nome: string;
  descrizione: string;
  immagine: string;
  incluso: boolean;
}

export default function Servizi() {
  const [servizi, setServizi] = useState<Servizio[]>([]);
  const [userType, setUserType] = useState<'user' | 'admin' | null>(null);
  const [newServizio, setNewServizio] = useState({
    nome: '',
    descrizione: '',
    immagine: '',
    incluso: true
  });

  useEffect(() => {
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    const type = localStorage.getItem('userType') as 'user' | 'admin' | null;
    if (loggedIn) {
      setUserType(type);
    } else {
      window.location.href = '/';
    }
    const savedServizi = JSON.parse(localStorage.getItem('servizi') || '[]');
    setServizi(savedServizi);
  }, []);

  const handleAddServizio = () => {
    if (newServizio.nome && newServizio.descrizione && newServizio.immagine) {
      const servizio: Servizio = {
        id: Date.now().toString(),
        ...newServizio
      };
      const updated = [...servizi, servizio];
      setServizi(updated);
      localStorage.setItem('servizi', JSON.stringify(updated));
      setNewServizio({ nome: '', descrizione: '', immagine: '', incluso: true });
    }
  };

  const handleDeleteServizio = (id: string) => {
    const updated = servizi.filter(s => s.id !== id);
    setServizi(updated);
    localStorage.setItem('servizi', JSON.stringify(updated));
  };

  if (!userType) return <div>Caricamento...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <h1 className="text-3xl font-semibold text-center mb-8 text-black dark:text-zinc-50">
        I Nostri Servizi
      </h1>

      {userType === 'admin' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8 max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">Aggiungi Servizio</h2>
          <input
            type="text"
            placeholder="Nome servizio"
            value={newServizio.nome}
            onChange={(e) => setNewServizio({ ...newServizio, nome: e.target.value })}
            className="w-full p-3 mb-3 border rounded"
          />
          <textarea
            placeholder="Descrizione"
            value={newServizio.descrizione}
            onChange={(e) => setNewServizio({ ...newServizio, descrizione: e.target.value })}
            className="w-full p-3 mb-3 border rounded"
          />
          <input
            type="text"
            placeholder="URL immagine"
            value={newServizio.immagine}
            onChange={(e) => setNewServizio({ ...newServizio, immagine: e.target.value })}
            className="w-full p-3 mb-3 border rounded"
          />
          <label className="flex items-center mb-3">
            <input
              type="checkbox"
              checked={newServizio.incluso}
              onChange={(e) => setNewServizio({ ...newServizio, incluso: e.target.checked })}
              className="mr-2"
            />
            Incluso nel prezzo
          </label>
          <button
            onClick={handleAddServizio}
            className="w-full py-3 bg-green-500 text-white rounded-full hover:bg-green-600"
          >
            Aggiungi
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servizi.map((servizio) => (
          <div key={servizio.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <img src={servizio.immagine} alt={servizio.nome} className="w-full h-48 object-cover rounded mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-black dark:text-zinc-50">{servizio.nome}</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-2">{servizio.descrizione}</p>
            <p className={`text-sm ${servizio.incluso ? 'text-green-500' : 'text-red-500'}`}>
              {servizio.incluso ? 'Incluso' : 'A pagamento'}
            </p>
            {userType === 'admin' && (
              <button
                onClick={() => handleDeleteServizio(servizio.id)}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Elimina
              </button>
            )}
          </div>
        ))}
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