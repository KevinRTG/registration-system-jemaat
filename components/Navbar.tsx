
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onNavigate: (page: any) => void;
  activePage: string;
}

// Helper Components for Icons
const HomeIcon = ({ active }: { active: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${active ? 'fill-blue-600' : 'fill-slate-400'}`} viewBox="0 0 24 24">
    <path d="M11.03 2.59a1.5 1.5 0 0 1 1.94 0l7.5 5.5c.5.36.8.95.8 1.57v10.84a1.5 1.5 0 0 1-1.5 1.5H15a1.5 1.5 0 0 1-1.5-1.5v-4a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 0-.5.5v4a1.5 1.5 0 0 1-1.5 1.5H4.23a1.5 1.5 0 0 1-1.5-1.5V9.66c0-.62.3-1.2.79-1.57l7.51-5.5Z" />
  </svg>
);

const DocIcon = ({ active }: { active: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${active ? 'fill-blue-600' : 'fill-slate-400'}`} viewBox="0 0 24 24">
     <path d="M12.75 2H6.25C5.01 2 4 3.01 4 4.25v15.5C4 20.99 5.01 22 6.25 22h11.5c1.24 0 2.25-1.01 2.25-2.25V7.5h-5.25A2.25 2.25 0 0 1 12.75 5.25V2Z" />
     <path opacity="0.5" d="M14.25 2.5v2.75c0 .41.34.75.75.75h2.75l-3.5-3.5Z" />
  </svg>
);

const UserIcon = ({ active }: { active: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${active ? 'fill-blue-600' : 'fill-slate-400'}`} viewBox="0 0 24 24">
    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM4.07 18.257a7 7 0 0 1 15.86 0 .75.75 0 0 1-.722.993H4.793a.75.75 0 0 1-.722-.993Z" />
  </svg>
);

const DashboardIcon = ({ active }: { active: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${active ? 'fill-blue-600' : 'fill-slate-400'}`} viewBox="0 0 24 24">
    <path d="M4 10a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10ZM14 4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V4ZM4 5a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Z" />
  </svg>
);

const ShieldIcon = ({ active }: { active: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${active ? 'fill-blue-600' : 'fill-slate-400'}`} viewBox="0 0 24 24">
    <path d="M11.08 2.3a1.5 1.5 0 0 1 1.84 0l6.23 4.22c.62.43.95 1.15.86 1.9L19.2 16.5c-.32 2.67-2.02 5.04-4.52 6.3a1.5 1.5 0 0 1-1.36 0c-2.5-1.26-4.2-3.63-4.52-6.3l-.81-8.08c-.09-.75.24-1.47.86-1.9l6.23-4.22Z" />
  </svg>
);

const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout, onNavigate, activePage }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Efek shadow saat scroll (Desktop & Mobile Header)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinkClass = (page: string) =>
    `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activePage === page
      ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100'
      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
    }`;

  // --- DESKTOP VIEW ---
  const DesktopNav = () => (
    <nav className={`hidden md:block fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/50' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo Section */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur opacity-5 group-hover:opacity-40 transition-opacity"></div>
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

          {/* Desktop Navigation Links */}
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate('home')} className={navLinkClass('home')}>Beranda</button>
            {currentUser?.role === 'user' && (
              <button onClick={() => onNavigate('dashboard')} className={navLinkClass('dashboard')}>Dasbor</button>
            )}
            <button onClick={() => onNavigate('register')} className={navLinkClass('register')}>Pendaftaran</button>
            {currentUser?.role === 'admin' && (
              <button onClick={() => onNavigate('admin')} className={navLinkClass('admin')}>Admin Panel</button>
            )}
          </div>

          {/* Auth Button Desktop */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-medium uppercase">Halo, {currentUser.role === 'admin' ? 'Admin' : ''}</p>
                  <p className="text-sm font-bold text-slate-800 leading-none max-w-[120px] truncate" title={currentUser.name}>
                    {currentUser.name}
                  </p>
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
        </div>
      </div>
    </nav>
  );

  // --- MOBILE VIEW ---
  const MobileNav = () => (
    <>
      {/* Mobile Top Header (Logo Only) */}
      <div className={`md:hidden fixed top-0 w-full z-40 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm' : 'bg-transparent'}`}>
         <div className="flex justify-between items-center px-4 h-16">
            <div className="flex items-center gap-2" onClick={() => onNavigate('home')}>
                <img src="https://sinodegko.org/wp-content/uploads/2021/08/logo_transparanresize.png" alt="GKO" className="w-8 h-8 rounded-lg" />
                <span className="text-sm font-bold text-slate-900 tracking-tight">GKO Cibitung</span>
            </div>
            {currentUser && (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
                    {currentUser.name.charAt(0)}
                </div>
            )}
         </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
         <div className="flex justify-around items-center h-16">
            {/* 1. Beranda */}
            <button onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }} className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform">
                <HomeIcon active={activePage === 'home'} />
                <span className={`text-[10px] font-bold ${activePage === 'home' ? 'text-blue-600' : 'text-slate-400'}`}>Beranda</span>
            </button>

            {/* 2. Contextual: Dashboard (User) / Admin (Admin) / Masuk (Guest) */}
            {currentUser?.role === 'admin' ? (
                <button onClick={() => { onNavigate('admin'); setIsMobileMenuOpen(false); }} className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform">
                    <ShieldIcon active={activePage === 'admin'} />
                    <span className={`text-[10px] font-bold ${activePage === 'admin' ? 'text-blue-600' : 'text-slate-400'}`}>Admin</span>
                </button>
            ) : currentUser?.role === 'user' ? (
                <button onClick={() => { onNavigate('dashboard'); setIsMobileMenuOpen(false); }} className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform">
                    <DashboardIcon active={activePage === 'dashboard'} />
                    <span className={`text-[10px] font-bold ${activePage === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}>Dasbor</span>
                </button>
            ) : (
                // If Guest, prioritize Register or Home, but we need Auth here usually. 
                // Let's put Register here for guests.
                <button onClick={() => { onNavigate('register'); setIsMobileMenuOpen(false); }} className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform">
                   <DocIcon active={activePage === 'register'} />
                   <span className={`text-[10px] font-bold ${activePage === 'register' ? 'text-blue-600' : 'text-slate-400'}`}>Daftar</span>
                </button>
            )}

            {/* 3. Pendaftaran (If Logged In) or Login (If Guest) */}
             {currentUser ? (
                <button onClick={() => { onNavigate('register'); setIsMobileMenuOpen(false); }} className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform">
                    <DocIcon active={activePage === 'register'} />
                    <span className={`text-[10px] font-bold ${activePage === 'register' ? 'text-blue-600' : 'text-slate-400'}`}>Isi KK</span>
                </button>
             ) : (
                 // Empty slot for balance or Login trigger
                 <button onClick={() => { onNavigate('auth'); setIsMobileMenuOpen(false); }} className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform">
                    <UserIcon active={activePage === 'auth' || activePage === 'admin-auth'} />
                    <span className={`text-[10px] font-bold ${(activePage === 'auth' || activePage === 'admin-auth') ? 'text-blue-600' : 'text-slate-400'}`}>Masuk</span>
                 </button>
             )}

            {/* 4. Menu / Account Trigger */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${isMobileMenuOpen ? 'fill-blue-600' : 'fill-slate-400'}`} viewBox="0 0 24 24">
                     <path d="M3 6.25C3 5.01 4.01 4 5.25 4h13.5C19.99 4 21 5.01 21 6.25v.5c0 .41-.34.75-.75.75H3.75a.75.75 0 0 1-.75-.75v-.5ZM3.75 11h16.5c.41 0 .75.34.75.75v.5c0 1.24-1.01 2.25-2.25 2.25H5.25C4.01 14.5 3 13.49 3 12.25v-.5c0-.41.34-.75.75-.75ZM3 17.25c0-1.24 1.01-2.25 2.25-2.25h13.5c1.24 0 2.25 1.01 2.25 2.25v.5c0 .41-.34.75-.75.75H3.75a.75.75 0 0 1-.75-.75v-.5Z" />
                </svg>
                <span className={`text-[10px] font-bold ${isMobileMenuOpen ? 'text-blue-600' : 'text-slate-400'}`}>Akun</span>
            </button>
         </div>
      </nav>

      {/* Mobile Menu Drawer (Sheet) */}
      {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-[60] flex items-end justify-center">
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsMobileMenuOpen(false)}></div>
              
              {/* Sheet Content */}
              <div className="relative w-full bg-white rounded-t-3xl p-6 pb-24 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
                  
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Menu Akun</h3>
                  
                  <div className="space-y-2">
                      {currentUser ? (
                          <>
                             <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl mb-4">
                                 <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-lg font-bold text-slate-700">
                                     {currentUser.name.charAt(0)}
                                 </div>
                                 <div>
                                     <p className="font-bold text-slate-900">{currentUser.name}</p>
                                     <p className="text-xs text-slate-500">{currentUser.email}</p>
                                 </div>
                             </div>

                             {currentUser.role === 'admin' && (
                                <button onClick={() => { onNavigate('admin'); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                    <span>🛡️</span> Panel Admin
                                </button>
                             )}

                             <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 flex items-center gap-3 mt-4">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                Keluar Aplikasi
                             </button>
                          </>
                      ) : (
                          <>
                             <p className="text-sm text-slate-500 mb-4">Silakan masuk untuk mengakses fitur lengkap jemaat.</p>
                             <button onClick={() => { onNavigate('auth'); setIsMobileMenuOpen(false); }} className="w-full px-4 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg">
                                Masuk / Daftar
                             </button>
                             <button onClick={() => { onNavigate('admin-auth'); setIsMobileMenuOpen(false); }} className="w-full px-4 py-3 mt-3 text-slate-500 font-bold text-xs text-center uppercase tracking-wider">
                                Login Staf / Admin
                             </button>
                          </>
                      )}
                  </div>
              </div>
          </div>
      )}
    </>
  );

  return (
    <>
        <DesktopNav />
        <MobileNav />
    </>
  );
};

export default Navbar;
