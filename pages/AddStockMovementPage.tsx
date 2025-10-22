import React, { useState } from 'react';
import { BackIcon } from '../components/icons/BackIcon';
import type { Product, Warehouse } from '../types';

interface AddStockMovementPageProps {
  products: Product[];
  warehouses: Warehouse[];
  onAddMovement: (movement: { variantId: number, warehouseId: number, quantity: number, type: 'in' | 'out' | 'adjustment', reference: string }) => void;
  onBack: () => void;
}

const AddStockMovementPage: React.FC<AddStockMovementPageProps> = ({ products, warehouses, onAddMovement, onBack }) => {
  const [selectedVariant, setSelectedVariant] = useState<string>(''); // "productId-variantId"
  const [movementType, setMovementType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [quantity, setQuantity] = useState<string>('');
  const [warehouseId, setWarehouseId] = useState<string>(warehouses[0]?.id.toString() || '');
  const [reference, setReference] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedVariant || !quantity || !warehouseId) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty === 0) {
      setError('La quantité doit être un nombre différent de zéro.');
      return;
    }

    const [, variantId] = selectedVariant.split('-').map(Number);
    
    const finalQuantity = movementType === 'out' ? -qty : qty;

    onAddMovement({
        variantId,
        warehouseId: Number(warehouseId),
        quantity: finalQuantity,
        type: movementType,
        reference
    });
  };

  return (
    <div>
      <header className="bg-white p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="text-gray-600 p-2 rounded-full hover:bg-gray-100">
          <BackIcon className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Nouveau Mouvement de Stock</h1>
      </header>

      <form className="p-4 space-y-6" onSubmit={handleSubmit}>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">{error}</div>}
        
        <div>
          <label htmlFor="product" className="block text-sm font-semibold text-gray-600 mb-2">Produit / Variante</label>
          <select 
            id="product" 
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0076BC]"
            required
          >
            <option value="" disabled>Sélectionner un produit</option>
            {products.map(p => (
                <optgroup label={p.name} key={p.id}>
                    {p.variants.map(v => (
                        <option key={v.id} value={`${p.id}-${v.id}`}>{v.variant_name}</option>
                    ))}
                </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="movementType" className="block text-sm font-semibold text-gray-600 mb-2">Type de mouvement</label>
          <select 
            id="movementType" 
            value={movementType}
            onChange={(e) => setMovementType(e.target.value as 'in' | 'out' | 'adjustment')}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0076BC]"
          >
            <option value="in">Entrée (Achat / Retour)</option>
            <option value="out">Sortie (Vente)</option>
            <option value="adjustment">Ajustement</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                 <label htmlFor="quantity" className="block text-sm font-semibold text-gray-600 mb-2">Quantité</label>
                <input 
                    type="number" 
                    id="quantity" 
                    placeholder="0" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0076BC]"
                    required
                />
            </div>
            <div>
                <label htmlFor="warehouse" className="block text-sm font-semibold text-gray-600 mb-2">Entrepôt</label>
                 <select 
                    id="warehouse" 
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0076BC]"
                    required
                 >
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
            </div>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-semibold text-gray-600 mb-2">Raison / Référence</label>
          <input 
            type="text" 
            id="reason" 
            placeholder="Ex: Commande Fournisseur #123" 
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0076BC]" 
          />
        </div>
        
        <button
            type="submit"
            className="w-full bg-[#0076BC] text-white font-bold py-3 px-4 rounded-xl hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0076BC] transition-all duration-300 shadow-lg shadow-[#0076BC]/30"
          >
            Enregistrer le mouvement
        </button>

      </form>
    </div>
  );
};

export default AddStockMovementPage;
