import React, { useState, useEffect } from 'react';
import type { Product, StockLevel, ProductVariant, MovementType, Warehouse } from '../types';
import { supabase } from '../lib/supabaseClient';
import { BackIcon } from '../components/icons/BackIcon';
import { PencilIcon } from '../components/icons/PencilIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import StockMovementModal from '../components/StockMovementModal';
import ConfirmationModal from '../components/ConfirmationModal';

interface ProductDetailPageProps {
  product: Product;
  warehouses: Warehouse[];
  onBack: () => void;
  onAddMovement: (movement: { variantId: number, warehouseId: number, quantity: number, type: MovementType, reference: string }) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;
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
    <div className="bg-slate-50 p-2 rounded-lg text-center">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-md font-bold text-gray-800">{value ?? 'N/A'}</p>
    </div>
);

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, warehouses, onBack, onAddMovement, onEdit, onDelete }) => {
  const [detailedProduct, setDetailedProduct] = useState<Product>(product);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVariantForMovement, setSelectedVariantForMovement] = useState<ProductVariant | null>(null);
  const [currentMovementType, setCurrentMovementType] = useState<'in' | 'out'>('in');

  useEffect(() => {
    const fetchMovementDetails = async () => {
        if (!product) return;
        setDetailsLoading(true);

        const variantIds = product.variants.map(v => v.id);
        if (variantIds.length === 0) {
            setDetailsLoading(false);
            return;
        }

        const { data: movementsData, error } = await supabase
            .from('stock_movements')
            .select('*')
            .in('variant_id', variantIds);

        if (error) {
            console.error("Error fetching movement details", error);
            setDetailsLoading(false);
            return;
        }

        const movementsByVariant = (movementsData || []).reduce((acc, mov) => {
            if (mov.variant_id) {
                if (!acc[mov.variant_id]) acc[mov.variant_id] = [];
                acc[mov.variant_id].push(mov);
            }
            return acc;
        }, {} as Record<number, typeof movementsData>);
        
        const updatedVariants = product.variants.map(variant => {
            const variantMovements = movementsByVariant[variant.id] || [];
            
            const total_received = variantMovements
                .filter(m => (['in', 'purchase'].includes(m.movement_type) || (m.movement_type === 'adjustment' && m.quantity > 0)) && m.quantity > 0)
                .reduce((sum, m) => sum + m.quantity, 0);

            const total_shipped = variantMovements
                .filter(m => ['out', 'sale'].includes(m.movement_type))
                .reduce((sum, m) => sum + Math.abs(m.quantity), 0);

            const total_damaged = variantMovements
                .filter(m => m.movement_type === 'damaged')
                .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
            
            const lastReceivedMovements = variantMovements
                .filter(m => ['in', 'purchase'].includes(m.movement_type) && m.quantity > 0)
                .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());

            const last_received_date = lastReceivedMovements.length > 0 ? lastReceivedMovements[0].created_at! : undefined;

            return {
                ...variant,
                total_received,
                total_shipped,
                total_damaged,
                last_received_date,
            };
        });
        
        setDetailedProduct({ ...product, variants: updatedVariants });
        setDetailsLoading(false);
    };

    fetchMovementDetails();
  }, [product]);


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
  
  const handleDeleteConfirm = () => {
    onDelete(product.id);
    setIsDeleteModalOpen(false);
  };

  const totalStock = product.variants.flatMap(v => v.stock_levels).reduce((sum, sl) => sum + sl.quantity, 0);

  return (
    <>
      <div className="bg-slate-100 min-h-screen md:p-6">
        <div className="md:max-w-4xl md:mx-auto">
          <header className="bg-white p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm md:rounded-t-2xl">
            <button onClick={onBack} className="text-gray-600 p-2 rounded-full hover:bg-slate-100">
              <BackIcon className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-800">{product.name}</h1>
              <p className="text-sm text-gray-500">{product.sku}</p>
            </div>
            <div className="ml-auto flex gap-2">
                <button onClick={() => onEdit(product)} className="text-gray-600 p-2 rounded-full hover:bg-slate-100" aria-label="Modifier le produit">
                    <PencilIcon className="w-6 h-6" />
                </button>
                <button onClick={() => setIsDeleteModalOpen(true)} className="text-red-500 p-2 rounded-full hover:bg-red-50" aria-label="Supprimer le produit">
                    <TrashIcon className="w-6 h-6" />
                </button>
            </div>
          </header>
          
          <div className="p-4 space-y-6 md:bg-white md:p-6 md:shadow-sm md:rounded-b-2xl">
            <div className="bg-white rounded-2xl shadow-sm p-4 h-64 flex items-center justify-center md:bg-slate-100 border border-slate-200">
                <img src={product.images[0] || 'https://placehold.co/400x400/f5f5f5/cccccc?text=Image'} alt={product.name} className="max-w-full max-h-full object-contain" />
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-200">
                <h2 className="text-md font-bold text-gray-800 mb-2">Description</h2>
                <p className="text-sm text-gray-600">{product.description || "Aucune description fournie."}</p>
                <div className="mt-4 flex justify-between items-center text-sm">
                    <span className="text-gray-500">Catégorie: <span className="font-semibold text-gray-700">{product.category || 'N/A'}</span></span>
                    <span className="text-gray-500">Stock Total: <span className="font-bold text-lg text-gray-900">{totalStock}</span></span>
                </div>
            </div>
            
            <div className="space-y-4">
                <h2 className="text-md font-bold text-gray-800 px-1">Variantes & Stocks</h2>
                {detailedProduct.variants.map(variant => {
                    const stockInfo = variant.stock_levels[0];
                    if (!stockInfo) return null;

                    const status = getStockStatus(stockInfo);

                    return (
                        <div key={variant.id} className="bg-white rounded-2xl shadow-sm p-4 border border-slate-200">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-teal-600">{variant.variant_name}</h3>
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
                                      <StatCard label="Total Reçu" value={detailsLoading ? '...' : variant.total_received} />
                                      <StatCard label="Total Expédié" value={detailsLoading ? '...' : variant.total_shipped} />
                                      <StatCard label="Endommagé" value={detailsLoading ? '...' : variant.total_damaged} />
                                </div>
                                {!detailsLoading && variant.last_received_date && (
                                    <div className="text-center text-xs text-gray-400 pt-1">
                                        Dernière réception le: {new Date(variant.last_received_date).toLocaleDateString('fr-FR')}
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
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
      <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Supprimer le produit"
          message={`Êtes-vous sûr de vouloir supprimer "${product.name}" ? Cette action est irréversible et supprimera également toutes les données de stock associées.`}
      />
    </>
  );
};

export default ProductDetailPage;