import React from 'react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onOpen: (product: Product) => void;
}

const getProductStatus = (product: Product) => {
    const totalStock = product.variants.flatMap(v => v.stock_levels).reduce((sum, sl) => sum + sl.quantity, 0);
    const totalSafetyStock = product.variants.flatMap(v => v.stock_levels).reduce((sum, sl) => sum + sl.safety_stock, 0);

    if (totalStock <= 0) {
        return { text: "Rupture", color: "bg-red-500" };
    }
    if (totalStock <= totalSafetyStock) {
        return { text: "Stock Faible", color: "bg-orange-500" };
    }
    return { text: "En Stock", color: "bg-green-500" };
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onOpen }) => {
  const totalStock = product.variants.flatMap(v => v.stock_levels).reduce((sum, sl) => sum + sl.quantity, 0);
  const status = getProductStatus(product);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 flex gap-3 transition-shadow hover:shadow-md">
      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 p-1">
        <img src={product.images?.[0] || 'https://placehold.co/200x200/e2e8f0/e2e8f0'} alt={product.name} className="w-full h-full object-contain" />
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
            <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${status.color}`} title={status.text}></span>
                <h3 className="text-sm font-bold text-gray-800 leading-tight line-clamp-2">{product.name}</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">{product.sku}</p>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Stock: <strong className="text-base">{totalStock}</strong></span>
          <button onClick={() => onOpen(product)} className="px-4 py-1.5 rounded-lg text-white text-xs font-bold" style={{backgroundColor:'#0076BC'}}>Détails</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;