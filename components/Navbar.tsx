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

    const observer = new IntersectionObserver(
        ([entry]) => {
            setIsHeroVisible(entry.isIntersecting);
        },
        { threshold: 0.3 }
    );

    observer.observe(heroElement);
    return () => observer.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const handleNavigation = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (id === 'admin') {
      navigate('/admin');
      return;
    }

    if (id === 'hero') {
      if (location.pathname !== '/') navigate('/');
      else document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: id } });
    } else {
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => { element.scrollIntoView({ behavior: 'smooth' }); }, 100); 
      }
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
            1. Hero 전용 (양옆으로 갈라지는 메뉴)
        ========================================= */}
        <div className={`fixed inset-x-0 top-0 z-40 pointer-events-none flex justify-between items-start px-6 py-8 mix-blend-difference overflow-hidden`}>
            
            <div className={`pointer-events-auto transition-all duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${isHeroVisible ? 'translate-x-0 opacity-100' : '-translate-x-[200%] opacity-0'}`}>
                <a href="#" onClick={handleNavigation('hero')} className="group flex items-center">
                    <Logo className="h-6 md:h-7 text-white group-hover:text-gray-300 transition-colors duration-300" />
                </a>
            </div>
            
            <div className={`hidden md:flex flex-col gap-2.5 items-end pointer-events-auto transition-all duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${isHeroVisible ? 'translate-x-0 opacity-100' : 'translate-x-[200%] opacity-0'}`}>
                {navItems.map((item) => (
                    <a 
                        key={item.label}
                        href={item.id === 'admin' ? '/admin' : `#${item.id}`}
                        onClick={handleNavigation(item.id)}
                        // ✨ 글씨 크기 증가 (text-[13px]) & 굵기 증가 (font-semibold)
                        className="group relative px-2 py-1 text-xs md:text-[13px] font-mono font-semibold text-gray-400 hover:text-white transition-colors duration-300 uppercase tracking-widest"
                    >
                        <span className="relative z-10">{item.label}</span>
                        <span className="absolute right-0 bottom-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
                    </a>
                ))}
            </div>

            <div className={`md:hidden pointer-events-auto transition-all duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${isHeroVisible ? 'translate-x-0 opacity-100' : 'translate-x-[200%] opacity-0'}`}>
                <button onClick={() => setIsMobileMenuOpen(true)} className="text-white hover:text-gray-300 transition-colors p-2 -mr-2 bg-black/20 backdrop-blur-sm rounded-full">
                    <Menu className="w-5 h-5" />
                </button>
            </div>
        </div>


        {/* =========================================
            2. 2페이지부터 전용 (중앙 캡슐형 메뉴)
        ========================================= */}
        <div className="fixed top-4 md:top-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
            
            <div className={`pointer-events-auto bg-[#050505]/80 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] px-6 py-3 md:px-8 md:py-4 flex items-center gap-6 lg:gap-8 transition-transform duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${isHeroVisible ? '-translate-y-[250%]' : 'translate-y-0'}`}>
                
                <a href="#" onClick={handleNavigation('hero')} className="group flex items-center shrink-0">
                    <Logo className="h-4 md:h-5 text-white group-hover:text-green-500 transition-colors duration-300" />
                </a>

                <div className="hidden md:flex gap-6 lg:gap-8 items-center">
                    {navItems.map((item) => (
                        <a 
                            key={item.label}
                            href={item.id === 'admin' ? '/admin' : `#${item.id}`}
                            onClick={handleNavigation(item.id)}
                            // ✨ 글씨 크기 증가 (text-[13px]) & 굵기 증가 (font-semibold)
                            className="group relative text-xs md:text-[13px] font-mono font-semibold text-gray-400 hover:text-white transition-colors duration-300 uppercase tracking-widest"
                        >
                            <span className="relative z-10">{item.label}</span>
                            <span className="absolute left-0 bottom-[-6px] w-0 h-[1px] bg-green-500 transition-all duration-300 group-hover:w-full"></span>
                        </a>
                    ))}
                </div>

                <div className="md:hidden">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="text-white hover:text-green-500 transition-colors p-1">
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

            </div>
        </div>


        {/* =========================================
            3. 모바일 전체화면 메뉴 (공통)
        ========================================= */}
        <div 
            className={`fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                isMobileMenuOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'
            }`}
        >
             <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ 
                backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
                backgroundSize: '40px 40px' 
            }}></div>

            <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-8 right-6 text-white p-2 hover:text-gray-300 transition-colors z-20"
            >
                <X className="w-8 h-8" />
            </button>

            <div className="flex flex-col gap-8 text-center relative z-10">
                {navItems.map((item, index) => (
                    <a 
                        key={item.label}
                        href={item.id === 'admin' ? '/admin' : `#${item.id}`}
                        onClick={handleNavigation(item.id)}
                        className={`text-3xl md:text-5xl font-light text-white hover:text-green-500 transition-all duration-300 transform ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                        style={{ transitionDelay: `${index * 100}ms` }}
                    >
                        <span className="text-sm font-mono text-gray-500 block mb-2 tracking-widest">0{index + 1}</span>
                        {item.label}
                    </a>
                ))}
            </div>

            <div className="absolute bottom-12 left-0 w-full text-center">
                <p className="font-mono text-[10px] text-gray-600 tracking-widest">HANTŌME PRODUCTION</p>
            </div>
        </div>
    </>
  );
};