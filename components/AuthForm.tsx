
import React, { useState, useEffect } from 'react';
import { User, UserAccount } from '../types';
import { apiService } from '../services/api';

interface AuthFormProps {
  onSuccess: (user: User) => void;
  isLogin: boolean;
  setIsLogin: (val: boolean) => void;
  onShowNotification: (msg: string, type: 'success' | 'error') => void;
}

type AuthView = 'login' | 'register' | 'forgot' | 'admin';

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess, isLogin, setIsLogin, onShowNotification }) => {
  const [view, setView] = useState<AuthView>(isLogin ? 'login' : 'register');
  
  useEffect(() => {
    if (view !== 'admin' && view !== 'forgot') {
        setView(isLogin ? 'login' : 'register');
    }
  }, [isLogin]);

  const [email, setEmail] = useState('');
  const [nikKk, setNikKk] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSwitchView = (newView: AuthView) => {
    setView(newView);
    setError('');
    setSuccessMsg('');
    if (newView === 'login') setIsLogin(true);
    if (newView === 'register') setIsLogin(false);
  };

  const handleNikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setNikKk(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (view === 'forgot') {
        await apiService.auth.resetPassword(email);
        const msg = 'Link reset password telah dikirim ke email Anda.';
        setSuccessMsg(msg);
        onShowNotification(msg, 'success');
        setLoading(false);
        return;
      }

      let user: User;

      if (view === 'admin') {
        if (!email) throw new Error('Mohon masukkan Email Admin.');
        user = await apiService.auth.login(email, password);
        
        if (user.role !== 'admin') {
           throw new Error('Akun ini terdaftar sebagai User Biasa. Pastikan menggunakan email khusus admin.');
        }
        
        onShowNotification('Berhasil Login sebagai Admin.', 'success');
        onSuccess(user);
      } else if (view === 'login') {
        if (!email) throw new Error('Mohon masukkan alamat Email.');
        user = await apiService.auth.login(email, password);
        onShowNotification('Berhasil Masuk. Selamat Datang!', 'success');
        onSuccess(user);
      } else if (view === 'register') {
        if (password.length < 6) throw new Error('Password terlalu pendek (min. 6 karakter).');
        if (nikKk.length !== 16) throw new Error('NIK KK harus 16 digit angka.');
        if (!email.includes('@')) throw new Error('Email tidak valid.');
        
        const newAccount: UserAccount = { email, nik_kk: nikKk, password, name };
        user = await apiService.auth.register(newAccount);
        onShowNotification('Registrasi Berhasil! Akun Anda telah dibuat.', 'success');
        onSuccess(user);
      }
      
    } catch (err: any) {
      console.error("Form Error:", err);
      let msg = err.message || 'Terjadi kesalahan sistem.';
      if (msg.includes('Invalid login credentials')) msg = 'Email atau Password salah. Cek kembali.';
      setError(msg);
      // Optional: show toast for error too
      // onShowNotification(msg, 'error'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-2xl shadow-blue-100/50 border border-slate-100 animate-in fade-in zoom-in duration-300">
      <div className="flex justify-center mb-8 bg-slate-100 p-1 rounded-xl">
        <button 
          onClick={() => handleSwitchView('login')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${view !== 'admin' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
        >
          Portal Jemaat
        </button>
        <button 
          onClick={() => handleSwitchView('admin')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${view === 'admin' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
        >
          Portal Admin
        </button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">
          {view === 'admin' ? 'Login Admin' : view === 'login' ? 'Masuk Portal' : view === 'register' ? 'Registrasi Baru' : 'Lupa Password'}
        </h2>
        <p className="text-slate-500 mt-2 text-sm">
          {view === 'admin' ? 'Akses khusus sekretariat gereja' : 
           view === 'forgot' ? 'Link reset akan dikirim ke email Anda' : 
           view === 'login' ? 'Masuk menggunakan Email & Password' : 'Buat akun untuk pendaftaran digital'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-xl font-medium animate-pulse">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm rounded-r-xl font-medium">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {view === 'register' && (
          <div className="space-y-1 animate-in slide-in-from-top-2">
            <label className="text-xs font-bold text-slate-700 uppercase ml-1">Nama Lengkap (Sesuai KTP)</label>
            <input 
              type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm placeholder:text-slate-400"
              placeholder="Contoh: Budi Santoso"
            />
          </div>
        )}

        <div className="space-y-1 animate-in slide-in-from-top-2">
            <label className="text-xs font-bold text-slate-700 uppercase ml-1">
              {view === 'admin' ? 'Email Admin' : 'Alamat Email'}
            </label>
            <input 
              type={view === 'admin' ? 'text' : 'email'} 
              required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm placeholder:text-slate-400"
              placeholder={view === 'admin' ? 'admin@gko...' : 'nama@email.com'}
            />
        </div>

        {view === 'register' && (
          <div className="space-y-1 animate-in slide-in-from-top-2">
            <label className="text-xs font-bold text-slate-700 uppercase ml-1">NIK KK (16 Digit)</label>
            <input 
              type="text" required maxLength={16} value={nikKk} onChange={handleNikChange} pattern="\d*"
              className="w-full p-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm placeholder:text-slate-400"
              placeholder="Masukkan Nomor NIK KK"
            />
          </div>
        )}

        {view !== 'forgot' && (
          <div className="space-y-1 animate-in slide-in-from-top-2">
            <label className="text-xs font-bold text-slate-700 uppercase ml-1">Password</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm placeholder:text-slate-400"
              placeholder="Minimal 6 karakter"
            />
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 mt-4"
        >
          {loading ? 'Memproses...' : 
            (view === 'login' ? 'Masuk' : 
             view === 'admin' ? 'Login Admin' :
             view === 'register' ? 'Daftar Sekarang' : 'Kirim Reset Link')}
        </button>

        {view === 'login' && (
          <button 
            type="button"
            onClick={() => handleSwitchView('forgot')}
            className="w-full text-xs text-slate-400 font-medium hover:text-blue-600 transition-colors mt-2"
          >
            Lupa Password?
          </button>
        )}

        {view === 'forgot' && (
          <button 
            type="button"
            onClick={() => handleSwitchView('login')}
            className="w-full py-3 bg-white text-slate-500 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all mt-2 text-sm"
          >
            Kembali ke Login
          </button>
        )}
      </form>

      {view !== 'admin' && view !== 'forgot' && (
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            {view === 'login' ? "Belum terdaftar?" : "Sudah punya akun?"}{' '}
            <button 
              onClick={() => handleSwitchView(view === 'login' ? 'register' : 'login')}
              className="text-blue-600 font-bold hover:underline"
            >
              {view === 'login' ? 'Registrasi Baru' : 'Login di sini'}
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default AuthForm;
