import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Logo = ({ className }: { className?: string }) => (
  <img src="/logo.png" alt="HANTŌME" className={`object-contain ${className}`} />
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

  // ✨ 메뉴 한글화
  const navItems = [
    { label: '포트폴리오', id: 'work' },
    { label: '소개', id: 'about' },
    { label: '서비스 / 가격', id: 'service' },
    { label: '문의', id: 'contact' },
    { label: '관리자', id: 'admin' },
  ];

  return (
    <>
        <div className={`fixed inset-x-0 top-0 z-[60] flex justify-between items-start px-6 py-8 transition-opacity duration-500 bg-transparent ${isHeroVisible ? 'opacity-100' : 'opacity-0'}`}>
            <a href="#" onClick={handleNavigation('hero')} className="group flex items-center">
                <Logo className="h-6 md:h-7 text-white" />
            </a>
            <div className="hidden md:flex flex-col gap-2.5 items-end">
                {navItems.map((item) => (
                    <a key={item.label} href={`#${item.id}`} onClick={handleNavigation(item.id)} className="group relative px-2 py-1 text-[13px] font-semibold text-white hover:text-main-purple transition-colors tracking-widest">
                        {item.label}
                    </a>
                ))}
            </div>
            <div className="md:hidden">
                <button onClick={() => setIsMobileMenuOpen(true)} className="text-white p-2 bg-black/40 backdrop-blur-sm rounded-full border border-white/10"><Menu className="w-6 h-6" /></button>
            </div>
        </div>

        <div className="fixed top-4 md:top-6 inset-x-0 z-[60] flex justify-center pointer-events-none px-4">
            <div className={`pointer-events-auto bg-[#050505] border border-white/10 rounded-full shadow-2xl px-6 py-3 md:px-8 md:py-4 flex items-center gap-6 transition-all duration-700 ${isHeroVisible ? '-translate-y-[250%] opacity-0' : 'translate-y-0 opacity-100'}`}>
                <a href="#" onClick={handleNavigation('hero')} className="shrink-0"><Logo className="h-4 md:h-5 text-white" /></a>
                <div className="hidden md:flex gap-6 lg:gap-8 items-center">
                    {navItems.map((item) => (
                        <a key={item.label} href={`#${item.id}`} onClick={handleNavigation(item.id)} className="text-[13px] font-semibold text-white hover:text-main-purple tracking-widest">
                            {item.label}
                        </a>
                    ))}
                </div>
                <div className="md:hidden">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="text-white p-1"><Menu className="w-6 h-6" /></button>
                </div>
            </div>
        </div>

        <div className={`fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
            <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-8 right-6 text-white p-2"><X className="w-8 h-8" /></button>
            <div className="flex flex-col gap-8 text-center">
                {navItems.map((item) => (
                    <a key={item.label} href={`#${item.id}`} onClick={handleNavigation(item.id)} className="text-3xl font-bold text-white tracking-widest hover:text-main-purple transition-colors">
                        {item.label}
                    </a>
                ))}
            </div>
        </div>
    </>
  );
};