
import React, { useState } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';

interface SettingsPanelProps {
  currentUser: User;
  onShowNotification: (msg: string, type: 'success' | 'error') => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ currentUser, onShowNotification }) => {
  const [name, setName] = useState(currentUser.name);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updates: { name?: string; password?: string } = {};

      if (name !== currentUser.name) {
        if (!name.trim()) throw new Error("Nama tidak boleh kosong.");
        updates.name = name;
      }

      if (password) {
        if (password.length < 6) throw new Error("Password baru minimal 6 karakter.");
        if (password !== confirmPassword) throw new Error("Konfirmasi password tidak cocok.");
        updates.password = password;
      }

      if (Object.keys(updates).length === 0) {
        throw new Error("Tidak ada perubahan yang dilakukan.");
      }

      await apiService.auth.updateAccount(updates);
      
      onShowNotification("Pengaturan akun berhasil diperbarui.", 'success');
      setPassword('');
      setConfirmPassword('');
      
      // Force refresh (optional, but handled nicely if Parent re-renders or via api sync)
      // window.location.reload(); // Simple way to ensure data sync
      
    } catch (err: any) {
      onShowNotification(err.message || "Gagal memperbarui akun.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800">Pengaturan Akun</h3>
        <p className="text-xs text-slate-500">Kelola informasi profil dan keamanan akun Anda.</p>
      </div>
      
      <form onSubmit={handleUpdate} className="p-6 md:p-8 space-y-6">
        {/* Profile Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-blue-600 uppercase tracking-widest border-b border-slate-100 pb-2">Profil Pengguna</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Alamat Email</label>
              <input 
                type="email" 
                value={currentUser.email} 
                disabled 
                className="w-full p-3 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl text-sm cursor-not-allowed select-none"
              />
              <p className="text-[10px] text-slate-400 italic">Email tidak dapat diubah secara langsung.</p>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Nama Lengkap</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="space-y-4 pt-4">
          <h4 className="text-sm font-bold text-blue-600 uppercase tracking-widest border-b border-slate-100 pb-2">Keamanan (Ganti Password)</h4>
          <p className="text-xs text-slate-500 mb-2">Kosongkan jika tidak ingin mengubah password.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Password Baru</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full p-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Konfirmasi Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full p-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={isLoading}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPanel;
