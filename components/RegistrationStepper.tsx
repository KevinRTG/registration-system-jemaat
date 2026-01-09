
import React, { useState } from 'react';
import { STEPS, ICONS } from '../constants';
import { Gender, FamilyRelationship, ChurchStatus, ServiceSector, Jemaat, Keluarga, VerificationStatus, User, MaritalStatus, BloodType } from '../types';
import { apiService } from '../services/api';

interface RegistrationStepperProps {
  onComplete: (newNik?: string) => void;
  currentUser: User | null;
  onShowNotification: (msg: string, type: 'success' | 'error') => void;
}

const RegistrationStepper: React.FC<RegistrationStepperProps> = ({ onComplete, currentUser, onShowNotification }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [kkData, setKkData] = useState({
    nomor_kk: '',
    alamat_kk: '',
    wilayah_pelayanan: ServiceSector.Belum,
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
      tanggal_lahir: '',
      status_pernikahan: MaritalStatus.Menikah,
      golongan_darah: BloodType.Unknown,
      pekerjaan: '',
      nomor_telepon: '',
      email: '',
      alamat_domisili: '',
      catatan_pelayanan: ''
    }
  ]);

  const [agreement, setAgreement] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- LOGIC HELPERS ---
  const copyAddressToMember = (index: number) => {
    const newAnggota = [...anggota];
    newAnggota[index] = { ...newAnggota[index], alamat_domisili: kkData.alamat_kk };
    setAnggota(newAnggota);
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
      tanggal_lahir: '',
      status_pernikahan: MaritalStatus.BelumMenikah,
      golongan_darah: BloodType.Unknown
    }]);
  };

  const removeAnggota = (index: number) => {
    if (anggota[index].hubungan_keluarga === FamilyRelationship.KepalaKeluarga) {
      alert("Kepala Keluarga tidak boleh dihapus!");
      return;
    }
    setAnggota(anggota.filter((_, i) => i !== index));
  };

  const handleKkChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setKkData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleAnggotaChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newAnggota = [...anggota];
    newAnggota[index] = { ...newAnggota[index], [name]: value };
    setAnggota(newAnggota);
    if (errors[`${name}_${index}`]) setErrors(prev => ({ ...prev, [`${name}_${index}`]: '' }));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!kkData.nomor_kk || kkData.nomor_kk.length !== 16) newErrors.nomor_kk = 'Nomor KK harus 16 digit.';
      if (!kkData.alamat_kk || kkData.alamat_kk.trim().length < 5) newErrors.alamat_kk = 'Alamat wajib diisi.';
    } else if (step === 2) {
      anggota.forEach((person, idx) => {
        if (!person.nama_lengkap) newErrors[`nama_lengkap_${idx}`] = 'Wajib diisi.';
        if (!person.nik || person.nik.length !== 16) newErrors[`nik_${idx}`] = 'Wajib 16 digit.';
        if (!person.tempat_lahir) newErrors[`tempat_lahir_${idx}`] = 'Wajib diisi.';
        if (!person.tanggal_lahir) newErrors[`tanggal_lahir_${idx}`] = 'Wajib diisi.';
      });
    } else if (step === 3 && !agreement) {
      alert('Anda harus menyetujui pernyataan data.');
      return false;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => validateStep(currentStep) && setCurrentStep(p => Math.min(3, p + 1));
  const prevStep = () => setCurrentStep(p => Math.max(1, p - 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    if (!currentUser) { onShowNotification('Sesi habis. Login ulang.', 'error'); return; }

    setIsSubmitting(true);
    try {
      const newKeluarga: Keluarga = {
        id: '', 
        ...kkData,
        anggota: anggota as Jemaat[],
        registrationDate: new Date().toISOString(),
        status: VerificationStatus.Pending
      };
      await apiService.families.create(newKeluarga);
      await apiService.auth.updateProfile(currentUser.id, { nik_kk: kkData.nomor_kk });
      onShowNotification('Pendaftaran Berhasil!', 'success');
      onComplete(kkData.nomor_kk);
    } catch (error: any) {
      onShowNotification(error.message || 'Gagal menyimpan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // UI Styles
  const inputContainer = "space-y-1.5";
  const labelStyle = "block text-xs font-bold text-slate-500 uppercase tracking-wide ml-1";
  const inputStyle = (hasError: boolean) => `w-full px-4 py-3 bg-white border ${hasError ? 'border-red-500 ring-1 ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'} rounded-xl outline-none transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400`;

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden max-w-5xl mx-auto">
      {/* Progress Header */}
      <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-6 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[300px] max-w-2xl mx-auto relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded-full"></div>
          {STEPS.map((step) => {
             const isActive = currentStep === step.id;
             const isDone = currentStep > step.id;
             return (
              <div key={step.id} className="flex flex-col items-center group cursor-default">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-4 ${isActive ? 'bg-blue-600 text-white border-blue-100 scale-110 shadow-lg shadow-blue-200' : isDone ? 'bg-green-500 text-white border-green-100' : 'bg-white text-slate-400 border-slate-100'}`}>
                  {isDone ? '✓' : step.id}
                </div>
                <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>{step.title}</span>
              </div>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-10 min-h-[400px]">
        {/* STEP 1: KK */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center pb-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800">Identitas Kartu Keluarga</h3>
                <p className="text-sm text-slate-500">Masukkan data sesuai dokumen Kartu Keluarga asli.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={inputContainer}>
                <label className={labelStyle}>Nomor KK</label>
                <input type="text" name="nomor_kk" maxLength={16} value={kkData.nomor_kk} onChange={handleKkChange} className={inputStyle(!!errors.nomor_kk)} placeholder="16 Digit Angka" />
                {errors.nomor_kk && <p className="text-xs text-red-500 font-medium ml-1">{errors.nomor_kk}</p>}
              </div>
              <div className={inputContainer}>
                <label className={labelStyle}>Wilayah Pelayanan</label>
                <select name="wilayah_pelayanan" value={kkData.wilayah_pelayanan} onChange={handleKkChange} className={inputStyle(false)}>
                  {Object.values(ServiceSector).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className={`col-span-1 md:col-span-2 ${inputContainer}`}>
                <label className={labelStyle}>Alamat Lengkap</label>
                <textarea name="alamat_kk" rows={3} value={kkData.alamat_kk} onChange={handleKkChange} className={inputStyle(!!errors.alamat_kk)} placeholder="Nama Jalan, RT/RW, Kelurahan, Kecamatan..." />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ANGGOTA */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4 border-b border-slate-100">
                <div>
                   <h3 className="text-xl font-bold text-slate-800">Daftar Anggota Keluarga</h3>
                   <p className="text-sm text-slate-500">Isi data untuk setiap anggota keluarga yang terdaftar di KK.</p>
                </div>
                <button type="button" onClick={addAnggota} className="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl text-sm hover:bg-blue-100 transition-colors flex items-center gap-2">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                   Tambah Anggota
                </button>
            </div>
            
            <div className="space-y-6">
              {anggota.map((person, index) => (
                <div key={person.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 relative group transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-100 hover:border-blue-200">
                  <div className="absolute top-4 right-4 flex gap-2">
                     <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded uppercase">Anggota #{index + 1}</span>
                     {person.hubungan_keluarga !== FamilyRelationship.KepalaKeluarga && (
                        <button type="button" onClick={() => removeAnggota(index)} className="text-slate-400 hover:text-red-500 transition-colors p-0.5"><ICONS.Trash /></button>
                     )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-2">
                    {/* Basic Info */}
                    <div className="md:col-span-3 space-y-1">
                      <label className={labelStyle}>Nama Lengkap</label>
                      <input type="text" name="nama_lengkap" value={person.nama_lengkap || ''} onChange={(e) => handleAnggotaChange(index, e)} className={inputStyle(!!errors[`nama_lengkap_${index}`])} />
                    </div>
                    <div className="md:col-span-3 space-y-1">
                       <label className={labelStyle}>NIK</label>
                       <input type="text" name="nik" maxLength={16} value={person.nik || ''} onChange={(e) => handleAnggotaChange(index, e)} className={inputStyle(!!errors[`nik_${index}`])} />
                    </div>

                    {/* Birth Info */}
                    <div className="md:col-span-2 space-y-1">
                      <label className={labelStyle}>Tempat Lahir</label>
                      <input type="text" name="tempat_lahir" value={person.tempat_lahir || ''} onChange={(e) => handleAnggotaChange(index, e)} className={inputStyle(!!errors[`tempat_lahir_${index}`])} />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className={labelStyle}>Tanggal Lahir</label>
                      <input type="date" name="tanggal_lahir" value={person.tanggal_lahir || ''} onChange={(e) => handleAnggotaChange(index, e)} className={inputStyle(!!errors[`tanggal_lahir_${index}`])} />
                    </div>
                     <div className="md:col-span-2 space-y-1">
                      <label className={labelStyle}>Jenis Kelamin</label>
                      <select name="jenis_kelamin" value={person.jenis_kelamin} onChange={(e) => handleAnggotaChange(index, e)} className={inputStyle(false)}>
                        <option value={Gender.LakiLaki}>Laki-laki</option>
                        <option value={Gender.Perempuan}>Perempuan</option>
                      </select>
                    </div>

                    {/* Status Info */}
                    <div className="md:col-span-2 space-y-1">
                      <label className={labelStyle}>Hubungan Keluarga</label>
                      <select name="hubungan_keluarga" value={person.hubungan_keluarga} onChange={(e) => handleAnggotaChange(index, e)} className={inputStyle(false)} disabled={person.hubungan_keluarga === FamilyRelationship.KepalaKeluarga}>
                        {Object.values(FamilyRelationship).map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                     <div className="md:col-span-2 space-y-1">
                      <label className={labelStyle}>Status Gerejawi</label>
                      <select name="status_gerejawi" value={person.status_gerejawi} onChange={(e) => handleAnggotaChange(index, e)} className={inputStyle(false)}>
                        {Object.values(ChurchStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                     <div className="md:col-span-2 space-y-1">
                      <label className={labelStyle}>Status Pernikahan</label>
                      <select name="status_pernikahan" value={person.status_pernikahan} onChange={(e) => handleAnggotaChange(index, e)} className={inputStyle(false)}>
                        {Object.values(MaritalStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    {/* Contact & Address */}
                    <div className="md:col-span-6 space-y-1">
                       <div className="flex justify-between">
                          <label className={labelStyle}>Alamat Domisili</label>
                          <button type="button" onClick={() => copyAddressToMember(index)} className="text-[10px] text-blue-600 font-bold hover:underline">Samakan dengan KK</button>
                       </div>
                       <input type="text" name="alamat_domisili" value={person.alamat_domisili || ''} onChange={(e) => handleAnggotaChange(index, e)} className={inputStyle(false)} placeholder="Isi jika berbeda dengan alamat KK" />
                    </div>
                    
                    {/* Extras */}
                     <div className="md:col-span-3 space-y-1">
                       <label className={labelStyle}>No. HP / WA</label>
                       <input type="text" name="nomor_telepon" value={person.nomor_telepon || ''} onChange={(e) => handleAnggotaChange(index, e)} className={inputStyle(false)} />
                    </div>
                     <div className="md:col-span-3 space-y-1">
                       <label className={labelStyle}>Pekerjaan</label>
                       <input type="text" name="pekerjaan" value={person.pekerjaan || ''} onChange={(e) => handleAnggotaChange(index, e)} className={inputStyle(false)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRM */}
        {currentStep === 3 && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in duration-500">
             <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">✓</div>
                <h3 className="text-2xl font-bold text-slate-800">Konfirmasi Data</h3>
                <p className="text-slate-500">Pastikan semua data sudah benar sebelum dikirim.</p>
             </div>

             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                   <div>
                      <dt className="text-xs font-bold text-slate-400 uppercase">Nomor KK</dt>
                      <dd className="text-lg font-bold text-slate-800 font-mono">{kkData.nomor_kk}</dd>
                   </div>
                   <div>
                      <dt className="text-xs font-bold text-slate-400 uppercase">Wilayah</dt>
                      <dd className="text-lg font-bold text-slate-800">{kkData.wilayah_pelayanan}</dd>
                   </div>
                   <div className="sm:col-span-2">
                      <dt className="text-xs font-bold text-slate-400 uppercase">Alamat</dt>
                      <dd className="text-base font-medium text-slate-700">{kkData.alamat_kk}</dd>
                   </div>
                   <div className="sm:col-span-2 pt-4 border-t border-slate-200">
                      <dt className="text-xs font-bold text-slate-400 uppercase mb-2">Anggota Terdaftar ({anggota.length})</dt>
                      <ul className="space-y-2">
                         {anggota.map((a, i) => (
                            <li key={i} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100">
                               <span className="font-semibold text-slate-700">{a.nama_lengkap}</span>
                               <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">{a.hubungan_keluarga}</span>
                            </li>
                         ))}
                      </ul>
                   </div>
                </dl>
             </div>

             <div className={`p-4 rounded-xl border transition-all ${agreement ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                <label className="flex items-start gap-3 cursor-pointer">
                   <input type="checkbox" className="mt-1 w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" checked={agreement} onChange={(e) => setAgreement(e.target.checked)} />
                   <span className="text-sm text-slate-700 leading-relaxed">
                      Saya menyatakan bahwa data yang saya isi adalah benar dan dapat dipertanggungjawabkan sesuai dengan dokumen kependudukan yang berlaku.
                   </span>
                </label>
             </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center">
          <button type="button" onClick={prevStep} disabled={currentStep === 1} className={`px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors ${currentStep === 1 ? 'invisible' : ''}`}>
             ← Kembali
          </button>
          
          {currentStep < 3 ? (
             <button type="button" onClick={nextStep} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-200 hover:bg-blue-600 hover:shadow-blue-200 transition-all active:scale-95">
                Lanjut Tahap {currentStep + 1}
             </button>
          ) : (
             <button type="submit" disabled={isSubmitting || !agreement} className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {isSubmitting ? 'Mengirim Data...' : 'Kirim Pendaftaran'}
             </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RegistrationStepper;
