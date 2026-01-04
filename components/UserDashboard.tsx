
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
      // Jika tidak ada NIK KK di profile user, stop loading (anggap belum daftar)
      if (!currentUser.nik_kk) {
        setIsLoading(false);
        return;
      }
      
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
        <p className="text-slate-500 font-medium animate-pulse">Memuat data keanggotaan...</p>
      </div>
    );
  }

  // JIKA DATA KELUARGA BELUM ADA
  if (!family && activeTab !== 'settings') {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-end mb-4">
            <button 
                onClick={() => setActiveTab('settings')}
                className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
                ⚙️ Pengaturan Akun
            </button>
        </div>
        <div className="p-8 text-center bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 ring-8 ring-blue-50/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Selamat Datang, {currentUser.name}</h2>
            <p className="text-slate-500 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
            Akun Anda telah aktif, namun data Kartu Keluarga belum terdaftar di database jemaat kami.
            </p>
            <button
            onClick={() => onNavigate('register')}
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 transform hover:-translate-y-1"
            >
            <span className="mr-2">Mulai Pendaftaran Jemaat</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
            </button>
        </div>
      </div>
    );
  }

  // Content for Card
  const renderCardContent = () => {
    if (!family) return null;
    const isVerified = family.status === VerificationStatus.Verified;
    const kepalaKeluarga = family.anggota?.find(a => a.hubungan_keluarga === FamilyRelationship.KepalaKeluarga)?.nama_lengkap || currentUser.name;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* HEADER WELCOME */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 px-2">
                <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Jemaat</h1>
                <p className="text-slate-500">Informasi data diri dan keluarga Anda.</p>
                </div>
                <div className={`px-4 py-2 rounded-full border flex items-center gap-2 text-sm font-bold shadow-sm transition-all duration-500 ${isVerified ? 'bg-green-100 border-green-200 text-green-700' : 'bg-yellow-100 border-yellow-200 text-yellow-700'}`}>
                <span className={`w-3 h-3 rounded-full ${isVerified ? 'bg-green-600' : 'bg-yellow-600'} animate-pulse`}></span>
                {isVerified ? 'VERIFICATION COMPLETE' : 'MENUNGGU VERIFIKASI'}
                </div>
            </div>

            {/* KARTU DIGITAL */}
            <div className={`relative w-full overflow-hidden rounded-3xl shadow-2xl transition-all duration-700 hover:scale-[1.01] ${isVerified ? 'shadow-green-900/30' : 'shadow-blue-900/20'}`}>
                {/* Background Gradient & Pattern */}
                <div className={`absolute inset-0 bg-gradient-to-br ${isVerified ? 'from-green-700 via-emerald-800 to-teal-900' : 'from-blue-600 via-indigo-700 to-purple-800'}`}></div>
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 p-8 md:p-10 flex flex-col justify-between min-h-[280px]">
                
                {/* Card Header */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-inner">
                        <span className="text-2xl font-bold text-white">G</span>
                    </div>
                    <div>
                        <h3 className="text-xs md:text-sm font-medium text-white/80 tracking-widest uppercase">Kartu Keluarga Jemaat</h3>
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">GKO CIBITUNG</h2>
                    </div>
                    </div>
                    <div className="text-right">
                    <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Status</p>
                    <div className={`px-3 py-1 backdrop-blur-sm rounded-lg border font-bold text-sm md:text-base ${isVerified ? 'bg-white/20 border-white/40 text-white' : 'bg-yellow-400/20 border-yellow-300/40 text-yellow-100'}`}>
                        {isVerified ? 'VERIFIED' : 'PENDING'}
                    </div>
                    </div>
                </div>

                {/* Card Body */}
                <div className="mt-8 space-y-6">
                    <div>
                    <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Nomor Kartu Keluarga</p>
                    <p className="text-2xl md:text-4xl font-mono font-bold tracking-widest drop-shadow-md text-white">
                        {family.nomor_kk.replace(/(\d{4})(?=\d)/g, '$1 ')}
                    </p>
                    </div>
                    
                    <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Kepala Keluarga</p>
                        <p className="text-lg md:text-xl font-bold uppercase truncate max-w-[200px] md:max-w-md text-white">{kepalaKeluarga}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Wilayah</p>
                        <p className="text-lg font-bold text-white">{family.wilayah_pelayanan}</p>
                    </div>
                    </div>
                </div>
                </div>
            </div>

            {/* ANGGOTA KELUARGA LIST */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isVerified ? 'bg-green-600' : 'bg-blue-600'}`}></span>
                    Daftar Anggota Keluarga
                </h3>
                <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                    {family.anggota?.length || 0} Jiwa
                </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-6">
                {(family.anggota || []).map((member) => (
                    <div key={member.id} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group bg-white">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
                        member.hubungan_keluarga === FamilyRelationship.KepalaKeluarga 
                        ? 'bg-blue-100 text-blue-600' 
                        : member.jenis_kelamin === 'Perempuan' ? 'bg-pink-100 text-pink-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                        {member.nama_lengkap.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">{member.nama_lengkap}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                            member.hubungan_keluarga === FamilyRelationship.KepalaKeluarga ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                            {member.hubungan_keluarga}
                        </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{member.nik}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {member.tanggal_lahir ? new Date(member.tanggal_lahir).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : '-'}
                        </span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                            {member.status_gerejawi}
                        </span>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            
            {/* Footer Info */}
            <div className="text-center pt-8 border-t border-slate-200">
                <p className="text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Kartu digital ini adalah bukti pendaftaran sementara. <br/>
                Silakan tunjukkan kepada petugas sekretariat gereja jika diperlukan verifikasi data fisik.
                </p>
            </div>
        </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
            <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 inline-flex">
                <button
                    onClick={() => setActiveTab('card')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        activeTab === 'card' 
                        ? 'bg-blue-50 text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Kartu Digital
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        activeTab === 'settings' 
                        ? 'bg-blue-50 text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Pengaturan
                </button>
            </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'card' ? renderCardContent() : (
            <div className="max-w-2xl mx-auto">
                <SettingsPanel currentUser={currentUser} onShowNotification={onShowNotification} />
            </div>
        )}
    </div>
  );
};

export default UserDashboard;
