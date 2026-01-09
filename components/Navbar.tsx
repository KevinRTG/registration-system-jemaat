
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onNavigate: (page: any) => void;
  activePage: string;
}

const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout, onNavigate, activePage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Efek shadow saat scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinkClass = (page: string) => 
    `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
      activePage === page 
      ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100' 
      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
    }`;

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/50' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <img 
                src="https://sinodegko.org/wp-content/uploads/2021/08/logo_transparanresize.png" 
                alt="GKO Logo" 
                className="w-10 h-10 rounded-xl object-contain relative z-10"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-900 leading-none tracking-tight group-hover:text-blue-600 transition-colors">GKO Cibitung</span>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Sistem Jemaat</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => onNavigate('home')} className={navLinkClass('home')}>Beranda</button>
            
            {/* Hanya tampilkan Dashboard User jika role user */}
            {currentUser?.role === 'user' && (
              <button onClick={() => onNavigate('dashboard')} className={navLinkClass('dashboard')}>Dasbor</button>
            )}
            
            <button onClick={() => onNavigate('register')} className={navLinkClass('register')}>Pendaftaran</button>
            
            {/* STRICT: Admin panel hanya untuk role admin */}
            {currentUser?.role === 'admin' && (
              <button onClick={() => onNavigate('admin')} className={navLinkClass('admin')}>Admin Panel</button>
            )}
          </div>

          {/* Auth Button Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                <div className="text-right hidden lg:block">
                  <p className="text-xs text-slate-400 font-medium uppercase">Halo, {currentUser.role === 'admin' ? 'Admin' : 'Jemaat'}</p>
                  <p className="text-sm font-bold text-slate-800 leading-none max-w-[120px] truncate">{currentUser.name}</p>
                </div>
                <button 
                  onClick={onLogout}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all border border-slate-100"
                  title="Keluar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => onNavigate('auth')}
                className="bg-slate-900 text-white hover:bg-blue-600 px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-slate-200 hover:shadow-blue-200 transition-all active:scale-95"
              >
                Masuk Portal
              </button>
            )}
          </div>
          
          {/* Mobile Toggle */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="absolute top-20 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-xl md:hidden animate-in slide-in-from-top-5 duration-200 z-40">
          <div className="p-4 space-y-2">
            <button onClick={() => { onNavigate('home'); setIsOpen(false); }} className="block w-full text-left px-4 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
              Beranda
            </button>
            {currentUser?.role === 'user' && (
              <button onClick={() => { onNavigate('dashboard'); setIsOpen(false); }} className="block w-full text-left px-4 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                Dasbor
              </button>
            )}
            <button onClick={() => { onNavigate('register'); setIsOpen(false); }} className="block w-full text-left px-4 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
              Pendaftaran
            </button>
            {currentUser?.role === 'admin' && (
              <button onClick={() => { onNavigate('admin'); setIsOpen(false); }} className="block w-full text-left px-4 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                Admin Panel
              </button>
            )}
            <div className="border-t border-slate-100 my-2 pt-2">
              {currentUser ? (
                <button onClick={() => { onLogout(); setIsOpen(false); }} className="block w-full text-left px-4 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-colors">
                  Keluar ({currentUser.name})
                </button>
              ) : (
                <button onClick={() => { onNavigate('auth'); setIsOpen(false); }} className="block w-full text-center px-4 py-3 rounded-xl font-bold bg-blue-600 text-white shadow-lg shadow-blue-200 mt-2">
                  Masuk Portal
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
