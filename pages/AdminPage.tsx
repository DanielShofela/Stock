import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Profile, UserRole } from '../types';
import { UsersIcon } from '../components/icons/UsersIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import ConfirmationModal from '../components/ConfirmationModal';
import { TrashIcon } from '../components/icons/TrashIcon';

// --- IMPORTANT SUPABASE SETUP ---
// To make this page work, you need to set up a 'profiles' table and a trigger in Supabase.
//
// 1. CREATE THE `profiles` TABLE:
//    Go to Supabase Dashboard > Table Editor > New Table and use this SQL:
/*
   CREATE TABLE public.profiles (
      id uuid NOT NULL,
      email text NOT NULL,
      role text NULL DEFAULT 'manager'::text,
      status text NULL DEFAULT 'active'::text, -- ADD THIS LINE FOR BLOCKING
      CONSTRAINT profiles_pkey PRIMARY KEY (id),
      CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
   );
*/
//
// 2. ENABLE ROW LEVEL SECURITY (RLS) on the `profiles` table.
//
// 3. CREATE RLS POLICIES:
//    Go to Authentication > Policies and create/update these for the `profiles` table:
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
// 5. USER DELETION (SECURITY NOTE):
//    Deleting other users requires admin privileges that should not be exposed on the client-side.
//    This action MUST be handled by a secure Supabase Edge Function.
//
//    Example Edge Function (`supabase/functions/delete-user/index.ts`):
/*
    import { createClient } from '@supabase/supabase-js'
    
    Deno.serve(async (req) => {
      // 1. Check if the user is an admin
      const authHeader = req.headers.get('Authorization')!
      const supabaseClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } })
      const { data: { user } } = await supabaseClient.auth.getUser()
      if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      
      const { data: profile } = await supabaseClient.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })

      // 2. If admin, proceed with deletion
      const { userIdToDelete } = await req.json()
      if (!userIdToDelete) return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 })
      
      const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete)
      
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      
      return new Response(JSON.stringify({ message: 'User deleted successfully' }), { status: 200 })
    })
*/

const AdminPage: React.FC = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<UserRole>('manager');
    const [inviting, setInviting] = useState(false);

    const [modalState, setModalState] = useState<{ type: 'delete' | 'block' | null, user: Profile | null }>({ type: null, user: null });

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
    
    const showSuccess = (message: string) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 4000);
    }

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        const oldUsers = [...users];
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
        if (error) {
            setError("Impossible de mettre à jour le rôle.");
            setUsers(oldUsers);
        } else {
            showSuccess(`Le rôle de ${users.find(u=>u.id===userId)?.email} a été mis à jour.`);
        }
    };

    const handleStatusChange = async (user: Profile) => {
        const newStatus = (user.status ?? 'active') === 'active' ? 'blocked' : 'active';
        const oldUsers = [...users];
        setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        
        const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', user.id);
        
        if (error) {
            setError(`Impossible de changer le statut.`);
            setUsers(oldUsers);
        } else {
            showSuccess(`Le statut de ${user.email} a été mis à jour.`);
        }
        setModalState({ type: null, user: null });
    };
    
    const handleConfirmDelete = async () => {
        if (!modalState.user) return;
        
        try {
            const { error } = await supabase.functions.invoke('delete-user', {
                body: { userIdToDelete: modalState.user.id }
            });

            if (error) throw error;
            
            showSuccess(`L'utilisateur ${modalState.user.email} a été supprimé.`);
            fetchUsers(); // Re-fetch the list
        } catch (err: any) {
            setError(`Erreur de suppression: ${err.message}. Assurez-vous que la fonction Edge est déployée.`);
            console.error(err);
        } finally {
            setModalState({ type: null, user: null });
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
    
    const inputStyle = "w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500";
    
    const closeModal = () => setModalState({ type: null, user: null });

    return (
        <div className="p-4 md:p-6 min-h-screen">
            <div className="md:max-w-4xl md:mx-auto">
                <h1 className="text-2xl font-bold text-gray-800">Gestion des utilisateurs</h1>
                <p className="text-sm text-gray-500 mb-6">Créez, visualisez et gérez les rôles des utilisateurs de l'application.</p>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4" role="alert">{error}</div>}
                {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4" role="alert">{success}</div>}

                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-slate-200">
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
                             <button type="submit" disabled={inviting} className="w-full md:w-auto bg-teal-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-teal-700 disabled:bg-gray-400">
                                {inviting ? 'Création en cours...' : "Créer et inviter l'utilisateur"}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="p-6">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                          <UsersIcon className="w-5 h-5" />
                          <span>Utilisateurs enregistrés ({users.length})</span>
                        </h2>
                    </div>
                     {loading ? <p className="p-6 text-center text-gray-500">Chargement des utilisateurs...</p> : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left">
                                <thead className="bg-slate-50 border-y border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Rôle</th>
                                        <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                                        <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <select 
                                                value={user.role} 
                                                onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                                className="w-full max-w-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            >
                                                <option value="manager">Manager</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${(user.status ?? 'active') === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {(user.status ?? 'active') === 'blocked' ? 'Bloqué' : 'Actif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => setModalState({ type: 'block', user })} className="font-semibold text-teal-600 hover:text-teal-800 mr-4">
                                                {(user.status ?? 'active') === 'blocked' ? 'Débloquer' : 'Bloquer'}
                                            </button>
                                            <button onClick={() => setModalState({ type: 'delete', user })} className="font-semibold text-red-600 hover:text-red-800">
                                                Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                     )}
                </div>
            </div>
            {modalState.user && (
                <ConfirmationModal
                    isOpen={modalState.type !== null}
                    onClose={closeModal}
                    onConfirm={modalState.type === 'delete' ? handleConfirmDelete : () => handleStatusChange(modalState.user!)}
                    title={modalState.type === 'delete' ? 'Supprimer l\'utilisateur' : 'Changer le statut'}
                    message={
                        modalState.type === 'delete'
                        ? `Êtes-vous sûr de vouloir supprimer définitivement ${modalState.user.email} ? Cette action est irréversible.`
                        : `Êtes-vous sûr de vouloir ${(modalState.user.status ?? 'active') === 'active' ? 'bloquer' : 'débloquer'} ${modalState.user.email} ?`
                    }
                />
            )}
        </div>
    );
};

export default AdminPage;