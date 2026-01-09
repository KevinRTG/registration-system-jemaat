
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
import { Analytics } from "@vercel/analytics/react";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'register' | 'admin' | 'auth' | 'admin-auth' | 'dashboard'>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState(true);

  // State untuk memicu refresh data di dashboard
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);

  // Global Notification State
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

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

  const navigate = (page: 'home' | 'register' | 'admin' | 'auth' | 'admin-auth' | 'dashboard') => {
    // Auth Guards
    if (page === 'register' && !currentUser) {
      setCurrentPage('auth');
      setIsLogin(true);
      showNotification('Silakan login terlebih dahulu untuk mendaftar jemaat.', 'error');
      return;
    }
    if (page === 'admin' && currentUser?.role !== 'admin') {
      // Jika mencoba akses admin tapi belum login/bukan admin, arahkan ke login admin
      setCurrentPage('admin-auth');
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

      {/* Main Content Area with Dynamic Top Padding to account for Fixed Navbar */}
      <main className={`flex-grow ${currentPage !== 'home' ? 'pt-24 md:pt-28' : ''}`}>
        {currentPage === 'home' && (
          <>
            <Hero onStartRegistration={() => navigate(currentUser ? 'register' : 'auth')} />
            <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
                  Alur Pendaftaran
                </h2>
                <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
                  Ikuti langkah-langkah mudah berikut untuk terdaftar secara resmi sebagai jemaat GKO Cibitung.
                </p>
              </div>

              {/* TIMELINE VERTICAL */}
              <div className="relative max-w-2xl mx-auto pl-2 sm:pl-0">
                  {/* Garis Vertikal */}
                  <div className="absolute left-7 sm:left-9 top-2 bottom-6 w-0.5 bg-gradient-to-b from-blue-200 via-slate-200 to-transparent"></div>

                  {/* Step 1 */}
                  <div className="relative pl-24 sm:pl-28 py-2 mb-10 group">
                      {/* Indikator Nomor */}
                      <div className="absolute left-1 sm:left-3 top-0 w-12 h-12 bg-white rounded-full border-4 border-slate-100 flex items-center justify-center z-10 group-hover:border-blue-100 group-hover:scale-110 transition-all duration-300">
                           <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">1</div>
                      </div>
                      {/* Konten */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group-hover:-translate-y-1 group-hover:shadow-md transition-all duration-300">
                          <div className="absolute top-4 -left-2 w-4 h-4 bg-white border-l border-b border-slate-100 rotate-45"></div>
                          <h3 className="text-lg font-bold text-slate-900 mb-2">Registrasi Portal</h3>
                          <p className="text-slate-500 text-sm leading-relaxed">
                              Buat akun pribadi menggunakan alamat email aktif. Pastikan email bisa diakses untuk menerima notifikasi sistem dan verifikasi keamanan.
                          </p>
                      </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative pl-24 sm:pl-28 py-2 mb-10 group">
                      {/* Indikator Nomor */}
                      <div className="absolute left-1 sm:left-3 top-0 w-12 h-12 bg-white rounded-full border-4 border-slate-100 flex items-center justify-center z-10 group-hover:border-blue-100 group-hover:scale-110 transition-all duration-300">
                           <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">2</div>
                      </div>
                      {/* Konten */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group-hover:-translate-y-1 group-hover:shadow-md transition-all duration-300">
                          <div className="absolute top-4 -left-2 w-4 h-4 bg-white border-l border-b border-slate-100 rotate-45"></div>
                          <h3 className="text-lg font-bold text-slate-900 mb-2">Isi Data Keluarga</h3>
                          <p className="text-slate-500 text-sm leading-relaxed">
                              Lengkapi formulir digital sesuai dengan Kartu Keluarga (KK) fisik. Masukkan data kepala keluarga dan seluruh anggota keluarga dengan teliti.
                          </p>
                      </div>
                  </div>

                   {/* Step 3 */}
                  <div className="relative pl-24 sm:pl-28 py-2 mb-10 group">
                      {/* Indikator Nomor */}
                       <div className="absolute left-1 sm:left-3 top-0 w-12 h-12 bg-white rounded-full border-4 border-slate-100 flex items-center justify-center z-10 group-hover:border-blue-100 group-hover:scale-110 transition-all duration-300">
                           <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">3</div>
                      </div>
                      {/* Konten */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group-hover:-translate-y-1 group-hover:shadow-md transition-all duration-300">
                          <div className="absolute top-4 -left-2 w-4 h-4 bg-white border-l border-b border-slate-100 rotate-45"></div>
                          <h3 className="text-lg font-bold text-slate-900 mb-2">Verifikasi Admin</h3>
                          <p className="text-slate-500 text-sm leading-relaxed">
                              Data Anda akan diperiksa oleh sekretariat gereja untuk validasi. Anda dapat memantau status verifikasi secara real-time melalui Dasbor Jemaat.
                          </p>
                      </div>
                  </div>

                   {/* Step 4 */}
                  <div className="relative pl-24 sm:pl-28 py-2 group">
                       {/* Indikator Nomor */}
                       <div className="absolute left-1 sm:left-3 top-0 w-12 h-12 bg-white rounded-full border-4 border-green-100 flex items-center justify-center z-10 group-hover:scale-110 transition-all duration-300">
                           <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">✓</div>
                      </div>
                      {/* Konten */}
                      <div className="bg-green-50 p-6 rounded-2xl border border-green-100 shadow-sm relative group-hover:-translate-y-1 group-hover:shadow-md transition-all duration-300">
                          <div className="absolute top-4 -left-2 w-4 h-4 bg-green-50 border-l border-b border-green-100 rotate-45"></div>
                          <h3 className="text-lg font-bold text-green-900 mb-2">Resmi Terdaftar</h3>
                          <p className="text-green-700 text-sm leading-relaxed">
                              Selamat! Anda resmi terdaftar di database GKO Cibitung. Anda akan mendapatkan Kartu Jemaat Digital sebagai bukti keanggotaan yang sah.
                          </p>
                      </div>
                  </div>
              </div>
            </section>
          </>
        )}

        {currentPage === 'register' && (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <RegistrationStepper
              onComplete={handleRegistrationComplete}
              currentUser={currentUser}
              onShowNotification={showNotification}
            />
          </div>
        )}

        {currentPage === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <AdminDashboard currentUser={currentUser} />
          </div>
        )}

        {currentPage === 'dashboard' && currentUser && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <UserDashboard
              currentUser={currentUser}
              onNavigate={navigate}
              refreshKey={dashboardRefreshKey}
              onShowNotification={showNotification}
            />
          </div>
        )}

        {(currentPage === 'auth' || currentPage === 'admin-auth') && (
          <div className="min-h-[80vh] flex items-center justify-center px-4">
            <AuthForm
              onSuccess={handleAuthSuccess}
              isLogin={isLogin}
              setIsLogin={setIsLogin}
              onShowNotification={showNotification}
              defaultView={currentPage === 'admin-auth' ? 'admin' : undefined}
            />
          </div>
        )}
      </main>

      <Footer onNavigate={navigate} />
      <Analytics/> 
    </div>
  );
};

export default App;
