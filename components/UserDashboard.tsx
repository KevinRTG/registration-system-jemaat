
import React, { useState, useEffect } from 'react';
import { User, Keluarga, VerificationStatus, FamilyRelationship } from '../types';
import { apiService } from '../services/api';
import SettingsPanel from './SettingsPanel';

interface UserDashboardProps {
  currentUser: User;
  onNavigate: (page: 'register' | 'home' | 'admin' | 'auth' | 'dashboard') => void;
  refreshKey?: number;
  onShowNotification: (msg: string, type: 'success' | 'error') => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ currentUser, onNavigate, refreshKey, onShowNotification }) => {
  const [family, setFamily] = useState<Keluarga | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'card' | 'settings'>('card');

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser.nik_kk) { setIsLoading(false); return; }
      setIsLoading(true);
      try {
        const data = await apiService.families.getByKK(currentUser.nik_kk);
        setFamily(data);
      } catch (error) {
        console.error("Failed to load family data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [currentUser, refreshKey]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest animate-pulse">Memuat Data...</p>
      </div>
    );
  }

  // --- EMPTY STATE ---
  if (!family && activeTab !== 'settings') {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-end mb-6">
            <button onClick={() => setActiveTab('settings')} className="text-sm font-bold text-slate-500 hover:text-blue-600 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 transition-all">
                ⚙️ Pengaturan Akun
            </button>
        </div>
        <div className="bg-white rounded-3xl p-8 md:p-16 text-center shadow-xl shadow-slate-100 border border-slate-100">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">👋</div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Halo, {currentUser.name}</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
               Akun Anda aktif, tetapi belum terhubung dengan data jemaat. Silakan lengkapi pendaftaran keluarga Anda.
            </p>
            <button onClick={() => onNavigate('register')} className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95">
                Mulai Pendaftaran Jemaat →
            </button>
        </div>
      </div>
    );
  }

  // --- CARD VIEW ---
  const renderCardContent = () => {
    if (!family) return null;
    const isVerified = family.status === VerificationStatus.Verified;
    const kepalaKeluarga = family.anggota?.find(a => a.hubungan_keluarga === FamilyRelationship.KepalaKeluarga)?.nama_lengkap || currentUser.name;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Status Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                   <h1 className="text-xl font-bold text-slate-900">Kartu Digital Jemaat</h1>
                   <p className="text-xs text-slate-500">ID Resmi Keanggotaan GKO Cibitung</p>
                </div>
                <div className={`px-4 py-2 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-wider ${isVerified ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                   <span className={`w-2.5 h-2.5 rounded-full ${isVerified ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`}></span>
                   {isVerified ? 'Terverifikasi' : 'Menunggu Verifikasi'}
                </div>
            </div>

            {/* DIGITAL CARD COMPONENT */}
            <div className="group relative w-full aspect-[1.586/1] max-w-md mx-auto md:max-w-lg lg:max-w-xl rounded-3xl overflow-hidden shadow-2xl shadow-slate-300 transition-transform duration-500 hover:scale-[1.02]">
                {/* Backgrounds */}
                <div className={`absolute inset-0 bg-gradient-to-br ${isVerified ? 'from-green-600 via-emerald-700 to-black/90' : 'from-yellow-400 via-orange-500 to-red-500'}`}></div>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent"></div>
                
                {/* Content */}
                <div className="relative z-10 h-full p-6 md:p-8 flex flex-col justify-between text-white">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center">
                                <span className="font-bold text-lg">GKO</span>
                            </div>
                            <div>
                                <p className="text-[10px] md:text-xs opacity-80 uppercase tracking-widest font-semibold">Kartu Keluarga</p>
                                <p className="text-base md:text-xl font-bold tracking-wide">JEMAAT</p>
                            </div>
                        </div>
                        <div className="w-12 h-8 md:w-16 md:h-10 opacity-60 rounded border border-white/30 flex items-center justify-center bg-white/5">
                            <div className="w-8 h-5 border-2 border-white/40 rounded-sm"></div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <p className="font-mono text-2xl md:text-3xl font-bold tracking-widest drop-shadow-md tabular-nums">
                            {family.nomor_kk.replace(/(\d{4})(?=\d)/g, '$1 ')}
                        </p>
                        
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] opacity-70 uppercase tracking-wider font-semibold mb-1">Kepala Keluarga</p>
                                <p className="text-sm md:text-lg font-bold uppercase truncate max-w-[180px] md:max-w-xs">{kepalaKeluarga}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] opacity-70 uppercase tracking-wider font-semibold mb-1">Wilayah</p>
                                <p className="text-sm md:text-lg font-bold">{family.wilayah_pelayanan}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAMILY MEMBERS LIST */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">Daftar Anggota ({family.anggota?.length})</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {(family.anggota || []).map((member) => (
                        <div key={member.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${member.hubungan_keluarga === 'Kepala Keluarga' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                {member.nama_lengkap.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">{member.nama_lengkap}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 uppercase">{member.hubungan_keluarga}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">{member.nik}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-12">
        <div className="flex justify-center mb-8">
            <div className="bg-white p-1 rounded-full border border-slate-200 shadow-sm inline-flex">
                <button onClick={() => setActiveTab('card')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'card' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Kartu Saya</button>
                <button onClick={() => setActiveTab('settings')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Pengaturan</button>
            </div>
        </div>
        {activeTab === 'card' ? renderCardContent() : <SettingsPanel currentUser={currentUser} onShowNotification={onShowNotification} />}
    </div>
  );
};

export default UserDashboard;
