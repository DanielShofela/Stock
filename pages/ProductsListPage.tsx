import React, { useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types';
import { SearchIcon } from '../components/icons/SearchIcon';
import { BoxIcon } from '../components/icons/BoxIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon';

interface ProductsListPageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddClick: () => void;
}

const ProductsListPage: React.FC<ProductsListPageProps> = ({ products, onSelectProduct, onAddClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = useMemo(() => {
    const allCategories = products
        .map(p => p.category)
        .filter((c): c is string => !!c);
    return ['Toutes les catégories', ...Array.from(new Set(allCategories))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesCategory = !selectedCategory || p.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, products]);

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <div className="sticky top-0 bg-slate-50/80 backdrop-blur-sm py-3 z-10 -mx-4 px-4 md:-mx-6 md:px-6">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Catalogue Produits</h1>
            <button
                id="add-product-button"
                onClick={onAddClick}
                className="flex items-center gap-2 bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-700 shadow-md shadow-teal-500/30 text-sm"
            >
                <PlusIcon className="w-5 h-5" />
                <span>Ajouter</span>
            </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
                <input
                    className="w-full rounded-xl p-3 pl-10 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Rechercher par nom ou SKU..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <div className="relative">
                <select
                    className="w-full sm:w-48 rounded-xl p-3 pr-10 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none bg-white"
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    aria-label="Filtrer par catégorie"
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat === 'Toutes les catégories' ? '' : cat}>
                            {cat}
                        </option>
                    ))}
                </select>
                <ChevronDownIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {filteredProducts.map(p => (
                <ProductCard key={p.id} product={p} onOpen={onSelectProduct} />
                ))}
            </div>
            {filteredProducts.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                <p>Aucun produit ne correspond à vos filtres.</p>
                </div>
            )}
        </>
      )}

    </div>
  );
};

export default ProductsListPage;