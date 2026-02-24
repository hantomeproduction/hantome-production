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
    if (!heroElement) {
        setIsHeroVisible(false);
        return;
    }
    const observer = new IntersectionObserver(([entry]) => { setIsHeroVisible(entry.isIntersecting); }, { threshold: 0.3 });
    observer.observe(heroElement);
    return () => observer.disconnect();
  }, [location.pathname]);

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
        {/* =========================================
            1. Hero 전용 메뉴
            ✨ 배경색 제거(bg-transparent) & 글자 불투명 흰색(text-white) 적용
        ========================================= */}
        <div className={`fixed inset-x-0 top-0 z-40 flex justify-between items-start px-6 py-8 transition-opacity duration-500 bg-transparent ${isHeroVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <a href="#" onClick={handleNavigation('hero')} className="group flex items-center pointer-events-auto">
                <Logo className="h-6 md:h-7 text-white group-hover:text-gray-300 transition-colors duration-300" />
            </a>
            <div className="hidden md:flex flex-col gap-2.5 items-end pointer-events-auto">
                {navItems.map((item) => (
                    <a key={item.label} href={`#${item.id}`} onClick={handleNavigation(item.id)} 
                       className="group relative px-2 py-1 text-xs md:text-[13px] font-mono font-semibold text-white hover:text-gray-300 transition-colors duration-300 uppercase tracking-widest">
                        <span className="relative z-10">{item.label}</span>
                        <span className="absolute right-0 bottom-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
                    </a>
                ))}
            </div>
            <div className="md:hidden pointer-events-auto">
                <button onClick={() => setIsMobileMenuOpen(true)} className="text-white p-2 bg-white/10 rounded-full"><Menu className="w-5 h-5" /></button>
            </div>
        </div>

        {/* 캡슐 메뉴: 불투명 배경 유지(모양을 잡아줘야 하니까!) */}
        <div className="fixed top-4 md:top-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
            <div className={`pointer-events-auto bg-[#050505] border border-white/10 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.8)] px-6 py-3 md:px-8 md:py-4 flex items-center gap-6 lg:gap-8 transition-transform duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${isHeroVisible ? '-translate-y-[250%]' : 'translate-y-0'}`}>
                <a href="#" onClick={handleNavigation('hero')} className="group flex items-center shrink-0">
                    <Logo className="h-4 md:h-5 text-white group-hover:text-green-500 transition-colors duration-300" />
                </a>
                <div className="hidden md:flex gap-6 lg:gap-8 items-center">
                    {navItems.map((item) => (
                        <a key={item.label} href={`#${item.id}`} onClick={handleNavigation(item.id)} 
                           className="group relative text-xs md:text-[13px] font-mono font-semibold text-white hover:text-green-500 transition-colors duration-300 uppercase tracking-widest">
                            <span className="relative z-10">{item.label}</span>
                            <span className="absolute left-0 bottom-[-6px] w-0 h-[1px] bg-green-500 transition-all duration-300 group-hover:w-full"></span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    </>
  );
};