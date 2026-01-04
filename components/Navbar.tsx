
import React, { useState } from 'react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onNavigate: (page: any) => void;
  activePage: string;
}

const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout, onNavigate, activePage }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div 
              className="flex-shrink-0 flex items-center cursor-pointer" 
              onClick={() => onNavigate('home')}
            >
              {/* Logo Image Replacement */}
              <img 
                src="https://sinodegko.org/wp-content/uploads/2021/08/logo_transparanresize.png" 
                alt="GKO Cibitung Logo" 
                className="w-8 h-8 rounded-lg mr-2 object-cover shadow-sm"
              />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">GKO Cibitung</span>
            </div>
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              <button 
                onClick={() => onNavigate('home')}
                className={`${activePage === 'home' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'} inline-flex items-center px-1 pt-1 text-sm font-medium h-16 transition-colors`}
              >
                Beranda
              </button>
              
              {currentUser?.role === 'user' && (
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className={`${activePage === 'dashboard' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'} inline-flex items-center px-1 pt-1 text-sm font-medium h-16 transition-colors`}
                >
                  Dashboard
                </button>
              )}
              
              <button 
                onClick={() => onNavigate('register')}
                className={`${activePage === 'register' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'} inline-flex items-center px-1 pt-1 text-sm font-medium h-16 transition-colors`}
              >
                Daftar Jemaat
              </button>
              
              {currentUser?.role === 'admin' && (
                <button 
                  onClick={() => onNavigate('admin')}
                  className={`${activePage === 'admin' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'} inline-flex items-center px-1 pt-1 text-sm font-medium h-16 transition-colors`}
                >
                  Dashboard Admin
                </button>
              )}
            </div>
          </div>
          <div className="hidden md:flex md:items-center">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-slate-700">Halo, {currentUser.name}</span>
                <button 
                  onClick={onLogout}
                  className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button 
                onClick={() => onNavigate('auth')}
                className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition-all active:scale-95"
              >
                Portal
              </button>
            )}
          </div>
          
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100">
          <div className="pt-2 pb-3 space-y-1">
            <button 
              onClick={() => { onNavigate('home'); setIsOpen(false); }}
              className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-slate-600 hover:bg-slate-50 hover:border-blue-600 transition-colors"
            >
              Beranda
            </button>
            {currentUser?.role === 'user' && (
              <button 
                onClick={() => { onNavigate('dashboard'); setIsOpen(false); }}
                className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-slate-600 hover:bg-slate-50 hover:border-blue-600 transition-colors"
              >
                Dashboard
              </button>
            )}
            <button 
              onClick={() => { onNavigate('register'); setIsOpen(false); }}
              className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-slate-600 hover:bg-slate-50 hover:border-blue-600 transition-colors"
            >
              Daftar Jemaat
            </button>
            {currentUser?.role === 'admin' && (
              <button 
                onClick={() => { onNavigate('admin'); setIsOpen(false); }}
                className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-slate-600 hover:bg-slate-50 hover:border-blue-600 transition-colors"
              >
                Dashboard Admin
              </button>
            )}
            {currentUser ? (
              <button 
                onClick={() => { onLogout(); setIsOpen(false); }}
                className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-red-600 hover:bg-red-50 hover:border-red-600 transition-colors"
              >
                Keluar
              </button>
            ) : (
              <button 
                onClick={() => { onNavigate('auth'); setIsOpen(false); }}
                className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-blue-600 hover:bg-blue-50 hover:border-blue-600 transition-colors"
              >
                Portal
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
