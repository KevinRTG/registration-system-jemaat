
import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Keluarga, ServiceSector, FamilyRelationship, Jemaat, Gender, ChurchStatus, VerificationStatus, User } from '../types';
import { ICONS } from '../constants';
import { apiService } from '../services/api';
import SettingsPanel from './SettingsPanel';

interface AdminDashboardProps {
  currentUser?: User | null;
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const [families, setFamilies] = useState<Keluarga[]>([]);
  
  // View State
  const [activeTab, setActiveTab] = useState<'families' | 'birthdays' | 'settings'>('families');
  
  // Filter State - Families
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Filter State - Birthdays
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

  // System State
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null); 
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editType, setEditType] = useState<'family' | 'member'>('family');
  const [editingFamily, setEditingFamily] = useState<Keluarga | null>(null);
  const [editingMember, setEditingMember] = useState<Jemaat | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  
  // File Import Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
      setToast({ message, type });
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.families.getAll();
      setFamilies(data || []);
    } catch (error: any) {
      setToast({ message: error?.message || 'Gagal memuat data jemaat.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return 0;
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  // --- MEMOIZED DATA ---
  const filteredFamilies = useMemo(() => {
    return families.filter(f => {
      const kkMatch = (f.nomor_kk || '').includes(searchTerm);
      const memberMatch = (f.anggota || []).some(a => (a.nama_lengkap || '').toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSearch = kkMatch || memberMatch;
      
      const matchesSector = sectorFilter === 'All' || f.wilayah_pelayanan === sectorFilter;
      const matchesStatus = statusFilter === 'All' || (f.status || VerificationStatus.Pending) === statusFilter;
      return matchesSearch && matchesSector && matchesStatus;
    });
  }, [families, searchTerm, sectorFilter, statusFilter]);

  const birthdayMembers = useMemo(() => {
    const list: Array<Jemaat & { family: Keluarga; age: number; turningAge: number }> = [];
    
    families.forEach(f => {
      if (f.anggota) {
        f.anggota.forEach(m => {
          if (m.tanggal_lahir) {
            const birthDate = new Date(m.tanggal_lahir);
            if (birthDate.getMonth() === selectedMonth) {
              const currentAge = calculateAge(m.tanggal_lahir);
              const yearNow = new Date().getFullYear();
              const birthYear = birthDate.getFullYear();
              const turningAge = yearNow - birthYear;

              list.push({
                ...m,
                family: f,
                age: currentAge,
                turningAge: turningAge
              });
            }
          }
        });
      }
    });

    return list.sort((a, b) => {
      const dayA = new Date(a.tanggal_lahir).getDate();
      const dayB = new Date(b.tanggal_lahir).getDate();
      return dayA - dayB;
    });
  }, [families, selectedMonth]);


  // --- IMPORT LOGIC ---
  const handleImportClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
        {
            'NO_KK': '3275000000000001',
            'ALAMAT': 'Jl. Contoh Alamat No. 1, Cibitung',
            'WILAYAH': 'Sektor A',
            'NAMA_LENGKAP': 'Budi Santoso',
            'NIK': '3275123456780001',
            'JENIS_KELAMIN': 'Laki-laki',
            'TEMPAT_LAHIR': 'Jakarta',
            'TGL_LAHIR': '1980-01-31',
            'HUBUNGAN': 'Kepala Keluarga',
            'STATUS_GEREJAWI': 'Sidi'
        },
        {
            'NO_KK': '3275000000000001',
            'ALAMAT': 'Jl. Contoh Alamat No. 1, Cibitung',
            'WILAYAH': 'Sektor A',
            'NAMA_LENGKAP': 'Siti Aminah',
            'NIK': '3275123456780002',
            'JENIS_KELAMIN': 'Perempuan',
            'TEMPAT_LAHIR': 'Bekasi',
            'TGL_LAHIR': '1985-05-20',
            'HUBUNGAN': 'Istri',
            'STATUS_GEREJAWI': 'Sidi'
        }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Import");
    XLSX.writeFile(wb, "Template_Import_Jemaat_GKO.xlsx");
  };

  const normalizeString = (str: any) => String(str || '').trim();
  const parseDate = (val: any) => {
    if (!val) return '';
    if (typeof val === 'number') {
        const date = new Date(Math.round((val - 25569) * 86400 * 1000));
        return date.toISOString().split('T')[0];
    }
    const str = String(val).trim();
    if (str.match(/^\d{4}-\d{2}-\d{2}$/)) return str;
    return str;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsActionLoading('importing');
    const reader = new FileReader();
    reader.onload = async (evt) => {
        try {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data: any[] = XLSX.utils.sheet_to_json(ws);

            if (data.length === 0) throw new Error("File kosong atau format salah.");

            const groups: Record<string, Keluarga> = {};
            
            data.forEach((row, idx) => {
                const noKK = normalizeString(row['NO_KK']);
                if (!noKK) return; 
                if (!groups[noKK]) {
                    groups[noKK] = {
                        id: '',
                        nomor_kk: noKK,
                        alamat_kk: normalizeString(row['ALAMAT']),
                        // Default ke Belum ada Sektor jika kosong
                        wilayah_pelayanan: normalizeString(row['WILAYAH']) as ServiceSector || ServiceSector.Belum,
                        status: VerificationStatus.Verified,
                        registrationDate: new Date().toISOString(),
                        anggota: []
                    };
                }
                groups[noKK].anggota.push({
                    id: '',
                    nama_lengkap: normalizeString(row['NAMA_LENGKAP']),
                    nik: normalizeString(row['NIK']),
                    jenis_kelamin: normalizeString(row['JENIS_KELAMIN']).toUpperCase().startsWith('L') ? Gender.LakiLaki : Gender.Perempuan,
                    tempat_lahir: normalizeString(row['TEMPAT_LAHIR']),
                    tanggal_lahir: parseDate(row['TGL_LAHIR']),
                    hubungan_keluarga: normalizeString(row['HUBUNGAN']) as FamilyRelationship || FamilyRelationship.Lainnya,
                    status_gerejawi: normalizeString(row['STATUS_GEREJAWI']) as ChurchStatus || ChurchStatus.Belum
                });
            });

            let successCount = 0;
            let failCount = 0;
            
            for (const kk of Object.keys(groups)) {
                try {
                    await apiService.families.create(groups[kk], VerificationStatus.Verified);
                    successCount++;
                } catch (err: any) {
                    console.error(`Gagal import KK ${kk}:`, err);
                    failCount++;
                }
            }
            setToast({ 
                message: `Import Selesai. Sukses: ${successCount}. Gagal: ${failCount}.`, 
                type: failCount > 0 ? 'error' : 'success' 
            });
            loadData();
        } catch (error: any) {
            setToast({ message: "Gagal membaca file Excel: " + error.message, type: 'error' });
        } finally {
            setIsActionLoading(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    reader.readAsBinaryString(file);
  };

  // --- EXPORT LOGIC ---
  const handleExportExcel = () => {
    const isBirthdayExport = activeTab === 'birthdays';
    const dataToExport = isBirthdayExport ? birthdayMembers : filteredFamilies;

    if (Array.isArray(dataToExport) && dataToExport.length === 0) {
      setToast({ message: "Tidak ada data untuk diekspor.", type: 'error' });
      return;
    }

    setIsActionLoading('exporting');
    try {
      let exportData: any[] = [];
      let fileName = '';

      if (isBirthdayExport) {
        exportData = birthdayMembers.map(m => {
            const birthDate = new Date(m.tanggal_lahir);
            return {
                'Tanggal': `${birthDate.getDate()} ${MONTHS[birthDate.getMonth()]}`,
                'Nama Lengkap': m.nama_lengkap,
                'Ulang Tahun Ke': m.turningAge,
                'Jenis Kelamin': m.jenis_kelamin,
                'Wilayah': m.family.wilayah_pelayanan,
                'No. KK': m.family.nomor_kk,
                'Hubungan': m.hubungan_keluarga,
                'Tanggal Lahir Full': m.tanggal_lahir
            };
        });
        fileName = `Jemaat_Ultah_${MONTHS[selectedMonth]}_${new Date().getFullYear()}.xlsx`;
      } else {
        exportData = filteredFamilies.flatMap(f => 
            (f.anggota || []).map(a => ({
            'No. Kartu Keluarga': f.nomor_kk,
            'Wilayah Pelayanan': f.wilayah_pelayanan,
            'Alamat Lengkap': f.alamat_kk,
            'Nama Lengkap': a.nama_lengkap,
            'NIK': a.nik,
            'Hubungan Keluarga': a.hubungan_keluarga,
            'Jenis Kelamin': a.jenis_kelamin,
            'Tempat Lahir': a.tempat_lahir,
            'Tanggal Lahir': a.tanggal_lahir,
            'Usia': calculateAge(a.tanggal_lahir),
            'Status Gerejawi': a.status_gerejawi,
            'Status Verifikasi': f.status,
            'Tanggal Pendaftaran': f.registrationDate ? new Date(f.registrationDate).toLocaleDateString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric'
            }) : '-'
            }))
        );
        fileName = `Laporan_Jemaat_GKO_Cibitung_${new Date().toISOString().split('T')[0]}.xlsx`;
      }

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, isBirthdayExport ? "Ulang Tahun" : "Data Jemaat");
      const colWidths = Object.keys(exportData[0] || {}).map(key => ({ wch: 20 }));
      worksheet['!cols'] = colWidths;

      XLSX.writeFile(workbook, fileName);
      setToast({ message: 'File Excel berhasil diunduh.', type: 'success' });
    } catch (err: any) {
      setToast({ message: 'Gagal mengekspor data: ' + err.message, type: 'error' });
    } finally {
      setIsActionLoading(null);
    }
  };

  // --- DELETE LOGIC ---
  const handleDeleteFamily = async (family: Keluarga, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isActionLoading) return;

    const memberCount = family.anggota?.length || 0;
    const isConfirmed = window.confirm(
      `PERINGATAN: PENGHAPUSAN PERMANEN\n\n` +
      `Nomor KK: ${family.nomor_kk}\n` +
      `Total Anggota: ${memberCount} orang\n\n` +
      `Seluruh data akan terhapus. Lanjutkan?`
    );
    
    if (!isConfirmed) return;
    
    const actionKey = `delete-family-${family.id}`;
    setIsActionLoading(actionKey);
    
    try {
      await apiService.families.delete(family.id);
      setFamilies(prev => prev.filter(f => f.id !== family.id));
      if (expandedId === family.id) setExpandedId(null);
      setToast({ message: `Data keluarga ${family.nomor_kk} berhasil dihapus dari sistem.`, type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Gagal menghapus data keluarga.', type: 'error' });
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleDeleteMember = async (familyId: string, member: Jemaat, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (member.hubungan_keluarga === FamilyRelationship.KepalaKeluarga) {
      alert("Kepala Keluarga tidak bisa dihapus secara individu.");
      return;
    }

    if (!window.confirm(`Hapus anggota "${member.nama_lengkap}" dari keluarga?`)) return;

    setIsActionLoading(`delete-member-${member.id}`);
    try {
      await apiService.families.deleteMember(familyId, member.id);
      setFamilies(prev => prev.map(f => f.id === familyId ? { ...f, anggota: f.anggota.filter(m => m.id !== member.id) } : f));
      setToast({ message: `Anggota "${member.nama_lengkap}" berhasil dihapus.`, type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Gagal menghapus anggota.', type: 'error' });
    } finally {
      setIsActionLoading(null);
    }
  };

  // --- EDIT LOGIC ---
  const openEditFamily = (family: Keluarga, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditType('family');
    setEditingFamily(family);
    setEditForm({
      nomor_kk: family.nomor_kk,
      alamat_kk: family.alamat_kk,
      wilayah_pelayanan: family.wilayah_pelayanan,
      status: family.status
    });
    setIsEditModalOpen(true);
  };

  const openEditMember = (familyId: string, member: Jemaat, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditType('member');
    setEditingFamily(families.find(f => f.id === familyId) || null);
    setEditingMember(member);
    setEditForm({ ...member });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading('modal-save');
    try {
      if (editType === 'family' && editingFamily) {
        await apiService.families.update(editingFamily.id, editForm);
        setFamilies(prev => prev.map(f => f.id === editingFamily.id ? { ...f, ...editForm } : f));
        setToast({ message: 'Perubahan data keluarga berhasil disimpan.', type: 'success' });
      } else if (editType === 'member' && editingMember && editingFamily) {
        await apiService.families.updateMember(editingFamily.id, editForm);
        setFamilies(prev => prev.map(f => {
          if (f.id === editingFamily.id) {
            return { ...f, anggota: f.anggota.map(m => m.id === editingMember.id ? { ...m, ...editForm } : m) };
          }
          return f;
        }));
        setToast({ message: 'Perubahan data anggota berhasil disimpan.', type: 'success' });
      }
      setIsEditModalOpen(false);
    } catch (err: any) {
      setToast({ message: err.message || 'Gagal menyimpan data.', type: 'error' });
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleToggleStatus = async (family: Keluarga, e: React.MouseEvent | React.ChangeEvent) => {
    if (e && (e as any).stopPropagation) (e as any).stopPropagation();
    if (isActionLoading) return;

    const currentStatus = family.status || VerificationStatus.Pending;
    const nextStatus = currentStatus === VerificationStatus.Verified ? VerificationStatus.Pending : VerificationStatus.Verified;
    
    if (currentStatus === VerificationStatus.Verified && !window.confirm("Batalkan verifikasi untuk keluarga ini?")) return;
    
    const actionKey = `status-${family.id}`;
    setIsActionLoading(actionKey);
    
    try {
      await apiService.families.updateStatus(family.id, nextStatus, currentUser?.id);
      setFamilies(prev => prev.map(f => f.id === family.id ? { ...f, status: nextStatus } : f));
      setToast({ message: `Status KK ${family.nomor_kk} berhasil diubah ke ${nextStatus}.`, type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Gagal mengubah status.', type: 'error' });
    } finally {
      setIsActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 px-1 md:px-0 relative pb-20">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx, .xls, .csv" />

      {/* Toast Notification Local (Dashboard Specific) */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] max-w-sm px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-bottom-5 duration-300 ${toast.type === 'success' ? 'bg-white border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
           <div className="flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
             <div>
               <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{toast.type === 'success' ? 'Sistem Admin' : 'Peringatan Admin'}</p>
               <p className="text-xs font-semibold leading-relaxed">{toast.message}</p>
             </div>
           </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="font-bold text-slate-800">Edit Data {editType === 'family' ? 'Keluarga' : 'Anggota'}</h3>
                 <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                 {editType === 'family' ? (
                   <>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nomor KK</label>
                        <input type="text" maxLength={16} required value={editForm.nomor_kk || ''} onChange={e => setEditForm({...editForm, nomor_kk: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Alamat Lengkap</label>
                        <textarea rows={2} required value={editForm.alamat_kk || ''} onChange={e => setEditForm({...editForm, alamat_kk: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Wilayah</label>
                          <select value={editForm.wilayah_pelayanan || ''} onChange={e => setEditForm({...editForm, wilayah_pelayanan: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none text-sm">
                            {Object.values(ServiceSector).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                          <select value={editForm.status || ''} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none text-sm">
                            {Object.values(VerificationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                   </>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1 col-span-full">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nama Lengkap</label>
                        <input type="text" required value={editForm.nama_lengkap || ''} onChange={e => setEditForm({...editForm, nama_lengkap: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">NIK</label>
                        <input type="text" maxLength={16} value={editForm.nik || ''} onChange={e => setEditForm({...editForm, nik: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Hubungan</label>
                        <select value={editForm.hubungan_keluarga || ''} onChange={e => setEditForm({...editForm, hubungan_keluarga: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm">
                           {Object.values(FamilyRelationship).map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                   </div>
                 )}
                 <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors">Batal</button>
                    <button type="submit" disabled={isActionLoading === 'modal-save'} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                       {isActionLoading === 'modal-save' ? (
                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                       ) : 'Simpan Perubahan'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Dashboard Header & Tabs */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                Admin Dashboard
                <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest shadow-sm">PANEL AKTIF</span>
            </h1>
            <p className="text-slate-500 text-xs md:text-sm">Manajemen verifikasi, ekspor data, dan laporan jemaat.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
            {activeTab === 'families' && (
                <div className="flex items-center gap-2 mr-2">
                    <button 
                        onClick={handleDownloadTemplate}
                        className="text-[10px] font-bold text-blue-600 hover:underline"
                        title="Download Template Excel"
                    >
                        Template
                    </button>
                    <button 
                        onClick={handleImportClick}
                        disabled={isActionLoading === 'importing'}
                        className="bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                        title="Import Data Jemaat dari Excel"
                    >
                        {isActionLoading === 'importing' ? (
                            <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        )}
                        Import Data
                    </button>
                </div>
            )}

            <button 
                onClick={handleExportExcel} 
                disabled={activeTab === 'settings' || isActionLoading === 'exporting' || (activeTab === 'families' && filteredFamilies.length === 0) || (activeTab === 'birthdays' && birthdayMembers.length === 0)}
                className="flex-grow md:flex-none bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 disabled:opacity-50"
                title={activeTab === 'birthdays' ? "Download Daftar Ulang Tahun" : "Ekspor Seluruh Data"}
            >
                {isActionLoading === 'exporting' ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : <ICONS.Export />}
                {activeTab === 'birthdays' ? 'Export Ulang Tahun' : 'Export Data'}
            </button>
            <button 
                onClick={loadData} 
                className="flex-grow md:flex-none bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
                <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Refresh
            </button>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-1 bg-slate-100 rounded-xl gap-1 max-w-lg">
            <button 
                onClick={() => setActiveTab('families')} 
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'families' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Data Keluarga
            </button>
            <button 
                onClick={() => setActiveTab('birthdays')} 
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'birthdays' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Ulang Tahun
            </button>
            <button 
                onClick={() => setActiveTab('settings')} 
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'settings' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Pengaturan
            </button>
        </div>
      </div>

      {/* --- CONTENT: FAMILY LIST --- */}
      {activeTab === 'families' && (
        <>
            {/* Filters Area */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 scale-90"><ICONS.Search /></span>
                <input type="text" placeholder="Cari No. KK atau Nama Anggota..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex gap-2">
                <select className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="All">Semua Status</option>
                    {Object.values(VerificationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500" value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}>
                    <option value="All">Semua Wilayah</option>
                    {Object.values(ServiceSector).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                {isLoading && families.length === 0 ? (
                    <div className="p-24 text-center">
                    <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sinkronisasi Data...</span>
                    </div>
                ) : filteredFamilies.length > 0 ? (
                    filteredFamilies.map((f) => {
                    const kepala = f.anggota?.find(a => a.hubungan_keluarga === FamilyRelationship.KepalaKeluarga);
                    const isExpanded = expandedId === f.id;
                    const isVerified = f.status === VerificationStatus.Verified;
                    const isActionKey = isActionLoading === `family-${f.id}` || isActionLoading === `delete-family-${f.id}`;
                    const isUpdatingStatus = isActionLoading === `status-${f.id}`;
                    
                    return (
                        <div key={f.id} className={`relative group transition-all duration-300 ${isActionKey ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                        {isActionKey && (
                            <div className="absolute inset-0 z-30 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
                            <div className="bg-red-600 text-white text-[10px] font-black px-6 py-1.5 rounded-full animate-pulse uppercase tracking-widest shadow-lg">Processing...</div>
                            </div>
                        )}

                        <div className={`grid grid-cols-1 md:grid-cols-12 items-center px-6 py-5 cursor-pointer transition-colors ${isExpanded ? 'bg-blue-50/20' : 'hover:bg-slate-50/60'}`} onClick={() => setExpandedId(isExpanded ? null : f.id)}>
                            <div className="col-span-4">
                            <p className="text-sm font-bold text-slate-800 tracking-tight">{f.nomor_kk}</p>
                            <p className="text-xs text-slate-500 mt-0.5 truncate flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${isVerified ? 'bg-green-500' : 'bg-blue-400'}`}></span>
                                {kepala?.nama_lengkap || 'Tanpa Kepala Keluarga'}
                            </p>
                            </div>

                            <div className="col-span-1 text-center hidden md:block">
                            <span className="px-3 py-1 bg-slate-100 text-[10px] font-black rounded-full uppercase text-slate-600">{f.anggota?.length || 0} Jiwa</span>
                            </div>

                            <div className="col-span-2 hidden md:block text-center">
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-tighter">{f.wilayah_pelayanan}</span>
                            </div>

                            <div className="col-span-2 flex justify-center items-center gap-3">
                            <label className={`relative inline-flex items-center cursor-pointer transition-opacity ${isUpdatingStatus ? 'opacity-30' : ''}`} onClick={e => e.stopPropagation()}>
                                <input type="checkbox" className="sr-only peer" checked={isVerified} onChange={(e) => handleToggleStatus(f, e)} disabled={isUpdatingStatus} />
                                <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 shadow-inner"></div>
                            </label>
                            {isUpdatingStatus && <div className="w-3 h-3 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>}
                            </div>

                            <div className="col-span-3 flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                            <button onClick={(e) => openEditFamily(f, e)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Ubah Data KK"><ICONS.Edit /></button>
                            <button onClick={(e) => handleDeleteFamily(f, e)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 hover:scale-110 rounded-lg transition-all" title="Hapus Permanen Seluruh Data KK"><ICONS.Trash /></button>
                            <button onClick={() => setExpandedId(isExpanded ? null : f.id)} className={`p-2 rounded-lg transition-colors ${isExpanded ? 'text-blue-600 bg-blue-50' : 'text-slate-300 hover:text-blue-500'}`} title="Lihat Anggota"><ICONS.Eye /></button>
                            </div>
                        </div>

                        {isExpanded && (
                            <div className="bg-slate-50/40 p-6 border-y border-slate-100 animate-in fade-in slide-in-from-top-2 duration-400">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(f.anggota || []).sort((a,b) => a.hubungan_keluarga === FamilyRelationship.KepalaKeluarga ? -1 : 1).map(a => {
                                    const isDeletingMember = isActionLoading === `delete-member-${a.id}`;
                                    return (
                                    <div key={a.id} className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative group/member transition-all hover:border-blue-200 hover:shadow-md ${isDeletingMember ? 'opacity-40 grayscale' : ''}`}>
                                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover/member:opacity-100 transition-opacity">
                                            <button onClick={(e) => openEditMember(f.id, a, e)} className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><ICONS.Edit /></button>
                                            {a.hubungan_keluarga !== FamilyRelationship.KepalaKeluarga && (
                                            <button onClick={(e) => handleDeleteMember(f.id, a, e)} className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg"><ICONS.Trash /></button>
                                            )}
                                        </div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{a.hubungan_keluarga}</p>
                                        <p className="text-sm font-bold text-slate-800 leading-tight pr-12 truncate">{a.nama_lengkap}</p>
                                        <p className="text-[10px] text-slate-400 font-mono mt-1.5 tracking-tighter">{a.nik}</p>
                                        <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-50">
                                            <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{calculateAge(a.tanggal_lahir)} Tahun</span>
                                            <span className="text-[8px] text-slate-300 uppercase tracking-wide">{a.jenis_kelamin}</span>
                                            </div>
                                            <span className="text-[9px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{a.status_gerejawi}</span>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                            </div>
                        )}
                        </div>
                    );
                    })
                ) : (
                    <div className="p-24 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Data Tidak Ditemukan</p>
                    <button onClick={() => {setSearchTerm(''); setSectorFilter('All'); setStatusFilter('All');}} className="mt-4 text-xs font-bold text-blue-600 hover:underline">Reset Semua Filter</button>
                    </div>
                )}
                </div>
            </div>
        </>
      )}

      {/* --- CONTENT: BIRTHDAY LIST --- */}
      {activeTab === 'birthdays' && (
        <>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Pilih Bulan:</span>
                <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="flex-1 max-w-xs px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {MONTHS.map((m, idx) => (
                        <option key={idx} value={idx}>{m}</option>
                    ))}
                </select>
                <div className="flex-grow text-right text-xs text-slate-400 hidden sm:block">
                   Total yang berulang tahun: <strong>{birthdayMembers.length} Orang</strong>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <div className="col-span-2 md:col-span-1">Tgl</div>
                    <div className="col-span-6 md:col-span-4">Nama Lengkap</div>
                    <div className="col-span-2 md:col-span-2 text-center">Usia</div>
                    <div className="col-span-2 md:col-span-2 hidden md:block">Wilayah</div>
                    <div className="col-span-3 text-right hidden md:block">Status</div>
                </div>
                
                <div className="divide-y divide-slate-100">
                    {birthdayMembers.length > 0 ? (
                        birthdayMembers.map(m => {
                            const date = new Date(m.tanggal_lahir).getDate();
                            return (
                                <div key={m.id} className="grid grid-cols-12 items-center px-6 py-4 hover:bg-blue-50/30 transition-colors">
                                    <div className="col-span-2 md:col-span-1">
                                        <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 font-bold rounded-lg text-sm">{date}</span>
                                    </div>
                                    <div className="col-span-6 md:col-span-4 pr-4">
                                        <p className="text-sm font-bold text-slate-800 truncate">{m.nama_lengkap}</p>
                                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{m.family.nomor_kk}</p>
                                    </div>
                                    <div className="col-span-2 md:col-span-2 text-center">
                                        <span className="text-xs font-semibold text-slate-600">Ke-{m.turningAge}</span>
                                    </div>
                                    <div className="col-span-2 md:col-span-2 hidden md:block">
                                        <span className="text-[10px] px-2 py-1 bg-slate-100 rounded-md font-bold text-slate-500 uppercase">{m.family.wilayah_pelayanan}</span>
                                    </div>
                                    <div className="col-span-3 text-right hidden md:block">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${m.jenis_kelamin === Gender.LakiLaki ? 'text-blue-500' : 'text-pink-500'}`}>
                                            {m.jenis_kelamin}
                                        </span>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <span className="text-4xl mb-2">🎂</span>
                            <p className="text-sm font-bold uppercase tracking-widest">Tidak ada yang ulang tahun di bulan ini</p>
                        </div>
                    )}
                </div>
            </div>
        </>
      )}

      {/* --- CONTENT: SETTINGS --- */}
      {activeTab === 'settings' && currentUser && (
        <div className="max-w-2xl mx-auto">
           <SettingsPanel currentUser={currentUser} onShowNotification={showNotification} />
        </div>
      )}

      <div className="text-center pt-10">
         <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">Sistem Manajemen Jemaat GKO Cibitung &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
