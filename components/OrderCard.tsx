import React from 'react';
import type { Order } from '../types';

interface OrderCardProps {
  order: Order;
}

const statusStyles: Record<Order['status'], { text: string, classes: string }> = {
    pending: { text: 'En attente', classes: 'bg-yellow-100 text-yellow-800' },
    completed: { text: 'Complétée', classes: 'bg-green-100 text-green-800' },
    cancelled: { text: 'Annulée', classes: 'bg-red-100 text-red-800' },
};

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
    const status = statusStyles[order.status] || statusStyles.pending;
    
    return (
        <div className="bg-white rounded-2xl shadow-sm p-4 transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-gray-800">{order.customer_name}</h3>
                    <p className="text-xs text-gray-500">
                        Commande du {new Date(order.order_date).toLocaleDateString('fr-FR')}
                    </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.classes}`}>
                    {status.text}
                </span>
            </div>
            <div className="mt-4 flex justify-between items-end">
                <div>
                    <p className="text-xs text-gray-500">Articles</p>
                    <p className="font-semibold text-gray-700">{order.items.length}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 text-right">Total</p>
                    <p className="font-bold text-lg text-teal-600">{order.total_amount} FCFA</p>
                </div>
            </div>
        </div>
    );
};

export default OrderCard;