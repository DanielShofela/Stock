import React from 'react';
import DashboardCard from '../components/DashboardCard';
import { AlertIcon } from '../components/icons/AlertIcon';
import { MoveIcon } from '../components/icons/MoveIcon';
import type { StockMovement, Product, Profile } from '../types';

interface DashboardPageProps {
    products: Product[];
    stockMovements: StockMovement[];
    profile: Profile | null;
}

const Header: React.FC<{ profile: Profile | null }> = ({ profile }) => {
    const roleName = profile?.role === 'admin' ? 'Admin' : 'Manager';
    return (
        <div className="p-4 bg-white shadow-sm sticky top-0 z-10 md:rounded-t-xl md:p-6">
            <h1 className="text-2xl font-bold text-gray-800">
                Tableau de bord
            </h1>
            <p className="text-sm text-gray-500">
                Bienvenue dans votre espace <span className="font-semibold text-teal-600 capitalize">{roleName}</span>
            </p>
        </div>
    );
};


const DashboardPage: React.FC<DashboardPageProps> = ({ products, stockMovements, profile }) => {
    const criticalStockItems = products.filter(p => 
        p.variants.some(v => 
            v.stock_levels.some(sl => sl.quantity <= sl.safety_stock)
        )
    );

    const MovementItem: React.FC<{ movement: StockMovement }> = ({ movement }) => (
        <div className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-b-0">
            <div>
                <p className="text-sm font-semibold text-gray-800">{movement.productName}</p>
                <p className="text-xs text-gray-500">{movement.variantName} - {movement.sku}</p>
                {movement.userEmail && <p className="text-xs text-gray-400">par {movement.userEmail}</p>}
            </div>
            <div className={`text-sm font-bold ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
            </div>
        </div>
    );

    const CriticalStockItem: React.FC<{product: Product}> = ({ product }) => (
        <div className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-b-0">
             <div>
                <p className="text-sm font-semibold text-gray-800">{product.name}</p>
                <p className="text-xs text-gray-500">{product.sku}</p>
            </div>
             <div className="text-sm font-bold text-red-600">
                {product.variants.flatMap(v => v.stock_levels).reduce((sum, sl) => sum + sl.quantity, 0)} unités
            </div>
        </div>
    )

  return (
    <div id="dashboard-page" className="md:p-6">
        <div className="md:max-w-4xl md:mx-auto">
            <Header profile={profile} />
            <div className="p-4 space-y-4 md:bg-white md:p-6 md:shadow-sm md:rounded-b-xl">
                <DashboardCard
                    title="Stocks Critiques"
                    value={criticalStockItems.length.toString()}
                    icon={<AlertIcon className="w-6 h-6" />}
                    color="red"
                >
                    {criticalStockItems.length > 0 ?
                        criticalStockItems.slice(0, 3).map(item => <CriticalStockItem key={item.id} product={item} />) :
                        <p className="text-sm text-gray-500 text-center py-4">Félicitations, aucun produit en stock critique !</p>
                    }
                </DashboardCard>

                <DashboardCard
                    title="Mouvements Récents"
                    icon={<MoveIcon className="w-6 h-6" />}
                    color="teal"
                >
                    {stockMovements.length > 0 ?
                        stockMovements.map(movement => <MovementItem key={movement.id} movement={movement} />) :
                        <p className="text-sm text-gray-500 text-center py-4">Aucun mouvement de stock récent à afficher.</p>
                    }
                </DashboardCard>
            </div>
        </div>
    </div>
  );
};

export default DashboardPage;
