import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LeafIcon } from '../components/icons/LeafIcon';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setSuccessMessage('Compte créé ! Veuillez vérifier vos e-mails pour activer votre compte.');
      setIsRegisterMode(false);
    }
    setLoading(false);
  };

  const handleLoginSubmit = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email ou mot de passe incorrect.");
    }
    // onAuthStateChange in App.tsx will handle successful login
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegisterMode) {
      handleRegister();
    } else {
      handleLoginSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block bg-[#009245] p-3 rounded-full mb-2">
            <LeafIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">A-Cosmetic</h1>
          <p className="text-gray-500">Gestion de Stock</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-2xl p-6 md:p-8 space-y-6">
           <h2 className="text-xl font-bold text-center text-gray-700">
            {isRegisterMode ? 'Créer un compte' : 'Se connecter'}
          </h2>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">{error}</div>}
          {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative" role="alert">{successMessage}</div>}

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-600 mb-2">
              Adresse e-mail
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@entreprise.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0076BC]"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-semibold text-gray-600 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0076BC]"
              required
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0076BC] text-white font-bold py-3 px-4 rounded-xl hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0076BC] transition-all duration-300 shadow-lg shadow-[#0076BC]/30 disabled:bg-gray-400 disabled:shadow-none"
          >
            {loading ? 'Chargement...' : (isRegisterMode ? 'Créer le compte' : 'Se connecter')}
          </button>
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setError(null);
                  setSuccessMessage(null);
                  setEmail('');
                  setPassword('');
              }}
              className="text-sm text-[#0076BC] hover:underline"
            >
              {isRegisterMode ? 'Vous avez déjà un compte ? Connectez-vous' : "Pas de compte ? Créez-en un"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
