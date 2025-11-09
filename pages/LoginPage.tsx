// Fix: Replaced placeholder text with a functional LoginPage component.
// This component handles user authentication (email/password, Google OAuth)
// and password recovery flow using Supabase, resolving all related errors.
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { UserRole } from '../types';
import { LeafIcon } from '../components/icons/LeafIcon';
import { GoogleIcon } from '../components/icons/GoogleIcon';
import { EyeIcon } from '../components/icons/EyeIcon';
import { EyeSlashIcon } from '../components/icons/EyeSlashIcon';

interface LoginPageProps {
    selectedRole: UserRole;
}

const LoginPage: React.FC<LoginPageProps> = ({ selectedRole }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        }
        // onAuthStateChange in App.tsx will handle successful login
        setLoading(false);
    };
    
    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
                redirectTo: window.location.origin,
            },
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handlePasswordResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setForgotPasswordSuccess(false);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            setError(error.message);
        } else {
            setForgotPasswordSuccess(true);
        }
        setLoading(false);
    };

    const inputStyle = "w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500";

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
                
                <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8">
                    {isForgotPassword ? (
                        <form onSubmit={handlePasswordResetRequest} className="space-y-6">
                             <h2 className="text-xl font-bold text-center text-gray-700">Mot de passe oublié</h2>
                            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">{error}</div>}
                            {forgotPasswordSuccess ? (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg" role="alert">
                                    Si un compte existe pour {email}, un e-mail de réinitialisation a été envoyé.
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm text-center text-gray-600">
                                        Entrez votre e-mail pour recevoir un lien de réinitialisation.
                                    </p>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-gray-600 mb-2">Adresse e-mail</label>
                                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nom@exemple.com" className={inputStyle} required disabled={loading}/>
                                    </div>
                                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/40 disabled:bg-gray-400 disabled:shadow-none disabled:from-gray-400">
                                        {loading ? 'Envoi...' : 'Envoyer le lien'}
                                    </button>
                                </>
                            )}
                            <div className="text-center">
                                <button type="button" onClick={() => setIsForgotPassword(false)} className="text-sm font-semibold text-blue-600 hover:underline">
                                    Retour à la connexion
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <h2 className="text-xl font-bold text-center text-gray-700">
                                Connexion Espace <span className="capitalize">{selectedRole}</span>
                            </h2>
                            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">{error}</div>}

                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-600 mb-2">Adresse e-mail</label>
                                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nom@exemple.com" className={inputStyle} required disabled={loading} />
                            </div>
                            <div>
                                <label htmlFor="password"className="block text-sm font-semibold text-gray-600 mb-2">Mot de passe</label>
                                <div className="relative">
                                    <input type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inputStyle} required disabled={loading}/>
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-4 text-gray-500">
                                        {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="text-right">
                                <button type="button" onClick={() => setIsForgotPassword(true)} className="text-sm font-semibold text-blue-600 hover:underline">
                                    Mot de passe oublié ?
                                </button>
                            </div>
                            
                            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/40 disabled:bg-gray-400 disabled:shadow-none disabled:from-gray-400">
                                {loading ? 'Connexion...' : 'Se connecter'}
                            </button>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="flex-shrink mx-4 text-gray-500 text-sm">OU</span>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>
                            
                            <button type="button" onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-semibold py-3 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-200">
                                <GoogleIcon className="w-6 h-6" />
                                <span>Continuer avec Google</span>
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
