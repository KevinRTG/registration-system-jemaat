import React from 'react';

interface HeroProps {
  onStartRegistration: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartRegistration }) => {
  const handleInfoGereja = () => {
    alert("Halaman Informasi Gereja akan segera hadir. Saat ini Bapak/Ibu dapat melakukan pendaftaran jemaat melalui portal digital kami.");
  };

  return (
    <div className="relative overflow-hidden bg-slate-50 pt-16 pb-32 lg:pt-24 lg:pb-48">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
          <span className="block mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700">Pendaftaran Online</span>
          <span className="block text-blue-600 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">Gereja GKO Cibitung</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600 sm:text-xl animate-in fade-in duration-1000 delay-300">
          Selamat datang di portal pendaftaran jemaat. Kami mengundang Bapak/Ibu/Saudara untuk bergabung dan melayani bersama di GKO Cibitung melalui pendataan digital yang inklusif dan modern.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <button 
            onClick={onStartRegistration}
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            Daftar Sekarang
          </button>
          <button 
            onClick={handleInfoGereja}
            className="inline-flex items-center justify-center px-8 py-4 border border-slate-200 text-base font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-all active:scale-95"
          >
            Informasi Gereja
          </button>
        </div>
        
        <div className="mt-16 relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-50 text-slate-400 font-medium uppercase tracking-wider">Terdaftar Secara Digital Sejak 2024</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;