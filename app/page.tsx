import { useState, useEffect } from "react";

export default function Home() {
  const [mode, setMode] = useState<'select' | 'user-login' | 'user-register' | 'admin-login'>('select');
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '' });
  const [adminCode, setAdminCode] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [userType, setUserType] = useState<'user' | 'admin' | null>(null);
  const [photos, setPhotos] = useState<string[]>([
    'https://via.placeholder.com/800x400?text=Casa+Vacanza+1',
    'https://via.placeholder.com/800x400?text=Casa+Vacanza+2',
    'https://via.placeholder.com/800x400?text=Casa+Vacanza+3'
  ]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  useEffect(() => {
    const logged = localStorage.getItem('loggedIn') === 'true';
    const type = localStorage.getItem('userType') as 'user' | 'admin' | null;
    if (logged) {
      setLoggedIn(true);
      setUserType(type);
    }
    const savedPhotos = JSON.parse(localStorage.getItem('photos') || '[]');
    if (savedPhotos.length > 0) setPhotos(savedPhotos);
  }, []);

  const handleUserRegister = () => {
    if (userForm.name && userForm.email && userForm.password) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      users.push(userForm);
      localStorage.setItem('users', JSON.stringify(users));
      alert('Registrazione completata! Ora puoi accedere.');
      setMode('user-login');
      setUserForm({ name: '', email: '', password: '' });
    } else {
      alert('Compila tutti i campi.');
    }
  };

  const handleUserLogin = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === userForm.email && u.password === userForm.password);
    if (user) {
      setLoggedIn(true);
      setUserType('user');
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('userType', 'user');
      localStorage.setItem('userName', user.name);
    } else {
      alert('Credenziali errate.');
    }
  };

  const handleAdminLogin = () => {
    if (adminCode === 'veloda' || adminCode === 'foresta') {
      setLoggedIn(true);
      setUserType('admin');
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('userType', 'admin');
    } else {
      alert('Codice admin errato.');
    }
  };

  const handleAddPhoto = () => {
    if (newPhoto) {
      const updated = [...photos, newPhoto];
      setPhotos(updated);
      localStorage.setItem('photos', JSON.stringify(updated));
      setNewPhoto('');
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUserType(null);
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    setMode('select');
  };

  if (!loggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black font-sans">
        <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg max-w-md w-full">
          {mode === 'select' && (
            <>
              <h1 className="text-2xl font-semibold text-center mb-6 text-black dark:text-zinc-50">
                Accedi a Casa Vacanza
              </h1>
              <div className="space-y-4">
                <button
                  onClick={() => setMode('user-login')}
                  className="w-full py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                >
                  Accedi come Utente
                </button>
                <button
                  onClick={() => setMode('admin-login')}
                  className="w-full py-3 bg-green-500 text-white rounded-full hover:bg-green-600"
                >
                  Accedi come Admin
                </button>
              </div>
            </>
          )}

          {mode === 'user-login' && (
            <>
              <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">Login Utente</h2>
              <input
                type="email"
                placeholder="Email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                className="w-full p-3 mb-3 border rounded"
              />
              <input
                type="password"
                placeholder="Password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                className="w-full p-3 mb-3 border rounded"
              />
              <button
                onClick={handleUserLogin}
                className="w-full py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 mb-3"
              >
                Accedi
              </button>
              <button
                onClick={() => setMode('user-register')}
                className="w-full py-3 bg-gray-500 text-white rounded-full hover:bg-gray-600"
              >
                Registrati
              </button>
              <button
                onClick={() => setMode('select')}
                className="w-full py-3 mt-3 bg-gray-300 text-black rounded-full hover:bg-gray-400"
              >
                Indietro
              </button>
            </>
          )}

          {mode === 'user-register' && (
            <>
              <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">Registrazione Utente</h2>
              <input
                type="text"
                placeholder="Nome"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                className="w-full p-3 mb-3 border rounded"
              />
              <input
                type="email"
                placeholder="Email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                className="w-full p-3 mb-3 border rounded"
              />
              <input
                type="password"
                placeholder="Password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                className="w-full p-3 mb-3 border rounded"
              />
              <button
                onClick={handleUserRegister}
                className="w-full py-3 bg-green-500 text-white rounded-full hover:bg-green-600 mb-3"
              >
                Registrati
              </button>
              <button
                onClick={() => setMode('user-login')}
                className="w-full py-3 bg-gray-300 text-black rounded-full hover:bg-gray-400"
              >
                Torna al Login
              </button>
            </>
          )}

          {mode === 'admin-login' && (
            <>
              <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">Login Admin</h2>
              <input
                type="text"
                placeholder="Codice Admin"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full p-3 mb-3 border rounded"
              />
              <button
                onClick={handleAdminLogin}
                className="w-full py-3 bg-green-500 text-white rounded-full hover:bg-green-600 mb-3"
              >
                Accedi
              </button>
              <button
                onClick={() => setMode('select')}
                className="w-full py-3 bg-gray-300 text-black rounded-full hover:bg-gray-400"
              >
                Indietro
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // User view
  if (userType === 'user') {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        {/* Photo Carousel */}
        <div className="relative w-full h-96 overflow-hidden bg-gray-200">
          <img src={photos[currentPhotoIndex]} alt={`Casa ${currentPhotoIndex + 1}`} className="w-full h-full object-cover" />
          <button
            onClick={prevPhoto}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded"
          >
            ‹
          </button>
          <button
            onClick={nextPhoto}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded"
          >
            ›
          </button>
        </div>

        {/* Map and Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-center p-8">
          <div className="md:w-1/2 p-4">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3083.1234!2d18.1714!3d40.3515!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1344108b8c7c7c7c7%3A0x1234567890abcdef!2zTGVjY2UsIEl0YWxpYQ!5e0!3m2!1sit!2sit!4v1234567890!5m2!1sit!2sit"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="md:w-1/2 flex flex-col items-center space-y-4">
            <button
              onClick={() => window.location.href = '/servizi'}
              className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            >
              I Nostri Servizi
            </button>
            <button
              onClick={() => window.location.href = '/pernottare'}
              className="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600"
            >
              Pernotta
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin view
  if (userType === 'admin') {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
        <h1 className="text-3xl font-semibold text-center mb-8 text-black dark:text-zinc-50">
          Pannello Admin
        </h1>

        {/* Upload Photos */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8 max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">Carica Foto Casa</h2>
          <input
            type="text"
            placeholder="URL immagine"
            value={newPhoto}
            onChange={(e) => setNewPhoto(e.target.value)}
            className="w-full p-3 mb-3 border rounded"
          />
          <button
            onClick={handleAddPhoto}
            className="w-full py-3 bg-green-500 text-white rounded-full hover:bg-green-600"
          >
            Aggiungi Foto
          </button>
        </div>

        {/* Buttons */}
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={() => window.location.href = '/servizi'}
            className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          >
            Gestisci Servizi
          </button>
          <button
            onClick={() => window.location.href = '/prenotazioni'}
            className="px-6 py-3 bg-purple-500 text-white rounded-full hover:bg-purple-600"
          >
            Visualizza Prenotazioni
          </button>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return null;
}
