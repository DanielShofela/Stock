import React, { useState, useEffect } from 'react';
import { BackIcon } from '../components/icons/BackIcon';
import type { Product } from '../types';

interface EditProductPageProps {
  product: Product;
  onUpdateProduct: (product: Product) => void;
  onBack: () => void;
}

interface VariantFormState {
    id: number;
    variant_name: string;
    price: string;
    barcode: string | null;
}

const EditProductPage: React.FC<EditProductPageProps> = ({ product, onUpdateProduct, onBack }) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [variants, setVariants] = useState<VariantFormState[]>([]);
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    if (product) {
      setName(product.name);
      setSku(product.sku || '');
      setDescription(product.description || '');
      setCategory(product.category || '');
      setImageUrl(product.images[0] || '');
      setVariants(product.variants.map(v => ({
          id: v.id,
          variant_name: v.variant_name,
          price: String(v.price),
          barcode: v.barcode || '',
      })));
    }
  }, [product]);

  const handleVariantChange = (id: number, field: keyof VariantFormState, value: string) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !sku || variants.some(v => !v.variant_name || !v.price)) {
        setError('Veuillez remplir tous les champs obligatoires (*).');
        return;
    }

    const updatedProduct: Product = {
        ...product,
        name,
        sku,
        description,
        category,
        images: imageUrl ? [imageUrl] : [],
        variants: product.variants.map((originalVariant) => {
            const formVariant = variants.find(v => v.id === originalVariant.id);
            return {
                ...originalVariant,
                variant_name: formVariant?.variant_name || originalVariant.variant_name,
                price: parseFloat(formVariant?.price || '0') || originalVariant.price,
                barcode: formVariant?.barcode || originalVariant.barcode,
            };
        })
    };
    onUpdateProduct(updatedProduct);
  };
  
  const inputStyle = "w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const inputStyleSm = "w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

  return (
    <div className="md:p-6">
      <div className="md:max-w-4xl md:mx-auto">
        <header className="bg-white p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm md:rounded-t-xl">
          <button onClick={onBack} className="text-gray-600 p-2 rounded-full hover:bg-gray-100">
            <BackIcon className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Modifier le produit</h1>
        </header>
        
        <form className="p-4 space-y-6 md:bg-white md:p-6 md:shadow-sm md:rounded-b-xl" onSubmit={handleSubmit}>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">{error}</div>}

          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
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

          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
              <h2 className="text-lg font-bold text-gray-800">Variantes</h2>
              {variants.map((variant, index) => (
                  <div key={variant.id} className="p-3 border border-gray-200 rounded-xl space-y-3 bg-gray-50/50">
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
                      <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Code-barres (facultatif)</label>
                          <input type="text" placeholder="1234567890123" value={variant.barcode || ''} onChange={e => handleVariantChange(variant.id, 'barcode', e.target.value)} className={inputStyleSm} />
                      </div>
                  </div>
              ))}
              <p className="text-xs text-center text-gray-500">La gestion des niveaux de stock se fait sur la page de détail du produit.</p>
          </div>
          
          <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/40">
            Enregistrer les modifications
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage;
