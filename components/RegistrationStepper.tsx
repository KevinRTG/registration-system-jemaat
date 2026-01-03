
import React, { useState } from 'react';
import { STEPS, ICONS } from '../constants';
import { Gender, FamilyRelationship, ChurchStatus, ServiceSector, Jemaat, Keluarga, VerificationStatus, User } from '../types';
import { apiService } from '../services/api';

interface RegistrationStepperProps {
  onComplete: (newNik?: string) => void;
  currentUser: User | null;
}

const RegistrationStepper: React.FC<RegistrationStepperProps> = ({ onComplete, currentUser }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [kkData, setKkData] = useState({
    nomor_kk: '',
    alamat_kk: '',
    wilayah_pelayanan: ServiceSector.A,
  });
  
  const [anggota, setAnggota] = useState<Partial<Jemaat>[]>([
    { 
      id: Math.random().toString(36).substr(2, 9),
      hubungan_keluarga: FamilyRelationship.KepalaKeluarga,
      jenis_kelamin: Gender.LakiLaki,
      status_gerejawi: ChurchStatus.Belum,
      nama_lengkap: '',
      nik: '',
      tempat_lahir: '',
      tanggal_lahir: ''
    }
  ]);

  const [agreement, setAgreement] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(3, prev + 1));
    }
  };

  const handleKkChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setKkData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAnggotaChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newAnggota = [...anggota];
    newAnggota[index] = { ...newAnggota[index], [name]: value };
    setAnggota(newAnggota);
    
    const errKey = `${name}_${index}`;
    if (errors[errKey]) setErrors(prev => ({ ...prev, [errKey]: '' }));
  };

  const addAnggota = () => {
    setAnggota([...anggota, { 
      id: Math.random().toString(36).substr(2, 9),
      hubungan_keluarga: FamilyRelationship.Anak,
      jenis_kelamin: Gender.LakiLaki,
      status_gerejawi: ChurchStatus.Belum,
      nama_lengkap: '',
      nik: '',
      tempat_lahir: '',
      tanggal_lahir: ''
    }]);
  };

  const removeAnggota = (index: number) => {
    if (anggota[index].hubungan_keluarga === FamilyRelationship.KepalaKeluarga) {
      alert("Kepala Keluarga tidak boleh dihapus!");
      return;
    }
    setAnggota(anggota.filter((_, i) => i !== index));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!kkData.nomor_kk || kkData.nomor_kk.length !== 16) newErrors.nomor_kk = 'Nomor KK harus tepat 16 digit.';
      if (!kkData.alamat_kk || kkData.alamat_kk.trim().length < 5) newErrors.alamat_kk = 'Alamat KK terlalu pendek.';
    } else if (step === 2) {
      anggota.forEach((person, idx) => {
        if (!person.nama_lengkap || person.nama_lengkap.trim().length < 2) newErrors[`nama_lengkap_${idx}`] = 'Nama tidak valid.';
        if (!person.nik || person.nik.length !== 16) newErrors[`nik_${idx}`] = 'NIK harus 16 digit.';
        if (!person.tempat_lahir) newErrors[`tempat_lahir_${idx}`] = 'Tempat lahir wajib.';
        if (!person.tanggal_lahir) newErrors[`tanggal_lahir_${idx}`] = 'Tanggal lahir wajib.';
      });
    } else if (step === 3) {
      if (!agreement) {
        alert('Anda harus menyetujui pernyataan kebenaran data.');
        return false;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    if (!currentUser) {
      alert('Sesi Anda habis. Silakan login kembali.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newKeluarga: Keluarga = {
        id: '', 
        ...kkData,
        anggota: anggota as Jemaat[],
        registrationDate: new Date().toISOString(),
        status: VerificationStatus.Pending
      };

      // 1. Simpan data keluarga
      await apiService.families.create(newKeluarga);

      // 2. Update profile user dengan NIK KK yang baru didaftarkan
      await apiService.auth.updateProfile(currentUser.id, { nik_kk: kkData.nomor_kk });

      alert('Pendaftaran Berhasil! Data Anda telah masuk ke sistem dan menunggu verifikasi admin.');
      
      // 3. Panggil callback dengan NIK baru agar App.tsx bisa update state
      onComplete(kkData.nomor_kk);
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat menyimpan pendaftaran. Mohon cek koneksi Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-100 px-8 py-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
          {STEPS.map((step) => (
            <div key={step.id} className="flex flex-col items-center bg-slate-50 px-2 z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${currentStep === step.id ? 'bg-blue-600 text-white ring-4 ring-blue-100' : currentStep > step.id ? 'bg-green-500 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                {currentStep > step.id ? <ICONS.Check /> : step.id}
              </div>
              <span className={`mt-2 text-xs font-semibold ${currentStep === step.id ? 'text-blue-600' : 'text-slate-400'}`}>{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-xl font-bold text-slate-800">Langkah 1: Identitas Kartu Keluarga</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Nomor KK (16 Digit)</label>
                <input 
                  type="text" name="nomor_kk" maxLength={16} value={kkData.nomor_kk} onChange={handleKkChange}
                  className={`w-full p-3 bg-white text-slate-900 border ${errors.nomor_kk ? 'border-red-500 bg-red-50' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400`}
                  placeholder="3275..."
                />
                {errors.nomor_kk && <p className="text-xs text-red-500 font-medium">{errors.nomor_kk}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Wilayah Pelayanan</label>
                <select 
                  name="wilayah_pelayanan" value={kkData.wilayah_pelayanan} onChange={handleKkChange}
                  className="w-full p-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  {Object.values(ServiceSector).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Alamat Lengkap (Sesuai KK)</label>
              <textarea 
                name="alamat_kk" value={kkData.alamat_kk} onChange={handleKkChange}
                rows={3} className={`w-full p-3 bg-white text-slate-900 border ${errors.alamat_kk ? 'border-red-500 bg-red-50' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400`}
                placeholder="Contoh: Perumahan Citra Indah Blok A No. 1..."
              />
              {errors.alamat_kk && <p className="text-xs text-red-500 font-medium">{errors.alamat_kk}</p>}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Langkah 2: Data Anggota Keluarga</h3>
              <button 
                type="button" onClick={addAnggota}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center bg-blue-50 px-4 py-2 rounded-lg transition-colors"
              >
                + Tambah Anggota
              </button>
            </div>
            
            <div className="space-y-6">
              {anggota.map((person, index) => (
                <div key={person.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 relative group transition-all hover:border-blue-200 hover:bg-white shadow-sm hover:shadow-md">
                  {person.hubungan_keluarga !== FamilyRelationship.KepalaKeluarga && (
                    <button 
                      type="button" onClick={() => removeAnggota(index)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                      title="Hapus Anggota"
                    >
                      <ICONS.Trash />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Lengkap</label>
                      <input 
                        type="text" name="nama_lengkap" value={person.nama_lengkap || ''} onChange={(e) => handleAnggotaChange(index, e)}
                        className={`w-full p-2 bg-white text-slate-900 border ${errors[`nama_lengkap_${index}`] ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm placeholder:text-slate-400`}
                        placeholder="Sesuai KTP/Akte"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">NIK</label>
                      <input 
                        type="text" name="nik" maxLength={16} value={person.nik || ''} onChange={(e) => handleAnggotaChange(index, e)}
                        className={`w-full p-2 bg-white text-slate-900 border ${errors[`nik_${index}`] ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm placeholder:text-slate-400`}
                        placeholder="16 digit NIK"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Hubungan</label>
                      <select 
                        name="hubungan_keluarga" value={person.hubungan_keluarga} onChange={(e) => handleAnggotaChange(index, e)}
                        className="w-full p-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:text-slate-500"
                        disabled={person.hubungan_keluarga === FamilyRelationship.KepalaKeluarga}
                      >
                        {Object.values(FamilyRelationship).map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Tempat Lahir</label>
                      <input 
                        type="text" name="tempat_lahir" value={person.tempat_lahir || ''} onChange={(e) => handleAnggotaChange(index, e)}
                        className={`w-full p-2 bg-white text-slate-900 border ${errors[`tempat_lahir_${index}`] ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm placeholder:text-slate-400`}
                        placeholder="Kota Lahir"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Tgl Lahir</label>
                      <input 
                        type="date" name="tanggal_lahir" value={person.tanggal_lahir || ''} onChange={(e) => handleAnggotaChange(index, e)}
                        className={`w-full p-2 bg-white text-slate-900 border ${errors[`tanggal_lahir_${index}`] ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Gender</label>
                      <select 
                        name="jenis_kelamin" value={person.jenis_kelamin} onChange={(e) => handleAnggotaChange(index, e)}
                        className="w-full p-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm"
                      >
                        <option value={Gender.LakiLaki}>Laki-laki</option>
                        <option value={Gender.Perempuan}>Perempuan</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Status Gerejawi</label>
                      <select 
                        name="status_gerejawi" value={person.status_gerejawi} onChange={(e) => handleAnggotaChange(index, e)}
                        className="w-full p-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm"
                      >
                        {Object.values(ChurchStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 animate-in zoom-in duration-500">
            <h3 className="text-xl font-bold text-slate-800">Langkah 3: Konfirmasi Pendaftaran</h3>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Nomor Kartu Keluarga</span>
                <span className="font-bold text-slate-800">{kkData.nomor_kk}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Wilayah Pelayanan</span>
                <span className="font-bold text-slate-800">{kkData.wilayah_pelayanan}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Total Anggota Terdaftar</span>
                <span className="font-bold text-slate-800">{anggota.length} Orang</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block mb-2">Alamat Keluarga</span>
                <p className="text-slate-700 text-sm leading-relaxed italic">"{kkData.alamat_kk}"</p>
              </div>
            </div>
            
            <div className={`flex items-start space-x-3 p-4 rounded-xl transition-all ${agreement ? 'bg-green-50 border border-green-100' : 'bg-blue-50 border border-blue-100'}`}>
              <input 
                type="checkbox" 
                id="terms" 
                checked={agreement}
                onChange={(e) => setAgreement(e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 rounded cursor-pointer" 
              />
              <label htmlFor="terms" className="text-sm text-slate-700 leading-relaxed cursor-pointer select-none">
                <strong>Pernyataan:</strong> Saya menyatakan bahwa seluruh data yang diisi adalah benar sesuai dokumen asli. Saya bersedia dikonfirmasi oleh Sekretariat GKO Cibitung jika diperlukan.
              </label>
            </div>
          </div>
        )}

        <div className="mt-12 flex items-center justify-between gap-4">
          <button 
            type="button" 
            onClick={prevStep}
            className={`px-8 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl transition-all ${currentStep === 1 ? 'invisible' : 'hover:bg-slate-50 active:scale-95'}`}
          >
            Sebelumnya
          </button>
          
          {currentStep < 3 ? (
            <button 
              type="button" onClick={nextStep}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              Lanjutkan
            </button>
          ) : (
            <button 
              type="submit" disabled={isSubmitting || !agreement}
              className="flex-1 px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Menyimpan...
                </>
              ) : 'Kirim Pendaftaran Resmi'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RegistrationStepper;
