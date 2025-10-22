import React from 'react';
import type { Product } from '../types';
import { BackIcon } from '../components/icons/BackIcon';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onBack }) => {

  const totalStock = product.variants.flatMap(v => v.stock_levels).reduce((sum, sl) => sum + sl.quantity, 0);

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <header className="bg-white p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="text-gray-600 p-2 rounded-full hover:bg-gray-100">
          <BackIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-800">{product.name}</h1>
          <p className="text-sm text-gray-500">{product.sku}</p>
        </div>
      </header>
      
      <div className="p-4 space-y-6">
        {/* Image Carousel */}
        <div className="bg-white rounded-2xl shadow-sm p-4 h-64 flex items-center justify-center">
            <img src={product.images[0] || 'https://placehold.co/400x400/f5f5f5/cccccc?text=Image'} alt={product.name} className="max-w-full max-h-full object-contain" />
        </div>

        {/* Product Info */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="text-md font-bold text-gray-800 mb-2">Description</h2>
            <p className="text-sm text-gray-600">{product.description}</p>
            <div className="mt-4 flex justify-between items-center text-sm">
                <span className="text-gray-500">Catégorie: <span className="font-semibold text-gray-700">{product.category}</span></span>
                 <span className="text-gray-500">Stock Total: <span className="font-bold text-lg text-gray-900">{totalStock}</span></span>
            </div>
        </div>
        
        {/* Variants & Stock Levels */}
        <div className="space-y-4">
            <h2 className="text-md font-bold text-gray-800 px-1">Variantes & Stocks</h2>
            {product.variants.map(variant => (
                <div key={variant.id} className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-[#0076BC]">{variant.variant_name}</h3>
                        <span className="text-sm font-semibold">{variant.price.toFixed(2)}€</span>
                    </div>
                    <div className="space-y-2">
                        {variant.stock_levels.map(sl => (
                            <div key={sl.warehouse_id} className="bg-gray-50 p-3 rounded-lg text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 font-semibold">{sl.warehouse_name}</span>
                                    <span className="font-bold text-gray-800 text-base">{sl.quantity} unités</span>
                                </div>
                                <div className="text-right text-xs text-gray-400 mt-1">
                                    Modifié le: {new Date(sl.last_modified).toLocaleString('fr-FR')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>

        <button className="w-full bg-[#009245] text-white font-bold py-3 px-4 rounded-xl hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#009245] transition-all duration-300 shadow-lg shadow-[#009245]/30">
            Ajuster le stock
        </button>
      </div>
    </div>
  );
};

export default ProductDetailPage;
