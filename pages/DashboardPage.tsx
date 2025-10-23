import React from 'react';
import DashboardCard from '../components/DashboardCard';
import { AlertIcon } from '../components/icons/AlertIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import { MoveIcon } from '../components/icons/MoveIcon';
import type { StockMovement, OverduePayment, Product } from '../types';

interface DashboardPageProps {
    products: Product[];
    stockMovements: StockMovement[];
    overduePayments: OverduePayment[];
}

const Header = () => (
    <div className="p-4 bg-white shadow-sm sticky top-0 z-10 md:rounded-t-2xl">
        <h1 className="text-xl font-bold text-gray-800">Tableau de bord</h1>
    </div>
);


const DashboardPage: React.FC<DashboardPageProps> = ({ products, stockMovements, overduePayments }) => {
    const criticalStockItems = products.filter(p => 
        p.variants.some(v => 
            v.stock_levels.some(sl => sl.quantity <= sl.safety_stock)
        )
    );

    const MovementItem: React.FC<{ movement: StockMovement }> = ({ movement }) => (
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
            <div>
                <p className="text-sm font-semibold text-gray-700">{movement.productName}</p>
                <p className="text-xs text-gray-500">{movement.sku}</p>
            </div>
            <div className={`text-sm font-bold ${movement.quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
            </div>
        </div>
    );

    const OverduePaymentItem: React.FC<{ payment: OverduePayment }> = ({ payment }) => (
         <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
            <div>
                <p className="text-sm font-semibold text-gray-700">{payment.customerName}</p>
                <p className="text-xs text-gray-500">{payment.orderId} - {payment.dueDate}</p>
            </div>
            <div className="text-sm font-bold text-orange-500">
                {payment.amount.toFixed(2)}€
            </div>
        </div>
    );

    const CriticalStockItem: React.FC<{product: Product}> = ({ product }) => (
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
             <div>
                <p className="text-sm font-semibold text-gray-700">{product.name}</p>
                <p className="text-xs text-gray-500">{product.sku}</p>
            </div>
             <div className="text-sm font-bold text-red-500">
                {product.variants.flatMap(v => v.stock_levels).reduce((sum, sl) => sum + sl.quantity, 0)} unités
            </div>
        </div>
    )

  return (
    <div id="dashboard-page" className="md:p-6">
        <div className="md:max-w-4xl md:mx-auto">
            <Header/>
            <div className="p-4 space-y-4 md:bg-white md:p-6 md:shadow-sm md:rounded-b-2xl">
                <DashboardCard
                    title="Stocks Critiques"
                    value={criticalStockItems.length.toString()}
                    icon={<AlertIcon className="w-6 h-6" />}
                    color="red"
                >
                    {criticalStockItems.length > 0 ?
                        criticalStockItems.slice(0, 3).map(item => <CriticalStockItem key={item.id} product={item} />) :
                        <p className="text-sm text-gray-500 text-center py-2">Aucun produit en stock critique.</p>
                    }
                </DashboardCard>

                <DashboardCard
                    title="Paiements en Retard"
                    value={overduePayments.length.toString()}
                    icon={<ClockIcon className="w-6 h-6" />}
                    color="orange"
                >
                {overduePayments.length > 0 ?
                    overduePayments.slice(0, 3).map(payment => <OverduePaymentItem key={payment.id} payment={payment} />) :
                    <p className="text-sm text-gray-500 text-center py-2">Aucun paiement en retard.</p>
                }
                </DashboardCard>

                <DashboardCard
                    title="Mouvements Récents"
                    icon={<MoveIcon className="w-6 h-6" />}
                    color="blue"
                >
                    {stockMovements.length > 0 ?
                        stockMovements.map(movement => <MovementItem key={movement.id} movement={movement} />) :
                        <p className="text-sm text-gray-500 text-center py-2">Aucun mouvement récent.</p>
                    }
                </DashboardCard>
            </div>
        </div>
    </div>
  );
};

export default DashboardPage;
