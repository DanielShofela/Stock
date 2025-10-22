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
    warehouse_id: string;
}

const AddProductPage: React.FC<AddProductPageProps> = ({ warehouses, onAddProduct, onBack }) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [variants, setVariants] = useState<VariantFormState[]>([
    { id: 1, variant_name: '', price: '', initial_quantity: '', warehouse_id: warehouses[0]?.id.toString() || '' }
  ]);
  
  const [error, setError] = useState<string>('');

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { id: Date.now(), variant_name: '', price: '', initial_quantity: '', warehouse_id: warehouses[0]?.id.toString() || '' }
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
    
    const now = new Date().toISOString();
    
    const newProductVariants: Omit<ProductVariant, 'id'>[] = variants.map(v => {
        const warehouse = warehouses.find(w => w.id === parseInt(v.warehouse_id, 10));
        const stockLevel: StockLevel = {
            warehouse_id: parseInt(v.warehouse_id, 10),
            warehouse_name: warehouse?.name || 'Inconnu',
            quantity: parseInt(v.initial_quantity, 10) || 0,
            safety_stock: 0,
            last_modified: now,
        };
        return {
            id: v.id,
            variant_name: v.variant_name,
            barcode: '',
            price: parseFloat(v.price) || 0,
            stock_levels: [stockLevel]
        }
    });

    const newProduct: Omit<Product, 'id'> = {
        name,
        sku,
        description,
        category,
        images: imageUrl ? [imageUrl] : [],
        variants: newProductVariants.map(v => ({...v, id: Date.now() + Math.random()})) // Ensure unique IDs
    };
    
    onAddProduct(newProduct);
  };


  return (
    <div>
      <header className="bg-white p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="text-gray-600 p-2 rounded-full hover:bg-gray-100">
          <BackIcon className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Ajouter un nouveau produit</h1>
      </header>
      
      <form className="p-4 space-y-6" onSubmit={handleSubmit}>
         {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">{error}</div>}

        <div className="bg-white p-4 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-md font-bold text-gray-800">Informations Générales</h2>
            <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-600 mb-2">Nom du produit *</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="w-full input-style" required />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="sku" className="block text-sm font-semibold text-gray-600 mb-2">SKU *</label>
                    <input type="text" id="sku" value={sku} onChange={e => setSku(e.target.value)} className="w-full input-style" required />
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-semibold text-gray-600 mb-2">Catégorie</label>
                    <input type="text" id="category" value={category} onChange={e => setCategory(e.target.value)} className="w-full input-style" />
                </div>
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-600 mb-2">Description</label>
                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full input-style" />
            </div>
             <div>
                <label htmlFor="imageUrl" className="block text-sm font-semibold text-gray-600 mb-2">URL de l'image</label>
                <input type="text" id="imageUrl" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="w-full input-style" />
            </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm space-y-4">
             <h2 className="text-md font-bold text-gray-800">Variantes & Stock Initial</h2>
             {variants.map((variant, index) => (
                 <div key={variant.id} className="p-3 border border-gray-200 rounded-xl space-y-3">
                    <p className="font-semibold text-gray-600">Variante #{index + 1}</p>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Nom Variante *</label>
                            <input type="text" placeholder="Ex: 50ml, Rouge" value={variant.variant_name} onChange={e => handleVariantChange(variant.id, 'variant_name', e.target.value)} className="w-full input-style-sm" required/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Prix *</label>
                            <input type="number" placeholder="0.00" value={variant.price} onChange={e => handleVariantChange(variant.id, 'price', e.target.value)} className="w-full input-style-sm" required />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Quantité Initiale *</label>
                            <input type="number" placeholder="0" value={variant.initial_quantity} onChange={e => handleVariantChange(variant.id, 'initial_quantity', e.target.value)} className="w-full input-style-sm" required/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Entrepôt *</label>
                            <select value={variant.warehouse_id} onChange={e => handleVariantChange(variant.id, 'warehouse_id', e.target.value)} className="w-full input-style-sm bg-white" required>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                    </div>
                 </div>
             ))}
             <button type="button" onClick={handleAddVariant} className="w-full flex items-center justify-center gap-2 text-sm text-[#0076BC] font-semibold p-2 rounded-lg hover:bg-blue-50">
                <PlusIcon className="w-5 h-5" />
                Ajouter une autre variante
            </button>
        </div>
        
        <button type="submit" className="w-full bg-[#009245] text-white font-bold py-3 px-4 rounded-xl hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#009245] transition-all duration-300 shadow-lg shadow-[#009245]/30">
          Enregistrer le produit
        </button>
        <style>{`
            .input-style {
                width: 100%;
                padding: 0.75rem 1rem;
                border-radius: 0.75rem;
                border: 1px solid #e5e7eb;
                transition: box-shadow 0.2s;
            }
            .input-style:focus {
                outline: none;
                box-shadow: 0 0 0 2px #0076BC;
            }
            .input-style-sm {
                width: 100%;
                padding: 0.5rem 0.75rem;
                border-radius: 0.5rem;
                border: 1px solid #e5e7eb;
                font-size: 0.875rem;
            }
             .input-style-sm:focus {
                outline: none;
                box-shadow: 0 0 0 2px #0076BC;
            }
        `}</style>
      </form>
    </div>
  );
};

export default AddProductPage;
