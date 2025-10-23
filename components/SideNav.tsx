import React from 'react';
import type { Page } from '../App';
import { HomeIcon } from './icons/HomeIcon';
import { BoxIcon } from './icons/BoxIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { PlusIcon } from './icons/PlusIcon';
import { LeafIcon } from './icons/LeafIcon';

interface SideNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NavItem: React.FC<{
    id?: string;
    page: Page;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: (page: Page) => void;
}> = ({ id, page, label, icon, isActive, onClick }) => (
    <button
        id={id}
        onClick={() => onClick(page)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left transition-colors duration-200 ${
            isActive 
            ? 'bg-[#0076BC] text-white shadow-sm' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
        }`}
    >
        {icon}
        <span className="font-semibold">{label}</span>
    </button>
);

const SideNav: React.FC<SideNavProps> = ({ currentPage, onNavigate }) => {
  return (
    <aside className="w-64 bg-white h-screen flex-col p-4 border-r border-gray-200 hidden md:flex sticky top-0">
      <div className="flex items-center gap-2.5 px-2 mb-6">
          <div className="bg-[#009245] p-2 rounded-lg">
            <LeafIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">A-Cosmetic</h1>
      </div>

      <button
        id="add-stock-button"
        onClick={() => onNavigate('add-stock')}
        className="flex items-center justify-center gap-2 w-full bg-[#0076BC] text-white font-bold py-3 px-4 rounded-xl hover:bg-opacity-90 transition-all duration-300 shadow-lg shadow-[#0076BC]/30 mb-6"
      >
        <PlusIcon className="w-5 h-5" />
        <span>Nouveau Mouvement</span>
      </button>

      <nav className="flex flex-col gap-2">
        <NavItem 
            id="dashboard-nav-item"
            page="dashboard" 
            label="Accueil"
            icon={<HomeIcon className="w-6 h-6" />}
            isActive={currentPage === 'dashboard'}
            onClick={onNavigate}
        />
        <NavItem 
            id="products-nav-item"
            page="products" 
            label="Produits"
            icon={<BoxIcon className="w-6 h-6" />}
            isActive={currentPage === 'products' || currentPage === 'product-detail' || currentPage === 'add-product'}
            onClick={onNavigate}
        />
        <NavItem 
            id="orders-nav-item"
            page="orders" 
            label="Commandes"
            icon={<FileTextIcon className="w-6 h-6" />}
            isActive={currentPage === 'orders'}
            onClick={onNavigate}
        />
        <NavItem 
            id="reports-nav-item"
            page="reports" 
            label="Rapports"
            icon={<ChartBarIcon className="w-6 h-6" />}
            isActive={currentPage === 'reports'}
            onClick={onNavigate}
        />
      </nav>
    </aside>
  );
};

export default SideNav;
