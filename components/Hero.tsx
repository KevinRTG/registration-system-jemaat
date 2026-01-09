
import React from 'react';

interface HeroProps {
  onStartRegistration: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartRegistration }) => {
  const handleInfoGereja = () => {
    alert("Halaman Informasi Gereja akan segera hadir.");
  };

  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse delay-700"></div>
        </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Portal Digital GKO Cibitung
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          Pendataan Jemaat <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Lebih Mudah & Modern</span>
        </h1>
        
        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-slate-500 mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          Bergabunglah dalam pelayanan dan persekutuan. Daftarkan diri dan keluarga Anda ke dalam database jemaat resmi GKO Cibitung secara aman dan terintegrasi.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <button 
            onClick={onStartRegistration}
            className="group relative px-8 py-4 bg-slate-900 text-white text-base font-bold rounded-full shadow-xl shadow-slate-200 hover:shadow-2xl hover:bg-blue-600 transition-all duration-300 active:scale-95"
          >
            Daftar Sekarang
            <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
          </button>
          
          <button 
            onClick={handleInfoGereja}
            className="px-8 py-4 bg-white border border-slate-200 text-slate-700 text-base font-bold rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 active:scale-95"
          >
            Pelajari Lebih Lanjut
          </button>
        </div>

        {/* Stats / Trust Indicator */}
        <div className="mt-16 pt-8 border-t border-slate-200/60 flex justify-center gap-8 md:gap-16 opacity-70 animate-in fade-in duration-1000 delay-500">
            <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">100%</p>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Digital</p>
            </div>
             <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">Aman</p>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Data Privasi</p>
            </div>
             <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">24/7</p>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Akses Online</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
