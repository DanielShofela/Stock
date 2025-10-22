import React, { useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types';
import { SearchIcon } from '../components/icons/SearchIcon';
import { BoxIcon } from '../components/icons/BoxIcon';
import { PlusIcon } from '../components/icons/PlusIcon';

interface ProductsListPageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddClick: () => void;
}

const ProductsListPage: React.FC<ProductsListPageProps> = ({ products, onSelectProduct, onAddClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return products;
    }
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, products]);

  return (
    <div className="p-4 bg-[#F5F5F5] min-h-screen">
      <div className="sticky top-0 bg-[#F5F5F5] py-2 z-10">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-800">Catalogue Produits</h1>
            <button
                id="add-product-button"
                onClick={onAddClick}
                className="flex items-center gap-2 bg-[#0076BC] text-white font-bold py-2 px-4 rounded-xl hover:bg-opacity-90 transition-all duration-300 shadow-lg shadow-[#0076BC]/30 text-sm"
            >
                <PlusIcon className="w-5 h-5" />
                <span>Ajouter</span>
            </button>
        </div>
        <div className="relative">
          <input
            className="w-full rounded-xl p-3 pl-10 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0076BC]"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>
      
      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
            <BoxIcon className="w-16 h-16 mx-auto text-gray-300" />
            <h2 className="mt-4 text-lg font-semibold text-gray-700">Votre catalogue est vide</h2>
            <p className="mt-1 text-sm">Commencez par ajouter votre premier produit en cliquant sur "Ajouter".</p>
        </div>
      ) : (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                {filteredProducts.map(p => (
                <ProductCard key={p.id} product={p} onOpen={onSelectProduct} />
                ))}
            </div>
            {filteredProducts.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                <p>Aucun produit ne correspond à votre recherche.</p>
                </div>
            )}
        </>
      )}

    </div>
  );
};

export default ProductsListPage;