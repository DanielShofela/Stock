import React, { useState } from 'react';
import { BackIcon } from '../components/icons/BackIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import type { Product, Warehouse, ProductVariant, StockLevel } from '../types';

interface AddProductPageProps {
  warehouses: Warehouse[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onBack: () => void;
}

interface VariantFormState {
    id: number;
    variant_name: string;
    price: string;
    initial_quantity: string;
    safety_stock: string;
}

const AddProductPage: React.FC<AddProductPageProps> = ({ warehouses, onAddProduct, onBack }) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [variants, setVariants] = useState<VariantFormState[]>([
    { id: 1, variant_name: '', price: '', initial_quantity: '', safety_stock: '0' }
  ]);
  
  const [error, setError] = useState<string>('');

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { id: Date.now(), variant_name: '', price: '', initial_quantity: '', safety_stock: '0' }
    ]);
  };
  
  const handleVariantChange = (id: number, field: keyof VariantFormState, value: string) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !sku || variants.some(v => !v.variant_name || !v.price || !v.initial_quantity)) {
        setError('Veuillez remplir tous les champs obligatoires (*).');
        return;
    }
    
    if (warehouses.length === 0) {
        setError("Aucun entrepôt n'est configuré. Impossible de créer le produit.");
        return;
    }
    const defaultWarehouse = warehouses[0];
    
    const now = new Date().toISOString();
    
    const finalVariants: ProductVariant[] = variants.map(v => {
        const stock_levels: StockLevel[] = [{
            warehouse_id: defaultWarehouse.id,
            warehouse_name: defaultWarehouse.name,
            quantity: parseInt(v.initial_quantity, 10) || 0,
            initial_quantity: parseInt(v.initial_quantity, 10) || 0,
            safety_stock: parseInt(v.safety_stock, 10) || 0,
            last_modified: now
        }];
        return {
            id: 0, // placeholder
            variant_name: v.variant_name,
            barcode: '',
            price: parseFloat(v.price) || 0,
            stock_levels,
            total_received: parseInt(v.initial_quantity, 10) || 0,
            total_shipped: 0,
            total_damaged: 0,
        };
    });

    const newProduct: Omit<Product, 'id'> = {
        name,
        sku,
        description,
        category,
        images: imageUrl ? [imageUrl] : [],
        variants: finalVariants,
    };
    
    onAddProduct(newProduct);
  };
  
  const inputStyle = "w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500";
  const inputStyleSm = "w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm";

  return (
    <div className="md:p-6">
      <div className="md:max-w-4xl md:mx-auto">
        <header className="bg-white p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm md:rounded-t-xl">
          <button onClick={onBack} className="text-gray-600 p-2 rounded-full hover:bg-slate-100">
            <BackIcon className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Ajouter un nouveau produit</h1>
        </header>
        
        <form className="p-4 space-y-6 md:bg-white md:p-6 md:shadow-sm md:rounded-b-xl" onSubmit={handleSubmit}>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">{error}</div>}

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
              <h2 className="text-lg font-bold text-gray-800">Informations Générales</h2>
              <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-600 mb-2">Nom du produit *</label>
                  <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={inputStyle} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label htmlFor="sku" className="block text-sm font-semibold text-gray-600 mb-2">SKU *</label>
                      <input type="text" id="sku" value={sku} onChange={e => setSku(e.target.value)} className={inputStyle} required />
                  </div>
                  <div>
                      <label htmlFor="category" className="block text-sm font-semibold text-gray-600 mb-2">Catégorie</label>
                      <input type="text" id="category" value={category} onChange={e => setCategory(e.target.value)} className={inputStyle} />
                  </div>
              </div>
              <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-600 mb-2">Description</label>
                  <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className={inputStyle} />
              </div>
              <div>
                  <label htmlFor="imageUrl" className="block text-sm font-semibold text-gray-600 mb-2">URL de l'image</label>
                  <input type="text" id="imageUrl" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className={inputStyle} />
              </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
              <h2 className="text-lg font-bold text-gray-800">Variantes & Stock Initial</h2>
              {variants.map((variant, index) => (
                  <div key={variant.id} className="p-3 border border-slate-200 rounded-xl space-y-3 bg-slate-50/50">
                      <p className="font-semibold text-gray-700">Variante #{index + 1}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Nom Variante *</label>
                              <input type="text" placeholder="Ex: 50ml, Rouge" value={variant.variant_name} onChange={e => handleVariantChange(variant.id, 'variant_name', e.target.value)} className={inputStyleSm} required/>
                          </div>
                          <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Prix *</label>
                              <input type="number" step="0.01" placeholder="0.00" value={variant.price} onChange={e => handleVariantChange(variant.id, 'price', e.target.value)} className={inputStyleSm} required />
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Quantité Initiale *</label>
                                <input type="number" placeholder="0" value={variant.initial_quantity} onChange={e => handleVariantChange(variant.id, 'initial_quantity', e.target.value)} className={inputStyleSm} required/>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Seuil de stock minimum</label>
                                <input type="number" placeholder="0" value={variant.safety_stock} onChange={e => handleVariantChange(variant.id, 'safety_stock', e.target.value)} className={inputStyleSm} required/>
                            </div>
                        </div>
                  </div>
              ))}
              <button type="button" onClick={handleAddVariant} className="w-full flex items-center justify-center gap-2 text-sm text-teal-600 font-semibold p-2 rounded-lg hover:bg-teal-50">
                  <PlusIcon className="w-5 h-5" />
                  Ajouter une autre variante
              </button>
          </div>
          
          <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-4 rounded-xl hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg shadow-green-500/40">
            Enregistrer le produit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;