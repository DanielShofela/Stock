import React from 'react';
import type { Page } from '../App';
import { HomeIcon } from './icons/HomeIcon';
import { BoxIcon } from './icons/BoxIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { PlusIcon } from './icons/PlusIcon';


interface BottomNavProps {
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
    <button id={id} onClick={() => onClick(page)} className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${isActive ? 'text-[#0076BC]' : 'text-gray-500 hover:text-[#0076BC]'}`}>
        {icon}
        <span className="text-xs mt-1">{label}</span>
    </button>
);


const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex items-center justify-around z-50">
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
        
        <div className="w-16 h-16 flex items-center justify-center">
            <button id="add-stock-button" onClick={() => onNavigate('add-stock')} className="w-14 h-14 bg-[#0076BC] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#0076BC]/40 transform -translate-y-4 hover:scale-105 transition-transform">
                <PlusIcon className="w-7 h-7" />
            </button>
        </div>

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
    </div>
  );
};

export default BottomNav;