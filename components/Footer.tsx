
import React from 'react';

interface FooterProps {
  onNavigate?: (page: any) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">

          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0"></div>
                <img
                  src="https://sinodegko.org/wp-content/uploads/2021/08/logo_transparanresize.png"
                  alt="GKO Logo"
                  className="w-10 h-10 rounded-xl object-contain relative z-10"
                />
              </div>
              <span className="text-xl font-bold text-slate-900">GKO Cibitung</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
              Sistem informasi dan pendaftaran jemaat terpadu. Melayani dengan kasih, terhubung dengan teknologi.
            </p>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Kontak</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">📍</span>
                <span>Kampung Tanah Merderka, RT. 09/028, Kel. Wanasari, Kec. Cibitung, <br />Kab.Bekasi, Jawa Barat</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span>+62-812-1052-6051</span>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Tautan</h4>
            <div className="flex flex-col space-y-2">
              <a href="https://sinodegko.org/profil-jemaat/gko-cibitung/" className="text-slate-400 hover:text-blue-600 transition-colors">Website Utama</a>
              <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">Jadwal Ibadah</a>
              {onNavigate && (
                <button onClick={() => onNavigate('admin-auth')} className="text-slate-400 hover:text-blue-600 transition-colors text-left">
                  Portal Admin
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} GKO Cibitung. All rights reserved.</p>
          <p>Developed for internal church use.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
