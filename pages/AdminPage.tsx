import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Profile, UserRole } from '../types';
import { UsersIcon } from '../components/icons/UsersIcon';
import { PlusIcon } from '../components/icons/PlusIcon';

// --- IMPORTANT SUPABASE SETUP ---
// To make this page work, you need to set up a 'profiles' table and a trigger in Supabase.
//
// 1. CREATE THE `profiles` TABLE:
//    Go to Supabase Dashboard > Table Editor > New Table and use this SQL:
/*
   CREATE TABLE public.profiles (
      id uuid NOT NULL,
      email text NULL,
      role text NULL DEFAULT 'manager'::text,
      CONSTRAINT profiles_pkey PRIMARY KEY (id),
      CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
   );
*/
//
// 2. ENABLE ROW LEVEL SECURITY (RLS) on the `profiles` table.
//
// 3. CREATE RLS POLICIES:
//    Go to Authentication > Policies and create these for the `profiles` table:
//
//    A) Policy for users to read their own profile:
//       - Policy Name: "Enable read access for users to their own profile"
//       - Allowed operation: SELECT
//       - USING expression: `auth.uid() = id`
//
//    B) Policy for admins to view all profiles:
//       - Policy Name: "Enable read access for admins to all profiles"
//       - Allowed operation: SELECT
//       - USING expression: `(SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::text`
//
//    C) Policy for admins to update profiles:
//       - Policy Name: "Enable update access for admins"
//       - Allowed operation: UPDATE
//       - USING expression: `(SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::text`
//
// 4. CREATE A TRIGGER to automatically create a profile for new users:
//    Go to Database > Triggers > New Trigger and use this SQL for the function:
/*
   -- Function to create a profile for a new user.
   create function public.handle_new_user()
   returns trigger
   language plpgsql
   security definer set search_path = public
   as $$
   begin
     insert into public.profiles (id, email, role)
     values (new.id, new.email, coalesce(new.raw_user_meta_data->>'role', 'manager')::text);
     return new;
   end;
   $$;

   -- Trigger to run the function when a new user signs up.
   create trigger on_auth_user_created
     after insert on auth.users
     for each row execute procedure public.handle_new_user();
*/
//
// 5. SET YOUR FIRST ADMIN:
//    After setting up the above, sign up for an account, go to the `profiles` table in the
//    Table Editor, find your user, and manually change the `role` from 'manager' to 'admin'.

const AdminPage: React.FC = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<UserRole>('manager');
    const [inviting, setInviting] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) {
            setError('Erreur lors de la récupération des utilisateurs.');
            console.error(error);
        } else {
            setUsers(data as Profile[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        const oldUsers = [...users];
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));

        const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
        
        if (error) {
            setError("Impossible de mettre à jour le rôle.");
            setUsers(oldUsers); // Revert on error
        } else {
            setSuccess(`Le rôle de ${users.find(u=>u.id===userId)?.email} a été mis à jour.`);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;

        setInviting(true);
        setError('');
        setSuccess('');

        const { error } = await supabase.auth.inviteUserByEmail(inviteEmail, {
            data: { role: inviteRole }
        });

        if (error) {
            setError(`Erreur de création: ${error.message}`);
        } else {
            setSuccess(`Utilisateur ${inviteEmail} créé. Une invitation pour définir le mot de passe a été envoyée.`);
            setInviteEmail('');
        }
        setInviting(false);
    };
    
    const inputStyle = "w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <div className="p-4 md:p-6 min-h-screen">
            <div className="md:max-w-4xl md:mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Panneau d'administration</h1>
                
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4" role="alert">{error}</div>}
                {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4" role="alert">{success}</div>}

                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200/80">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><PlusIcon className="w-5 h-5" />Créer un nouvel utilisateur</h2>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                         <div className="md:flex gap-4 space-y-4 md:space-y-0">
                            <div className="flex-1">
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-600 mb-1">Adresse e-mail</label>
                                <input type="email" id="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className={inputStyle} required placeholder="nom@exemple.com" />
                            </div>
                            <div className="flex-1 md:flex-none md:w-48">
                                <label htmlFor="role" className="block text-sm font-semibold text-gray-600 mb-1">Rôle</label>
                                <select id="role" value={inviteRole} onChange={e => setInviteRole(e.target.value as UserRole)} className={`${inputStyle} bg-white`}>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                        <div>
                             <button type="submit" disabled={inviting} className="w-full md:w-auto bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700 disabled:bg-gray-400">
                                {inviting ? 'Création en cours...' : "Créer l'utilisateur et envoyer l'invitation"}
                            </button>
                        </div>
                    </form>
                    <p className="text-xs text-gray-500 mt-3">
                        Pour des raisons de sécurité, un e-mail est envoyé au nouvel utilisateur pour qu'il puisse définir son propre mot de passe et finaliser la création de son compte.
                    </p>
                </div>


                <div className="bg-white rounded-xl shadow-sm border border-gray-200/80">
                    <div className="p-6">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><UsersIcon className="w-5 h-5" />Utilisateurs enregistrés</h2>
                    </div>
                     {loading ? <p className="p-6 text-center text-gray-500">Chargement des utilisateurs...</p> : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Rôle</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <select 
                                                value={user.role} 
                                                onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                                className="w-full max-w-xs p-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="manager">Manager</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;