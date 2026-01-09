
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
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">G</div>
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
                <span>Jl. Raya Cibitung No. 123,<br/>Bekasi, Jawa Barat</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span>(021) 8833-4455</span>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
             <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Tautan</h4>
             <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">Website Utama</a>
                <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">Jadwal Ibadah</a>
                {onNavigate && (
                    <button onClick={() => onNavigate('admin-auth')} className="text-slate-400 hover:text-blue-600 transition-colors">
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
