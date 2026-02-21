import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Logo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path 
      d="M115 2 H10 L2 10 V30 L10 38 H25" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="square"
    />
    <path 
      d="M45 38 H150 L158 30 V10 L150 2 H135" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="square" 
    />
    <rect x="123" y="0" width="3" height="3" fill="currentColor" />
    <rect x="33" y="37" width="3" height="3" fill="currentColor" />
    <text 
      x="80" 
      y="27" 
      fontSize="20" 
      fontWeight="700" 
      fontFamily="Inter, system-ui, sans-serif" 
      textAnchor="middle" 
      fill="currentColor"
      letterSpacing="1.5"
    >
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
    const handleScroll = () => {
        // Hide navbar elements when scrolled past 80% of the viewport height (leaving Hero section)
        const threshold = window.innerHeight * 0.8;
        setIsHeroVisible(window.scrollY < threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleNavigation = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (id === 'admin') {
      navigate('/admin');
      return;
    }

    if (id === 'hero') {
      if (location.pathname !== '/') {
        navigate('/');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: id } });
    } else {
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
        }, 300); // Small delay to allow menu to close visually
      }
    }
  };

  const navItems = [
    { label: 'PORTFOLIO', id: 'work' },
    { label: 'ABOUT US', id: 'about' },
    { label: 'SERVICE', id: 'service' },
    { label: 'CONTACT', id: 'contact' },
    { label: 'ADMIN', id: 'admin' },
  ];

  return (
    <>
        <nav className="fixed top-0 w-full z-50 pointer-events-none mix-blend-difference overflow-hidden">
        <div className="px-6 py-8 flex items-start justify-between">
            {/* Logo Area - Slides out to the Left */}
            <div 
                className={`transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${isHeroVisible ? 'translate-x-0' : '-translate-x-[200%]'}`}
            >
                <a href="#" onClick={handleNavigation('hero')} className="pointer-events-auto group block">
                    <div className="flex items-center gap-2">
                        <Logo className="h-6 w-auto text-white group-hover:text-gray-300 transition-colors duration-300" />
                    </div>
                </a>
            </div>
            
            {/* Menu Items (Desktop) - Slides out to the Right */}
            <div 
                className={`hidden md:flex flex-col gap-2 pointer-events-auto items-end transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${isHeroVisible ? 'translate-x-0' : 'translate-x-[200%]'}`}
            >
                {navItems.map((item) => (
                    <a 
                        key={item.label}
                        href={item.id === 'admin' ? '/admin' : `#${item.id}`}
                        onClick={handleNavigation(item.id)}
                        className="group relative px-2 py-1 text-[11px] font-mono font-medium text-gray-400 hover:text-white transition-colors duration-300 uppercase tracking-widest"
                    >
                        <span className="relative z-10">{item.label}</span>
                        <span className="absolute right-0 bottom-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
                    </a>
                ))}
            </div>

            {/* Mobile Menu Icon - Always Visible (Removed translate transform logic) */}
            <div className="md:hidden pointer-events-auto">
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="text-white hover:text-gray-300 transition-colors p-2 -mr-2 bg-black/20 backdrop-blur-sm rounded-full"
                    aria-label="Open Menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>
        </div>
        </nav>

        {/* Mobile Menu Overlay */}
        <div 
            className={`fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                isMobileMenuOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'
            }`}
        >
            {/* Background Pattern */}
             <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ 
                backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
                backgroundSize: '40px 40px' 
            }}></div>

            <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-8 right-6 text-white p-2 hover:text-gray-300 transition-colors z-20"
                aria-label="Close Menu"
            >
                <X className="w-8 h-8" />
            </button>

            <div className="flex flex-col gap-8 text-center relative z-10">
                {navItems.map((item, index) => (
                    <a 
                        key={item.label}
                        href={item.id === 'admin' ? '/admin' : `#${item.id}`}
                        onClick={handleNavigation(item.id)}
                        className={`text-3xl md:text-5xl font-light text-white hover:text-green-500 transition-all duration-300 transform translate-y-0 ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
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