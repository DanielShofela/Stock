import React from 'react';
import type { Order } from '../types';
import type { Page } from '../App';
import { FileTextIcon } from '../components/icons/FileTextIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import OrderCard from '../components/OrderCard';

interface OrdersPageProps {
    orders: Order[];
    onNavigate: (page: Page) => void;
}

const OrdersPage: React.FC<OrdersPageProps> = ({ orders, onNavigate }) => {
    return (
        <div className="p-4 bg-slate-100 min-h-screen md:p-6">
            <div className="md:max-w-4xl md:mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-gray-800">Commandes</h1>
                    <button
                        onClick={() => onNavigate('add-order')}
                        className="flex items-center gap-2 bg-teal-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-opacity-90 transition-all duration-300 shadow-lg shadow-teal-600/30 text-sm"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Nouvelle Commande</span>
                    </button>
                </div>
                
                {orders.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 bg-white rounded-2xl shadow-sm">
                        <FileTextIcon className="w-16 h-16 mx-auto text-gray-300" />
                        <h2 className="mt-4 text-lg font-semibold text-gray-700">Aucune commande pour le moment.</h2>
                        <p className="mt-1 text-sm">Créez votre première commande en cliquant sur "Nouvelle Commande".</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map(order => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;