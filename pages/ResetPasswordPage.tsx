import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LeafIcon } from '../components/icons/LeafIcon';

interface ResetPasswordPageProps {
  onSuccess: () => void;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccessMessage('Votre mot de passe a été mis à jour avec succès ! Vous allez être redirigé.');
      setTimeout(() => {
        onSuccess();
      }, 3000);
    }
    setLoading(false);
  };

  const inputStyle = "w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block bg-teal-600 p-3 rounded-full mb-2">
            <LeafIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">A-Cosmetic</h1>
          <p className="text-gray-600">Gestion de Stock</p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8">
          <form onSubmit={handlePasswordReset} className="space-y-6">
            <h2 className="text-xl font-bold text-center text-gray-700">
                Définir un nouveau mot de passe
            </h2>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">{error}</div>}
            {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative" role="alert">{successMessage}</div>}

            {!successMessage && (
                <>
                    <div>
                        <label htmlFor="password"className="block text-sm font-semibold text-gray-600 mb-2">
                            Nouveau mot de passe
                        </label>
                        <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={inputStyle}
                        required
                        disabled={loading}
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword"className="block text-sm font-semibold text-gray-600 mb-2">
                            Confirmer le mot de passe
                        </label>
                        <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={inputStyle}
                        required
                        disabled={loading}
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold py-3 px-4 rounded-xl hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-lg shadow-teal-500/40 disabled:bg-gray-400 disabled:shadow-none disabled:from-gray-400"
                    >
                        {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                    </button>
                </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;