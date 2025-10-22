import React from 'react';
import { FileTextIcon } from '../components/icons/FileTextIcon';

const OrdersPage: React.FC = () => {
    return (
        <div className="p-4 bg-[#F5F5F5] min-h-screen">
            <h1 className="text-xl font-bold text-gray-800 mb-4">Commandes</h1>
            <div className="text-center py-20 text-gray-500 bg-white rounded-2xl shadow-sm">
                <FileTextIcon className="w-16 h-16 mx-auto text-gray-300" />
                <h2 className="mt-4 text-lg font-semibold text-gray-700">La gestion des commandes arrive bientôt.</h2>
                <p className="mt-1 text-sm">Vous pourrez bientôt créer et suivre les commandes de vos clients ici.</p>
            </div>
        </div>
    );
};

export default OrdersPage;
