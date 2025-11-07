
import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { UserIcon } from '../components/icons/UserIcon';
import type { Profile } from '../types';
import type { Page } from '../App';


interface AccountPageProps {
    session: Session | null;
    profile: Profile | null;
    onNavigate: (page: Page) => void;
}


const AccountPage: React.FC<AccountPageProps> = ({ session, profile, onNavigate }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Un e-mail de confirmation vous a été envoyé pour finaliser le changement de votre mot de passe.");
      setNewPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    // The onAuthStateChange listener in App.tsx will handle the rest.
  };

  const inputStyle = "w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500";


  if (!session) {
    return null; // Should be redirected by App.tsx
  }

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <div className="md:max-w-2xl md:mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Mon Compte</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 border border-gray-200/80">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-gray-100 text-gray-600">
              <UserIcon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Connecté en tant que</p>
              <p className="font-semibold text-gray-800">{session.user.email}</p>
            </div>
             {profile?.role && <span className="ml-auto text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full capitalize">{profile.role}</span>}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mt-6 border border-gray-200/80">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Changer de mot de passe</h2>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            {error && <div className="bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">{error}</div>}
            {success && <div className="bg-green-100 border-green-400 text-green-700 px-4 py-3 rounded-lg text-sm" role="alert">{success}</div>}

            <div>
              <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-600 mb-2">Nouveau mot de passe</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className={inputStyle}
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword"className="block text-sm font-semibold text-gray-600 mb-2">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={inputStyle}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/30 disabled:bg-gray-400"
            >
              Mettre à jour
            </button>
          </form>
        </div>

        <div className="mt-6">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/30 disabled:bg-gray-400"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
