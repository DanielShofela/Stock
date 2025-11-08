// Fix: Recreated the content of LoginPage.tsx to provide a complete and functional login page.
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
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message);
        }
        // onAuthStateChange in App.tsx will handle success
        setLoading(false);
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: selectedRole
                }
            }
        });

        if (error) {
            setError(error.message);
        } else if (data.user && !data.user.email_confirmed_at) {
            setMessage("Veuillez vérifier votre boîte de réception pour confirmer votre inscription.");
        }
        setLoading(false);
    };
    
    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };
    
    const handlePasswordReset = async () => {
        if (!email) {
            setError("Veuillez entrer votre adresse e-mail pour réinitialiser le mot de passe.");
            return;
        }
        setLoading(true);
        setError(null);
        setMessage(null);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
        });
        if (error) {
            setError(error.message);
        } else {
            setMessage("Un lien de réinitialisation de mot de passe a été envoyé à votre e-mail.");
        }
        setLoading(false);
    };


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
                    <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-6">
                        <h2 className="text-xl font-bold text-center text-gray-700">
                            {isSignUp ? "Créer un compte" : "Se connecter"}
                        </h2>

                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">{error}</div>}
                        {message && <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg relative" role="alert">{message}</div>}

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-600 mb-2">
                                Adresse e-mail
                            </label>
                            <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nom@exemple.com"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={loading}
                            />
                        </div>
                        <div className="relative">
                            <label
                            htmlFor="password"
                            className="block text-sm font-semibold text-gray-600 mb-2"
                            >
                            Mot de passe
                            </label>
                            <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={loading}
                            />
                             <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/40 disabled:bg-gray-400 disabled:shadow-none disabled:from-gray-400"
                        >
                            {loading ? (isSignUp ? 'Création...' : 'Connexion...') : (isSignUp ? "S'inscrire" : "Se connecter")}
                        </button>

                        <div className="relative flex items-center">
                            <div className="flex-grow border-t border-gray-300"></div>
                            <span className="flex-shrink mx-4 text-gray-400 text-sm">OU</span>
                            <div className="flex-grow border-t border-gray-300"></div>
                        </div>

                         <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-200"
                        >
                            <GoogleIcon className="w-5 h-5" />
                            Continuer avec Google
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-blue-600 hover:underline font-semibold">
                             {isSignUp ? "Vous avez déjà un compte ? Connectez-vous" : "Pas de compte ? Inscrivez-vous"}
                        </button>
                         <p className="mt-2 text-sm">
                            <button onClick={handlePasswordReset} className="text-gray-500 hover:underline">
                                Mot de passe oublié ?
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
