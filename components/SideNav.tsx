
import React from 'react';
import type { Page } from '../App';
import { HomeIcon } from './icons/HomeIcon';
import { BoxIcon } from './icons/BoxIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { MoveIcon } from './icons/MoveIcon';
import { LeafIcon } from './icons/LeafIcon';
import { UserIcon } from './icons/UserIcon';
import type { Profile } from '../types';

interface SideNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  profile: Profile | null;
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
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
            : 'text-gray-600 hover:bg-blue-50 hover:text-gray-900'
        }`}
    >
        {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6 flex-shrink-0' })}
        <span className="font-semibold">{label}</span>
    </button>
);

const SideNav: React.FC<SideNavProps> = ({ currentPage, onNavigate, profile }) => {
  return (
    <aside className="w-64 bg-white h-screen flex-col p-4 border-r border-gray-200 hidden md:flex sticky top-0">
      <div className="flex items-center gap-3 px-2 mb-8">
          <div className="bg-green-500 p-2.5 rounded-lg">
            <LeafIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">A-Cosmetic</h1>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        <NavItem 
            id="dashboard-nav-item"
            page="dashboard" 
            label="Accueil"
            icon={<HomeIcon />}
            isActive={currentPage === 'dashboard'}
            onClick={onNavigate}
        />
        <NavItem 
            id="products-nav-item"
            page="products" 
            label="Produits"
            icon={<BoxIcon />}
            isActive={currentPage === 'products' || currentPage === 'product-detail' || currentPage === 'add-product'}
            onClick={onNavigate}
        />
        <NavItem
            id="orders-nav-item"
            page="orders"
            label="Commandes"
            icon={<FileTextIcon />}
            isActive={currentPage === 'orders' || currentPage === 'add-order'}
            onClick={onNavigate}
        />
         <NavItem 
            id="mouvements-nav-item"
            page="add-stock" 
            label="Mouvements"
            icon={<MoveIcon />}
            isActive={currentPage === 'add-stock'}
            onClick={onNavigate}
        />
        <NavItem 
            id="reports-nav-item"
            page="reports" 
            label="Rapports"
            icon={<ChartBarIcon />}
            isActive={currentPage === 'reports'}
            onClick={onNavigate}
        />
      </nav>

        <div className="mt-auto">
             <NavItem
                id="account-nav-item-desktop"
                page="account"
                label="Mon Compte"
                icon={<UserIcon />}
                isActive={currentPage === 'account'}
                onClick={onNavigate}
            />
        </div>
    </aside>
  );
};

export default SideNav;
