import React from 'react';
import type { UserRole } from '../types';
import { UsersIcon } from '../components/icons/UsersIcon';
import { UserIcon } from '../components/icons/UserIcon';
import { LeafIcon } from '../components/icons/LeafIcon';

interface RoleSelectionPageProps {
    onSelectRole: (role: UserRole) => void;
}

const RoleCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    onClick: () => void;
}> = ({ icon, title, onClick }) => (
    <button
        onClick={onClick}
        className="w-full p-6 bg-white rounded-2xl shadow-lg text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
    >
        <div className="w-16 h-16 mx-auto bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-4">
            {icon}
        </div>
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
    </button>
);


const RoleSelectionPage: React.FC<RoleSelectionPageProps> = ({ onSelectRole }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm mx-auto text-center">
                <div className="inline-block bg-green-500 p-3 rounded-full mb-2">
                    <LeafIcon className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-800">A-Cosmetic</h1>
                <p className="text-gray-600 mb-10">Gestion de Stock</p>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-700">Sélectionnez votre espace</h2>
                    <div className="space-y-4">
                        <RoleCard 
                            icon={<UsersIcon className="w-8 h-8"/>} 
                            title="Administrateur" 
                            onClick={() => onSelectRole('admin')} 
                        />
                        <RoleCard 
                            icon={<UserIcon className="w-8 h-8" />} 
                            title="Manager" 
                            onClick={() => onSelectRole('manager')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionPage;