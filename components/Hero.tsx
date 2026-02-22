import React, { useEffect, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { Reveal } from './Reveal';

export const Hero: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const formattedDate = `${now.getDate()}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
      setCurrentDate(formattedDate);
    };

    updateDate();
    const intervalId = setInterval(updateDate, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const scrollToWork = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('work');
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative w-full h-screen overflow-hidden border-b border-white/5 bg-[#050505]">
        
        {/* 🚀 핵심: fixed 대신 absolute를 써야 스크롤할 때 섹션이랑 같이 위로 올라가! */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            
            <div className="absolute inset-0 scale-[1.15] origin-center">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover blur-none opacity-60 saturate-100 contrast-125"
                >
                    <source src="/hero-bg.mp4" type="video/mp4" />
                </video>
            </div>

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-transparent to-[#050505] z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90 z-10"></div>
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 z-20 opacity-[0.03]" style={{ 
                backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
                backgroundSize: '100px 100px' 
            }}></div>
        </div>

        {/* Content Layer */}
        <div className="relative z-40 h-full w-full max-w-[1920px] mx-auto px-6 flex flex-col">
            
            <div className="pt-24 md:pt-20 flex justify-between items-start shrink-0">
                <div className="font-mono text-[10px] md:text-xs text-gray-500 space-y-2 uppercase tracking-widest">
                    <p className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                        HANTŌME PRODUCTION
                    </p>
                    <p>EST. 2026</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center mix-blend-difference pb-20">
                <Reveal>
                    <h1 className="text-[13vw] leading-[0.85] font-bold tracking-tighter text-white whitespace-nowrap select-none text-center">
                        HANTŌME
                    </h1>
                </Reveal>
                <Reveal delay={200}>
                    <div className="flex items-center justify-center gap-6 mt-6 md:mt-8 opacity-80">
                        <span className="hidden md:block h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-white/50 to-transparent"></span>
                        <p className="font-serif italic text-xl md:text-3xl text-gray-200 tracking-wide font-light text-center">
                            Define the Undefined
                        </p>
                        <span className="hidden md:block h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-white/50 to-transparent"></span>
                    </div>
                </Reveal>
            </div>

            <div className="pb-4 md:pb-8 flex items-end justify-between shrink-0">
                <div 
                    onClick={scrollToWork}
                    className="font-mono text-[10px] text-gray-500 hidden md:block tracking-widest pointer-events-auto cursor-pointer hover:text-white transition-colors"
                >
                    [ SCROLL DOWN ]
                </div>
                
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto">
                    <Reveal delay={400}>
                        <a href="#work" onClick={scrollToWork} className="flex flex-col items-center gap-4 group cursor-pointer">
                             <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-gray-500 to-white opacity-50 group-hover:h-16 transition-all duration-500"></div>
                             <ArrowDown className="w-4 h-4 text-white opacity-50 group-hover:opacity-100 transition-opacity" />
                        </a>
                    </Reveal>
                </div>

                <div className="font-mono text-[10px] text-right text-gray-500 tracking-widest">
                    <p>STATUS: ACTIVE</p>
                    <p>SYS.VER 2.5.0</p>
                </div>
            </div>
        </div>

        <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:block -rotate-90 origin-left z-30 pointer-events-none">
            <p className="text-white/[0.03] text-7xl font-bold tracking-tighter whitespace-nowrap">
                VIRTUAL ARTIST
            </p>
        </div>
         <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block rotate-90 origin-right z-30 pointer-events-none">
            <p className="text-white/[0.03] text-7xl font-bold tracking-tighter whitespace-nowrap">
               {currentDate}
            </p>
        </div>
    </section>
  );
};