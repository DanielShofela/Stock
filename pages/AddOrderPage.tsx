import React, { useState, useMemo } from 'react';
import { BackIcon } from '../components/icons/BackIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import type { Product, Customer } from '../types';

interface OrderItem {
    productId: number;
    variantId: number;
    name: string;
    variantName: string;
    quantity: number;
    price: number;
    stock: number;
}

interface AddOrderPageProps {
  products: Product[];
  customers: Customer[];
  onAddOrder: (order: { customerName: string; items: { variantId: number; quantity: number; price: number }[]; total: number }) => void;
  onBack: () => void;
}


const AddOrderPage: React.FC<AddOrderPageProps> = ({ products, customers, onAddOrder, onBack }) => {
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [error, setError] = useState('');

  const availableVariants = useMemo(() => {
    return products.flatMap(p => 
      p.variants
        .filter(v => v.stock_levels.some(sl => sl.quantity > 0)) // Only show variants with stock
        .filter(v => !items.some(item => item.variantId === v.id)) // Only show variants not already in the cart
        .map(v => ({
            id: v.id,
            display: `${p.name} - ${v.variant_name}`,
            productId: p.id,
            price: v.price,
            stock: v.stock_levels[0]?.quantity ?? 0,
        }))
    );
  }, [products, items]);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const handleAddItem = () => {
    if (!selectedVariantId) return;
    const variantInfo = availableVariants.find(v => v.id === parseInt(selectedVariantId, 10));
    if (!variantInfo) return;

    setItems([
      ...items,
      {
        productId: variantInfo.productId,
        variantId: variantInfo.id,
        name: products.find(p => p.id === variantInfo.productId)!.name,
        variantName: products.find(p => p.id === variantInfo.productId)!.variants.find(v => v.id === variantInfo.id)!.variant_name,
        quantity: 1,
        price: variantInfo.price,
        stock: variantInfo.stock,
      }
    ]);
    setSelectedVariantId('');
  };

  const handleQuantityChange = (variantId: number, newQuantity: number) => {
    const itemToUpdate = items.find(i => i.variantId === variantId);
    if (!itemToUpdate) return;
    
    const validQuantity = Math.max(1, Math.min(newQuantity, itemToUpdate.stock));
    setItems(items.map(item => item.variantId === variantId ? { ...item, quantity: validQuantity } : item));
  };
  
  const handleRemoveItem = (variantId: number) => {
    setItems(items.filter(item => item.variantId !== variantId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim()) {
        setError('Veuillez saisir un nom de client.');
        return;
    }
    if (items.length === 0) {
        setError('Veuillez ajouter au moins un produit à la commande.');
        return;
    }

    onAddOrder({
        customerName: customerName.trim(),
        items: items.map(i => ({ variantId: i.variantId, quantity: i.quantity, price: i.price })),
        total,
    });
  };

  return (
    <div className="md:p-6">
      <div className="md:max-w-4xl md:mx-auto">
        <header className="bg-white p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm md:rounded-t-2xl">
          <button onClick={onBack} className="text-gray-600 p-2 rounded-full hover:bg-gray-100">
            <BackIcon className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">Nouvelle Commande</h1>
        </header>
        
        <form className="p-4 space-y-6 md:bg-white md:p-6 md:shadow-sm md:rounded-b-2xl" onSubmit={handleSubmit}>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">{error}</div>}

          <div className="bg-white p-4 rounded-2xl shadow-sm space-y-4">
              <h2 className="text-md font-bold text-gray-800">Client</h2>
              <div>
                  <label htmlFor="customerName" className="block text-sm font-semibold text-gray-600 mb-2">Nom du client *</label>
                  <input 
                    type="text" 
                    id="customerName" 
                    value={customerName} 
                    onChange={e => setCustomerName(e.target.value)} 
                    className="w-full input-style" 
                    list="customers-list"
                    placeholder="Saisir ou sélectionner un client"
                    required 
                  />
                  <datalist id="customers-list">
                    {customers.map(c => <option key={c.id} value={c.name} />)}
                  </datalist>
                  <p className="text-xs text-gray-500 mt-1">Si le client n'existe pas, il sera créé automatiquement.</p>
              </div>
          </div>
          
          <div className="bg-white p-4 rounded-2xl shadow-sm space-y-4">
              <h2 className="text-md font-bold text-gray-800">Produits</h2>
              <div className="flex gap-2">
                  <select 
                    value={selectedVariantId} 
                    onChange={e => setSelectedVariantId(e.target.value)} 
                    className="w-full input-style"
                  >
                      <option value="">Sélectionner un produit à ajouter</option>
                      {availableVariants.map(v => <option key={v.id} value={v.id}>{v.display}</option>)}
                  </select>
                  <button type="button" onClick={handleAddItem} className="flex-shrink-0 bg-[#0076BC] text-white p-3 rounded-xl hover:bg-opacity-90 disabled:bg-gray-300" disabled={!selectedVariantId}>
                      <PlusIcon className="w-5 h-5"/>
                  </button>
              </div>

              <div className="space-y-2">
                  {items.map(item => (
                      <div key={item.variantId} className="flex items-center gap-3 p-2 border-b">
                          <div className="flex-1">
                              <p className="font-semibold text-sm">{item.name}</p>
                              <p className="text-xs text-gray-500">{item.variantName}</p>
                          </div>
                          <div className="w-24">
                              <input 
                                type="number" 
                                value={item.quantity} 
                                onChange={e => handleQuantityChange(item.variantId, parseInt(e.target.value, 10))}
                                min="1"
                                max={item.stock}
                                className="w-full input-style-sm text-center"
                              />
                               <p className="text-xs text-gray-400 text-center mt-0.5">Stock: {item.stock}</p>
                          </div>
                          <p className="w-20 text-right text-sm font-semibold">{(item.quantity * item.price).toFixed(2)}€</p>
                          <button type="button" onClick={() => handleRemoveItem(item.variantId)} className="text-red-500 hover:text-red-700 p-1">
                              <TrashIcon className="w-5 h-5" />
                          </button>
                      </div>
                  ))}
                  {items.length === 0 && <p className="text-center text-sm text-gray-500 py-4">La commande est vide.</p>}
              </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm text-right">
              <span className="text-gray-600">Total de la commande:</span>
              <p className="text-3xl font-bold text-gray-800">{total.toFixed(2)}€</p>
          </div>

          <button type="submit" className="w-full bg-[#009245] text-white font-bold py-3 px-4 rounded-xl hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#009245] transition-all duration-300 shadow-lg shadow-[#009245]/30">
            Enregistrer la Commande
          </button>
          
          <style>{`
              .input-style {
                  width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 1px solid #e5e7eb;
              }
              .input-style:focus { outline: none; box-shadow: 0 0 0 2px #0076BC; }
              .input-style-sm {
                  width: 100%; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; font-size: 0.875rem;
              }
              .input-style-sm:focus { outline: none; box-shadow: 0 0 0 2px #0076BC; }
          `}</style>
        </form>
      </div>
    </div>
  );
};

export default AddOrderPage;
