
import React, { useState, useEffect } from 'react';
import { User, UserAccount } from '../types';
import { apiService } from '../services/api';

interface AuthFormProps {
  onSuccess: (user: User) => void;
  isLogin: boolean;
  setIsLogin: (val: boolean) => void;
  onShowNotification: (msg: string, type: 'success' | 'error') => void;
  defaultView?: 'admin' | 'login';
}

type AuthView = 'login' | 'register' | 'forgot' | 'admin';

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess, isLogin, setIsLogin, onShowNotification, defaultView }) => {
  const [view, setView] = useState<AuthView>(defaultView || (isLogin ? 'login' : 'register'));
  
  // Update view if defaultView prop changes
  useEffect(() => {
    if (defaultView) {
        setView(defaultView);
    } else if (view !== 'admin' && view !== 'forgot') {
        setView(isLogin ? 'login' : 'register');
    }
  }, [isLogin, defaultView]);

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
           throw new Error('Akun ini terdaftar sebagai User Biasa. Gunakan portal jemaat.');
        }
        
        onShowNotification('Login Admin Berhasil.', 'success');
        onSuccess(user);
      } else if (view === 'login') {
        if (!email) throw new Error('Mohon masukkan alamat Email.');
        user = await apiService.auth.login(email, password);
        onShowNotification('Berhasil Masuk.', 'success');
        onSuccess(user);
      } else if (view === 'register') {
        // Validation
        if (password.length < 6) throw new Error('Password min. 6 karakter.');
        if (nikKk.length !== 16) throw new Error('NIK KK harus 16 digit.');
        if (!email.includes('@')) throw new Error('Format email salah.');
        if (name.length < 3) throw new Error('Nama terlalu pendek.');
        
        const newAccount: UserAccount = { email, nik_kk: nikKk, password, name };
        user = await apiService.auth.register(newAccount);
        
        const registerMsg = 'Registrasi Berhasil! Cek email untuk verifikasi.';
        onShowNotification(registerMsg, 'success');
        onSuccess(user);
      }
      
    } catch (err: any) {
      console.error("Form Error:", err);
      let msg = err.message || 'Terjadi kesalahan sistem.';
      
      if (msg.includes('Email not confirmed')) {
          msg = 'Akun belum aktif. Cek email Anda untuk konfirmasi.';
      } 
      else if (msg.includes('Invalid login credentials')) {
          msg = 'Email atau Password salah.';
      }
      setError(msg);
      if (view === 'register') onShowNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1";
  
  // Theme distinction for Admin vs User
  const isDarkTheme = view === 'admin';

  return (
    <div className={`w-full max-w-md p-6 md:p-10 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border relative overflow-hidden transition-colors duration-300 ${isDarkTheme ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-100'}`}>
        
      {/* Accent Top */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isDarkTheme ? 'from-red-500 to-purple-500' : 'from-blue-500 to-indigo-500'}`}></div>

      <div className="text-center mb-8">
        <h2 className={`text-2xl font-bold tracking-tight ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
          {view === 'admin' ? 'Portal Admin' : view === 'login' ? 'Portal Jemaat' : view === 'register' ? 'Buat Akun Jemaat' : 'Reset Password'}
        </h2>
        <p className={`mt-2 text-sm leading-relaxed ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
          {view === 'admin' ? 'Akses khusus staf sekretariat & majelis' : 
           view === 'forgot' ? 'Masukkan email untuk reset password' : 
           view === 'login' ? 'Silakan masuk untuk mengakses data' : 'Isi form di bawah untuk mendaftar'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl flex items-start gap-2 animate-pulse">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 text-xs font-semibold rounded-xl flex items-start gap-2">
           <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {view === 'register' && (
          <div className="animate-in slide-in-from-top-2">
            <label className={labelClass}>Nama Lengkap</label>
            <input 
              type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className={inputClass} placeholder="Sesuai KTP"
            />
          </div>
        )}

        <div className="animate-in slide-in-from-top-2">
            <label className={labelClass}>{view === 'admin' ? 'Email Admin' : 'Email'}</label>
            <input 
              type={view === 'admin' ? 'text' : 'email'} 
              required value={email} onChange={(e) => setEmail(e.target.value)}
              className={`${inputClass} ${isDarkTheme ? 'bg-slate-800 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500' : ''}`} 
              placeholder="nama@email.com"
            />
        </div>

        {view === 'register' && (
          <div className="animate-in slide-in-from-top-2">
            <label className={labelClass}>NIK KK</label>
            <input 
              type="text" required maxLength={16} value={nikKk} onChange={handleNikChange} pattern="\d*"
              className={inputClass} placeholder="16 Digit Angka"
            />
          </div>
        )}

        {view !== 'forgot' && (
          <div className="animate-in slide-in-from-top-2">
            <label className={labelClass}>Password</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} ${isDarkTheme ? 'bg-slate-800 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500' : ''}`}
              placeholder="••••••••"
            />
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-3.5 rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4 ${isDarkTheme ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-900/20' : 'bg-slate-900 text-white shadow-slate-200 hover:bg-blue-600 hover:shadow-blue-200'}`}
        >
          {loading ? (
             <span className="flex items-center justify-center gap-2">
               <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               Memproses...
             </span>
          ) : (view === 'login' ? 'Masuk' : view === 'admin' ? 'Masuk Admin' : view === 'register' ? 'Daftar Akun' : 'Kirim Link Reset')}
        </button>

        {view === 'login' && (
          <div className="text-center pt-2">
            <button type="button" onClick={() => handleSwitchView('forgot')} className="text-xs text-slate-400 font-medium hover:text-blue-600 transition-colors">
                Lupa Password?
            </button>
          </div>
        )}

        {view === 'forgot' && (
          <button type="button" onClick={() => handleSwitchView('login')} className="w-full py-3 bg-white text-slate-500 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm">
            Batal
          </button>
        )}
      </form>

      {view !== 'admin' && view !== 'forgot' && (
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            {view === 'login' ? "Belum punya akun?" : "Sudah punya akun?"}{' '}
            <button 
              onClick={() => handleSwitchView(view === 'login' ? 'register' : 'login')}
              className="text-blue-600 font-bold hover:underline"
            >
              {view === 'login' ? 'Daftar Sekarang' : 'Login'}
            </button>
          </p>
        </div>
      )}

      {/* Admin Toggle Link */}
      <div className={`mt-6 text-center pt-4 ${isDarkTheme ? 'border-t border-slate-800' : 'border-t border-slate-50'}`}>
          {view === 'admin' ? (
              <button onClick={() => handleSwitchView('login')} className="text-[10px] text-slate-500 hover:text-white transition-colors uppercase tracking-widest font-bold">
                  ← Kembali ke Portal Jemaat
              </button>
          ) : (
              <button onClick={() => handleSwitchView('admin')} className="text-[10px] text-slate-300 hover:text-slate-500 transition-colors uppercase tracking-widest font-bold">
                  Staf Gereja? Masuk Admin
              </button>
          )}
      </div>
    </div>
  );
};

export default AuthForm;
