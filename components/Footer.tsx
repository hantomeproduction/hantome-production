import React from 'react';

const Logo = ({ className }: { className?: string }) => (
  <img src="/logo.png" alt="HANTŌME" className={`object-contain ${className}`} />
);

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#050505] border-t border-white/10 text-white py-12 relative z-10">
        <div className="max-w-[1920px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                <div className="space-y-4">
                    <div className="flex flex-col">
                        {/* ✨ 텍스트 대신 로고 이미지 삽입 */}
                        <Logo className="h-8 md:h-10 w-fit" />
                        <span className="text-[10px] text-main-purple font-mono tracking-widest uppercase mt-2">Production</span>
                    </div>
                    <p className="text-xs text-gray-400 font-light max-w-xs leading-relaxed opacity-60">
                        우리는 정의되지 않은 가능성을 탐구합니다.<br/>
                        버추얼 아티스트를 위한 크리에이티브 프로덕션.
                    </p>
                </div>

                <div className="flex flex-col items-start md:items-end gap-4">
                    <div className="flex gap-6">
                         <a href="#" className="text-[10px] font-mono text-gray-500 hover:text-main-purple transition-colors uppercase tracking-wider">이용약관</a>
                         <a href="#" className="text-[10px] font-mono text-gray-500 hover:text-main-purple transition-colors uppercase tracking-wider">개인정보처리방침</a>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                            © {currentYear} 한토메 프로덕션.<br/>ALL RIGHTS RESERVED.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </footer>
  );
};