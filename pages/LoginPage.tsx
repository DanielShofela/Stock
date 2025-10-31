import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LeafIcon } from '../components/icons/LeafIcon';
import { BackIcon } from '../components/icons/BackIcon';
import type { UserRole } from '../types';

interface LoginPageProps {
    selectedRole: UserRole;
    onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ selectedRole, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearFormState = () => {
    setError(null);
    setSuccessMessage(null);
    setEmail('');
    setPassword('');
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
            data: {
                role: selectedRole // Pass role as metadata during signup
            }
        }
    });
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
  
  const handlePasswordResetRequest = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccessMessage('Un lien de réinitialisation a été envoyé à votre adresse e-mail.');
    }
    setLoading(false);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isForgotPasswordMode) {
      handlePasswordResetRequest();
    } else if (isRegisterMode) {
      handleRegister();
    } else {
      handleLoginSubmit();
    }
  };

  const getTitle = () => {
    if (isForgotPasswordMode) return 'Réinitialiser le mot de passe';
    if (isRegisterMode) return 'Créer un compte';
    return 'Se connecter';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block bg-[#28a745] p-3 rounded-full mb-2">
            <LeafIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">A-Cosmetic</h1>
          <p className="text-gray-600">Gestion de Stock</p>
        </div>

        <div className="relative bg-white shadow-xl rounded-2xl">
           <button onClick={onBack} className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100" aria-label="Retour à la sélection du rôle">
              <BackIcon className="w-6 h-6" />
           </button>
          <form onSubmit={handleSubmit} className="p-6 md:p-8 pt-12 space-y-6">
            <h2 className="text-xl font-bold text-center text-gray-700 capitalize">
                {getTitle()}
                {!isForgotPasswordMode && (
                    <span className="block text-sm font-normal text-gray-500 mt-1">
                        Espace {selectedRole}
                    </span>
                )}
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
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
                />
            </div>
            {!isForgotPasswordMode && (
              <div>
                  <div className="flex justify-between items-center mb-2">
                      <label htmlFor="password"className="block text-sm font-semibold text-gray-600">
                      Mot de passe
                      </label>
                      {!isRegisterMode && (
                        <button type="button" onClick={() => { setIsForgotPasswordMode(true); clearFormState(); }} className="text-xs text-blue-600 hover:underline">
                          Mot de passe oublié ?
                        </button>
                      )}
                  </div>
                  <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                  />
              </div>
            )}
            
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/40 disabled:bg-gray-400 disabled:shadow-none disabled:from-gray-400"
            >
                {loading ? 'Chargement...' : (isForgotPasswordMode ? 'Envoyer le lien' : (isRegisterMode ? 'Créer le compte' : 'Se connecter'))}
            </button>
            <div className="text-center">
                {isForgotPasswordMode ? (
                   <button type="button" onClick={() => { setIsForgotPasswordMode(false); clearFormState(); }} className="text-sm text-blue-600 hover:underline">
                      Retour à la connexion
                    </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                        setIsRegisterMode(!isRegisterMode);
                        clearFormState();
                    }}
                    className="text-sm text-blue-600 hover:underline"
                  >
                  {isRegisterMode ? 'Vous avez déjà un compte ? Connectez-vous' : "Pas de compte ? Créez-en un"}
                  </button>
                )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;