import React, { useState } from 'react';
import type { Product, StockLevel, ProductVariant, MovementType, Warehouse } from '../types';
import { BackIcon } from '../components/icons/BackIcon';
import StockMovementModal from '../components/StockMovementModal';

interface ProductDetailPageProps {
  product: Product;
  warehouses: Warehouse[];
  onBack: () => void;
  onAddMovement: (movement: { variantId: number, warehouseId: number, quantity: number, type: MovementType, reference: string }) => void;
}

const getStockStatus = (stockLevel: StockLevel) => {
    if (stockLevel.quantity <= 0) {
        return { text: "En rupture de stock", color: "bg-red-100 text-red-800" };
    }
    if (stockLevel.quantity <= stockLevel.safety_stock) {
        return { text: "Stock faible", color: "bg-orange-100 text-orange-800" };
    }
    return { text: "En stock", color: "bg-green-100 text-green-800" };
};

const StatCard: React.FC<{label: string, value: string | number | undefined}> = ({ label, value }) => (
    <div className="bg-gray-50 p-2 rounded-lg text-center">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-md font-bold text-gray-800">{value ?? 'N/A'}</p>
    </div>
);

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, warehouses, onBack, onAddMovement }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVariantForMovement, setSelectedVariantForMovement] = useState<ProductVariant | null>(null);
  const [currentMovementType, setCurrentMovementType] = useState<'in' | 'out'>('in');

  const handleOpenModal = (variant: ProductVariant, type: 'in' | 'out') => {
    setSelectedVariantForMovement(variant);
    setCurrentMovementType(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVariantForMovement(null);
  };

  const handleModalSubmit = (quantity: number, reference: string) => {
    if (!selectedVariantForMovement || warehouses.length === 0) return;

    const finalQuantity = currentMovementType === 'out' ? -quantity : quantity;
    const warehouseId = warehouses[0].id;

    onAddMovement({
        variantId: selectedVariantForMovement.id,
        warehouseId,
        quantity: finalQuantity,
        type: currentMovementType,
        reference
    });
    handleCloseModal();
  };

  const totalStock = product.variants.flatMap(v => v.stock_levels).reduce((sum, sl) => sum + sl.quantity, 0);

  return (
    <>
      <div className="bg-[#F5F5F5] min-h-screen md:p-6">
        <div className="md:max-w-4xl md:mx-auto">
          <header className="bg-white p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm md:rounded-t-2xl">
            <button onClick={onBack} className="text-gray-600 p-2 rounded-full hover:bg-gray-100">
              <BackIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-800">{product.name}</h1>
              <p className="text-sm text-gray-500">{product.sku}</p>
            </div>
          </header>
          
          <div className="p-4 space-y-6 md:bg-white md:p-6 md:shadow-sm md:rounded-b-2xl">
            <div className="bg-white rounded-2xl shadow-sm p-4 h-64 flex items-center justify-center md:bg-gray-100">
                <img src={product.images[0] || 'https://placehold.co/400x400/f5f5f5/cccccc?text=Image'} alt={product.name} className="max-w-full max-h-full object-contain" />
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4">
                <h2 className="text-md font-bold text-gray-800 mb-2">Description</h2>
                <p className="text-sm text-gray-600">{product.description || "Aucune description fournie."}</p>
                <div className="mt-4 flex justify-between items-center text-sm">
                    <span className="text-gray-500">Catégorie: <span className="font-semibold text-gray-700">{product.category || 'N/A'}</span></span>
                    <span className="text-gray-500">Stock Total: <span className="font-bold text-lg text-gray-900">{totalStock}</span></span>
                </div>
            </div>
            
            <div className="space-y-4">
                <h2 className="text-md font-bold text-gray-800 px-1">Variantes & Stocks</h2>
                {product.variants.map(variant => {
                    const stockInfo = variant.stock_levels[0];
                    if (!stockInfo) return null;

                    const status = getStockStatus(stockInfo);

                    return (
                        <div key={variant.id} className="bg-white rounded-2xl shadow-sm p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-[#0076BC]">{variant.variant_name}</h3>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.color}`}>{status.text}</span>
                                </div>
                                <span className="text-lg font-bold">{variant.price} FCFA</span>
                            </div>
                            <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-2">
                                      <StatCard label="Stock Actuel" value={`${stockInfo.quantity} u.`} />
                                      <StatCard label="Seuil Min." value={`${stockInfo.safety_stock} u.`} />
                                      <StatCard label="Stock Initial" value={`${stockInfo.initial_quantity} u.`} />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                      <StatCard label="Total Reçu" value={variant.total_received} />
                                      <StatCard label="Total Expédié" value={variant.total_shipped} />
                                      <StatCard label="Endommagé" value={variant.total_damaged} />
                                </div>
                                {variant.last_received_date && (
                                    <div className="text-center text-xs text-gray-400 pt-1">
                                        Dernière réception le: {new Date(variant.last_received_date).toLocaleDateString('fr-FR')}
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                                <button onClick={() => handleOpenModal(variant, 'in')} className="flex-1 bg-green-100 text-green-800 text-sm font-bold py-2 rounded-lg hover:bg-green-200 transition-colors">
                                    Entrée
                                </button>
                                <button onClick={() => handleOpenModal(variant, 'out')} className="flex-1 bg-orange-100 text-orange-800 text-sm font-bold py-2 rounded-lg hover:bg-orange-200 transition-colors">
                                    Sortie
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
          </div>
        </div>
      </div>
      {selectedVariantForMovement && (
         <StockMovementModal 
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleModalSubmit}
            variantName={selectedVariantForMovement.variant_name}
            movementType={currentMovementType}
         />
      )}
    </>
  );
};

export default ProductDetailPage;