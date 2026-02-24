import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Logo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M115 2 H10 L2 10 V30 L10 38 H25" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
    <path d="M45 38 H150 L158 30 V10 L150 2 H135" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    <rect x="123" y="0" width="3" height="3" fill="currentColor" />
    <rect x="33" y="37" width="3" height="3" fill="currentColor" />
    <text x="80" y="27" fontSize="20" fontWeight="700" fontFamily="Inter, system-ui, sans-serif" textAnchor="middle" fill="currentColor" letterSpacing="1.5">
      HANTŌME
    </text>
  </svg>
);

export const Navbar: React.FC = () => {
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const heroElement = document.getElementById('hero');
    if (!heroElement) { setIsHeroVisible(false); return; }
    const observer = new IntersectionObserver(([entry]) => { setIsHeroVisible(entry.isIntersecting); }, { threshold: 0.3 });
    observer.observe(heroElement);
    return () => observer.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isMobileMenuOpen]);

  const handleNavigation = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (id === 'admin') { navigate('/admin'); return; }
    if (id === 'hero') {
      if (location.pathname !== '/') navigate('/');
      else document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (location.pathname !== '/') navigate('/', { state: { scrollTo: id } });
    else {
      const element = document.getElementById(id);
      if (element) { setTimeout(() => { element.scrollIntoView({ behavior: 'smooth' }); }, 100); }
    }
  };

  const navItems = [
    { label: 'PORTFOLIO', id: 'work' },
    { label: 'ABOUT US', id: 'about' },
    { label: 'SERVICE / PRICE', id: 'service' },
    { label: 'CONTACT', id: 'contact' },
    { label: 'ADMIN', id: 'admin' },
  ];

  return (
    <>
        {/* ✨ 1. Hero 상단 메뉴 (모바일 햄버거 메뉴 복구) */}
        <div className={`fixed inset-x-0 top-0 z-[60] flex justify-between items-start px-6 py-8 transition-opacity duration-500 bg-transparent ${isHeroVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <a href="#" onClick={handleNavigation('hero')} className="group flex items-center">
                <Logo className="h-6 md:h-7 text-white" />
            </a>
            <div className="hidden md:flex flex-col gap-2.5 items-end">
                {navItems.map((item) => (
                    <a key={item.label} href={`#${item.id}`} onClick={handleNavigation(item.id)} className="group relative px-2 py-1 text-[13px] font-mono font-semibold text-white hover:text-gray-300 transition-colors uppercase tracking-widest">
                        <span className="relative z-10">{item.label}</span>
                    </a>
                ))}
            </div>
            {/* ✨ 히어로 섹션 전 전용 햄버거 버튼 */}
            <div className="md:hidden">
                <button onClick={() => setIsMobileMenuOpen(true)} className="text-white p-2 bg-black/40 backdrop-blur-sm rounded-full border border-white/10 active:scale-95 transition-transform">
                    <Menu className="w-6 h-6" />
                </button>
            </div>
        </div>

        {/* ✨ 2. 스크롤 시 나타나는 캡슐 메뉴 (모바일 햄버거 메뉴 항상 표시) */}
        <div className="fixed top-4 md:top-6 inset-x-0 z-[60] flex justify-center pointer-events-none px-4">
            <div className={`pointer-events-auto bg-[#050505] border border-white/10 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.8)] px-6 py-3 md:px-8 md:py-4 flex items-center gap-6 transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${isHeroVisible ? '-translate-y-[250%] opacity-0' : 'translate-y-0 opacity-100'}`}>
                <a href="#" onClick={handleNavigation('hero')} className="shrink-0"><Logo className="h-4 md:h-5 text-white" /></a>
                <div className="hidden md:flex gap-6 lg:gap-8 items-center">
                    {navItems.map((item) => (
                        <a key={item.label} href={`#${item.id}`} onClick={handleNavigation(item.id)} className="text-[13px] font-mono font-semibold text-white hover:text-green-500 uppercase tracking-widest">
                            {item.label}
                        </a>
                    ))}
                </div>
                {/* ✨ 캡슐 메뉴 전용 햄버거 버튼 (스크롤 후에도 유지) */}
                <div className="md:hidden">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="text-white p-1 active:scale-95 transition-transform">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>

        {/* 3. 모바일 전체화면 메뉴 레이어 (z-index 최상위) */}
        <div className={`fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
            <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-8 right-6 text-white p-2 active:scale-90 transition-transform"><X className="w-8 h-8" /></button>
            <div className="flex flex-col gap-8 text-center">
                {navItems.map((item, index) => (
                    <a key={item.label} href={`#${item.id}`} onClick={handleNavigation(item.id)} className="text-3xl font-light text-white uppercase tracking-widest">
                        <span className="text-sm font-mono text-gray-500 block mb-2 tracking-widest">0{index + 1}</span>
                        {item.label}
                    </a>
                ))}
            </div>
        </div>
    </>
  );
};