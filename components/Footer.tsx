import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#050505] border-t border-white/10 text-white py-12 relative z-10">
        <div className="max-w-[1920px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                {/* Brand Info */}
                <div className="space-y-4">
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold tracking-tighter text-white">HANTŌME</span>
                        <span className="text-xs text-gray-500 font-mono tracking-widest uppercase">Production</span>
                    </div>
                    <p className="text-xs text-gray-400 font-light max-w-xs leading-relaxed opacity-60">
                        We define the undefined.<br/>
                        Virtual Artist Management & Creative Production.
                    </p>
                </div>

                {/* Legal / Copyright */}
                <div className="flex flex-col items-start md:items-end gap-4">
                    <div className="flex gap-6">
                         <a href="#" className="text-[10px] font-mono text-gray-500 hover:text-white transition-colors uppercase tracking-wider">Terms of Service</a>
                         <a href="#" className="text-[10px] font-mono text-gray-500 hover:text-white transition-colors uppercase tracking-wider">Privacy Policy</a>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                            © {currentYear} HANTŌME PRODUCTION.<br/>ALL RIGHTS RESERVED.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </footer>
  );
};