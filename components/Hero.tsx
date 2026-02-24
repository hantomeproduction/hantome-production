import React, { useEffect, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { Reveal } from './Reveal';

export const Hero: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [fade, setFade] = useState(false);

  const loadingTips = [
    "한토메 프로덕션은 크리에이터들을 위한 음악 제작팀입니다.",
    "우리와 함께 당신의 음악을 구현해보세요.",
    "정의되지 않은 당신만의 세계관을 사운드로 완성합니다.",
    "버츄얼 아티스트의 고유한 서사를 음악에 담아냅니다.",
    "시스템 동기화 중... 당신의 고유한 주파수를 맞추는 중입니다."
  ];

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const formattedDate = `${now.getDate()}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
      setCurrentDate(formattedDate);
    };
    updateDate();
    const dateInterval = setInterval(updateDate, 60000);
    const initialTimer = setTimeout(() => { setFade(true); }, 800);
    const tipInterval = setInterval(() => {
        setFade(false); 
        setTimeout(() => {
            setTipIndex((prev) => (prev + 1) % loadingTips.length);
            setFade(true); 
        }, 800); 
    }, 4500);
    return () => { clearInterval(dateInterval); clearTimeout(initialTimer); clearInterval(tipInterval); };
  }, []);

  const scrollToWork = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('work');
    if (element) { element.scrollIntoView({ behavior: 'smooth' }); }
  };

  return (
    <section id="hero" className="relative w-full h-[100dvh] snap-start snap-always shrink-0 overflow-hidden border-b border-white/5 bg-[#050505]">
        <div className={`absolute inset-0 z-0 pointer-events-none overflow-hidden transition-opacity duration-[2000ms] ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 scale-[1.05] origin-center">
                <video autoPlay loop muted playsInline preload="auto" poster="/hero-poster.jpg"
                    onLoadedData={() => setIsLoaded(true)}
                    className="w-full h-full object-cover blur opacity-60 saturate-100 contrast-125 hue-rotate-[-80deg]"
                >
                    <source src="/hero-bg.mp4" type="video/mp4" />
                </video>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-transparent to-[#050505] z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90 z-10"></div>
            <div className="absolute inset-0 z-20 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
        </div>

        <div className="relative z-40 h-full w-full max-w-[1920px] mx-auto px-6 flex flex-col">
            <div className="pt-24 md:pt-20 flex justify-between items-start shrink-0">
                <div className="font-mono text-[10px] md:text-xs text-gray-500 space-y-2 uppercase tracking-widest">
                    <p className="flex items-center gap-2"><span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>HANTŌME PRODUCTION</p>
                    <p className="text-gray-400">VIRTUAL ARTIST MUSIC AGENCY</p>
                    <p>EST. 2026</p>
                </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center mix-blend-difference pb-20">
                <Reveal><h1 className="text-[16vw] md:text-[13vw] leading-[0.85] font-bold tracking-tighter text-white whitespace-nowrap select-none text-center">HANTŌME</h1></Reveal>
                <Reveal delay={200}>
                    <div className="flex items-center justify-center gap-6 mt-6 md:mt-8 opacity-90">
                        <span className="hidden md:block h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-white/50 to-transparent"></span>
                        <p className="text-xl md:text-3xl font-medium tracking-tighter text-white text-center">Define the Undefined</p>
                        <span className="hidden md:block h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-white/50 to-transparent"></span>
                    </div>
                </Reveal>
                <Reveal delay={300}>
                    <div className="mt-8 md:mt-10 flex justify-center">
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 border border-white/10 bg-white/5 backdrop-blur-md rounded-full shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                            {/* ✨ 따옴표 오류 수정 완료 */}
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                            <span className="font-mono text-[9px] md:text-[11px] text-gray-300 tracking-[0.2em] uppercase">Music Production for Virtual Artists</span>
                        </div>
                    </div>
                </Reveal>
            </div>

            <div className="absolute bottom-28 md:bottom-32 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none px-6 z-40">
                <p className={`text-[3.2vw] md:text-base lg:text-lg text-gray-200 font-medium tracking-widest transition-opacity duration-[800ms] ease-in-out drop-shadow-md whitespace-nowrap ${fade ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="text-green-500 mr-2 md:mr-3 font-mono text-[10px] md:text-sm animate-pulse">▶</span>
                    {loadingTips[tipIndex]}
                </p>
            </div>

            <div className="pb-4 md:pb-8 flex items-end justify-between shrink-0">
                <div onClick={scrollToWork} className="font-mono text-[10px] text-gray-500 hidden md:block tracking-widest pointer-events-auto cursor-pointer hover:text-white transition-colors">[ SCROLL DOWN ]</div>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto">
                    <Reveal delay={400}>
                        <a href="#work" onClick={scrollToWork} className="flex flex-col items-center gap-4 group cursor-pointer">
                             <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-gray-500 to-white opacity-50 group-hover:h-16 transition-all duration-500"></div>
                             <ArrowDown className="w-4 h-4 text-white opacity-50 group-hover:opacity-100 transition-opacity" />
                        </a>
                    </Reveal>
                </div>
                <div className="font-mono text-[10px] text-right text-gray-500 tracking-widest"><p>STATUS: ACTIVE</p><p>SYS.VER 2.5.0</p></div>
            </div>
        </div>
        
        <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:block -rotate-90 origin-left z-30 pointer-events-none"><p className="text-white/[0.03] text-7xl font-bold tracking-tighter whitespace-nowrap">VIRTUAL ARTIST</p></div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block rotate-90 origin-right z-30 pointer-events-none"><p className="text-white/[0.03] text-7xl font-bold tracking-tighter whitespace-nowrap">{currentDate}</p></div>
    </section>
  );
};