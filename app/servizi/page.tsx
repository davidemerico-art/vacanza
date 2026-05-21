"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/useTranslation";

interface Servizio {
  id: number;
  nome: string;
  descrizione: string;
  nomeEn: string;
  descrizioneEn: string;
  immagine: string;
  incluso: boolean;
}

export default function Servizi() {
  const { t, locale } = useTranslation();
  const [servizi, setServizi] = useState<Servizio[]>([]);
  const [userType, setUserType] = useState<'user' | 'admin' | null>(null);
  const [mounted, setMounted] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [newServizio, setNewServizio] = useState({
    nome: '',
    descrizione: '',
    nomeEn: '',
    descrizioneEn: '',
    immagine: '',
    incluso: true
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    const storedType = localStorage.getItem('userType') as 'user' | 'admin' | null;
    setUserType(loggedIn ? storedType : null);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!userType) {
      window.location.href = '/';
      return;
    }
    const loadServizi = async () => {
      const res = await fetch('/api/services');
      if (!res.ok) return;
      const data = await res.json();
      setServizi(data);
    };
    loadServizi();
  }, [mounted, userType]);

  const handleSaveServizio = async () => {
    if (!newServizio.nome || !newServizio.descrizione || !newServizio.immagine) {
      return;
    }

    const method = editingServiceId ? 'PUT' : 'POST';
    const url = editingServiceId ? `/api/services/${editingServiceId}` : '/api/services';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: newServizio.nome,
        descrizione: newServizio.descrizione,
        nomeEn: newServizio.nomeEn,
        descrizioneEn: newServizio.descrizioneEn,
        immagine: newServizio.immagine,
        incluso: newServizio.incluso,
      }),
    });
    if (!res.ok) return;

    const listRes = await fetch('/api/services');
    if (listRes.ok) {
      setServizi(await listRes.json());
    }

    setEditingServiceId(null);
    setNewServizio({ nome: '', descrizione: '', nomeEn: '', descrizioneEn: '', immagine: '', incluso: true });
  };

  const handleDeleteServizio = async (id: number) => {
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    const res = await fetch('/api/services');
    if (!res.ok) return;
    const data = await res.json();
    setServizi(data);
  };

  const startEditServizio = (servizio: Servizio) => {
    setEditingServiceId(servizio.id);
    setNewServizio({
      nome: servizio.nome,
      descrizione: servizio.descrizione,
      nomeEn: servizio.nomeEn,
      descrizioneEn: servizio.descrizioneEn,
      immagine: servizio.immagine,
      incluso: servizio.incluso,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!mounted) return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gray-900 flex items-center justify-center"><div className="text-xl">{t("common.loading")}</div></div>;
  if (!userType) return null;

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
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t("pernottare.home")}
            </button>
            <button
              onClick={() => (window.location.href = "/messaggi")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {t("pernottare.messages")}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-center mb-8 text-gray-800 dark:text-gray-200">
          {t("servizi.services")}
        </h1>

        {userType === 'admin' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8 max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{editingServiceId ? t("servizi.editService") : t("servizi.addService")}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Italiano</label>
                <input
                  type="text"
                  placeholder={t("servizi.serviceName")}
                  value={newServizio.nome}
                  onChange={(e) => setNewServizio({ ...newServizio, nome: e.target.value })}
                  className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                  placeholder={t("servizi.description")}
                  value={newServizio.descrizione}
                  onChange={(e) => setNewServizio({ ...newServizio, descrizione: e.target.value })}
                  className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">English</label>
                <input
                  type="text"
                  placeholder={t("servizi.serviceNameEn")}
                  value={newServizio.nomeEn}
                  onChange={(e) => setNewServizio({ ...newServizio, nomeEn: e.target.value })}
                  className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                  placeholder={t("servizi.descriptionEn")}
                  value={newServizio.descrizioneEn}
                  onChange={(e) => setNewServizio({ ...newServizio, descrizioneEn: e.target.value })}
                  className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <input
              type="text"
              placeholder={t("servizi.imageUrl")}
              value={newServizio.immagine}
              onChange={(e) => setNewServizio({ ...newServizio, immagine: e.target.value })}
              className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <label className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={newServizio.incluso}
                onChange={(e) => setNewServizio({ ...newServizio, incluso: e.target.checked })}
                className="mr-2"
              />
              {t("servizi.includedPrice")}
            </label>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSaveServizio}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                {editingServiceId ? t("servizi.update") : t("servizi.add")}
              </button>
              {editingServiceId && (
                <button
                  onClick={() => {
                    setEditingServiceId(null);
                    setNewServizio({ nome: '', descrizione: '', nomeEn: '', descrizioneEn: '', immagine: '', incluso: true });
                  }}
                  className="w-full py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  {t("common.cancel")}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servizi.map((servizio) => (
            <div key={servizio.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <img src={servizio.immagine} alt={servizio.nome} className="max-w-full max-h-full object-contain" loading="lazy" decoding="async" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{locale === 'en' ? servizio.nomeEn || servizio.nome : servizio.nome}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">{locale === 'en' ? servizio.descrizioneEn || servizio.descrizione : servizio.descrizione}</p>
              <p className={`text-sm font-medium ${servizio.incluso ? 'text-green-600' : 'text-red-600'}`}>
                {servizio.incluso ? t("servizi.included") : t("servizi.payable")}
              </p>
              {userType === 'admin' && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => startEditServizio(servizio)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title={t("common.edit")}
                  >
                    {t("common.edit")}
                  </button>
                  <button
                    onClick={() => handleDeleteServizio(servizio.id)}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title={t("servizi.delete")}
                  >
                    {t("servizi.delete")}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}