
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import RegistrationStepper from './components/RegistrationStepper';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import AuthForm from './components/AuthForm';
import Footer from './components/Footer';
import { User } from './types';
import { apiService } from './services/api';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'register' | 'admin' | 'auth' | 'dashboard'>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  
  // State untuk memicu refresh data di dashboard
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);

  // Global Notification State
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load user session from LocalStorage first for speed
  useEffect(() => {
    const savedUser = localStorage.getItem('gko_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Sync Session with Database on Mount (Critical for Admin Role sync)
  useEffect(() => {
    const sync = async () => {
      try {
        const freshUser = await apiService.auth.syncSession();
        if (freshUser) {
          setCurrentUser(freshUser);
          localStorage.setItem('gko_user', JSON.stringify(freshUser));
        } else {
          if (localStorage.getItem('gko_user')) {
             console.log("Cleaning up stale session...");
             localStorage.removeItem('gko_user');
             setCurrentUser(null);
          }
        }
      } catch (e) {
        console.error("Session sync failed:", e);
        localStorage.removeItem('gko_user');
        setCurrentUser(null);
      }
    };
    
    sync();
  }, []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('gko_user', JSON.stringify(user));
    
    // Notification logic handled inside AuthForm now via callback, 
    // but we navigate here.
    if (user.role === 'admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    localStorage.removeItem('gko_user');
    await apiService.auth.logout(); 
    showNotification("Anda telah keluar dari sistem.", 'success');
    setCurrentPage('home');
  };

  const navigate = (page: 'home' | 'register' | 'admin' | 'auth' | 'dashboard') => {
    // Auth Guards
    if (page === 'register' && !currentUser) {
      setCurrentPage('auth');
      setIsLogin(true);
      showNotification('Silakan login terlebih dahulu untuk mendaftar jemaat.', 'error');
      return;
    }
    if (page === 'admin' && currentUser?.role !== 'admin') {
      setCurrentPage('auth');
      setIsLogin(true);
      return;
    }
    if (page === 'dashboard' && !currentUser) {
        setCurrentPage('auth');
        setIsLogin(true);
        return;
    }
    
    // Refresh dashboard data if navigating to it
    if (page === 'dashboard') {
        setDashboardRefreshKey(prev => prev + 1);
    }

    setCurrentPage(page);
  };

  const handleRegistrationComplete = (newNik?: string) => {
    if (newNik && currentUser) {
      const updatedUser = { ...currentUser, nik_kk: newNik };
      setCurrentUser(updatedUser);
      localStorage.setItem('gko_user', JSON.stringify(updatedUser));
    }

    setDashboardRefreshKey(prev => prev + 1); 
    navigate('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative">
      {/* Global Toast Notification UI */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[100] max-w-sm px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-top-5 duration-300 ${notification.type === 'success' ? 'bg-white border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
           <div className="flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
             <div>
               <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{notification.type === 'success' ? 'Notifikasi Sistem' : 'Peringatan'}</p>
               <p className="text-sm font-bold leading-relaxed">{notification.message}</p>
             </div>
           </div>
        </div>
      )}

      <Navbar 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onNavigate={navigate}
        activePage={currentPage}
      />

      <main className="flex-grow">
        {currentPage === 'home' && (
          <>
            <Hero onStartRegistration={() => navigate(currentUser ? 'register' : 'auth')} />
            <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                  Alur Pendaftaran Online
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  Proses mudah dan transparan untuk menjadi jemaat resmi GKO Cibitung.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl mb-6">1</div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-800">Registrasi Portal</h3>
                  <p className="text-slate-600">Buat akun menggunakan Email untuk keamanan data Anda.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl mb-6">2</div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-800">Lengkapi Data KK</h3>
                  <p className="text-slate-600">Isi data Kartu Keluarga dan anggota keluarga secara lengkap dan jujur.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl mb-6">3</div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-800">Verifikasi & Resmi</h3>
                  <p className="text-slate-600">Setelah diverifikasi admin, Anda akan resmi terdaftar dalam database gereja.</p>
                </div>
              </div>
            </section>
          </>
        )}

        {currentPage === 'register' && (
          <div className="max-w-4xl mx-auto px-4 py-12">
             <RegistrationStepper 
               onComplete={handleRegistrationComplete} 
               currentUser={currentUser}
               onShowNotification={showNotification}
             />
          </div>
        )}

        {currentPage === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <AdminDashboard currentUser={currentUser} />
          </div>
        )}

        {currentPage === 'dashboard' && currentUser && (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <UserDashboard 
                  currentUser={currentUser} 
                  onNavigate={navigate} 
                  refreshKey={dashboardRefreshKey}
                />
            </div>
        )}

        {currentPage === 'auth' && (
          <div className="min-h-[80vh] flex items-center justify-center px-4">
            <AuthForm 
              onSuccess={handleAuthSuccess} 
              isLogin={isLogin} 
              setIsLogin={setIsLogin}
              onShowNotification={showNotification}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
