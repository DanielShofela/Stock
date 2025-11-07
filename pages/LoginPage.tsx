
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { UserRole } from '../types';
import { LeafIcon } from '../components/icons/LeafIcon';
import { EyeIcon } from '../components/icons/EyeIcon';
import { EyeSlashIcon } from '../components/icons/EyeSlashIcon';

interface LoginPageProps {
    selectedRole: UserRole;
}

const LoginPage: React.FC<LoginPageProps> = ({ selectedRole }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError('Email ou mot de passe invalide.');
        }
        // On success, the onAuthStateChange listener in App.tsx will handle the redirect.
        setLoading(false);
    };

    const roleName = 'Manager';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-block bg-green-500 p-3 rounded-full mb-2">
                        <LeafIcon className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">A-Cosmetic</h1>
                    <p className="text-gray-600">Gestion de Stock</p>
                </div>
                
                <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 relative">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <h2 className="text-xl font-bold text-center text-gray-700">
                            Connexion <span className="text-blue-600">{roleName}</span>
                        </h2>
                        
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">{error}</div>}

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-600 mb-2">
                                Adresse e-mail
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={loading}
                                placeholder="vous@exemple.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password"className="block text-sm font-semibold text-gray-600 mb-2">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={loading}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/40 disabled:bg-gray-400 disabled:shadow-none disabled:from-gray-400"
                        >
                            {loading ? 'Connexion en cours...' : 'Se connecter'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
