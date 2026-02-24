import React from 'react';
import { Reveal } from './Reveal';
import { ArrowUpRight } from 'lucide-react';

// 아이콘 컴포넌트들
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 127.14 96.36" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22c2.36-24.44-5-47.25-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>
);
const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
);
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.073-4.947-.2-4.356-2.623-6.78-6.979-6.98C15.668.014 15.259 0 12 0z"/><path d="M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/><circle cx="18.406" cy="5.594" r="1.44"/></svg>
);
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
);

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

export const Contact: React.FC = () => {
  const socialLinks = [
    { label: 'Youtube', icon: YoutubeIcon, url: 'https://www.youtube.com/@hantomeproduction' },
    { label: 'Instagram', icon: InstagramIcon, url: 'https://www.instagram.com/hantomeproduction/' },
    { label: 'Twitter(X)', icon: XIcon, url: 'https://x.com/Hantome_Product' }
  ];

  return (
    <section id="contact" className="relative w-full h-[100dvh] snap-start snap-always shrink-0 flex flex-col bg-[#050505] overflow-hidden">
        
        {/* ✨ 004 헤더 상단 고정 */}
        <div className="flex justify-between items-center px-6 py-3 border-b border-white/5 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-xl shrink-0">
             <span className="font-mono text-[10px] text-gray-400 tracking-widest border border-white/10 px-2 py-1 rounded-full">/004</span>
             <span className="font-mono text-[10px] text-gray-400 tracking-widest uppercase">CONTACT</span>
        </div>

        {/* 메인 컨텐츠 영역: 모바일 여백 최적화 */}
        <div className="flex-1 flex flex-col justify-center px-6 max-w-[1920px] mx-auto w-full min-h-0 py-4 md:py-10">
            <Reveal>
                <div className="flex items-center gap-4 mb-2 md:mb-4">
                    <span className="w-8 md:w-12 h-px bg-green-500"></span>
                    <p className="font-mono text-[10px] md:text-sm text-green-500 tracking-[0.2em] uppercase">Ready to start?</p>
                </div>
                <h2 className="text-[12vw] md:text-[8vw] leading-[0.8] font-bold tracking-tighter mb-6 md:mb-12 uppercase text-white select-none">
                    CONTACT
                </h2>
            </Reveal>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 border-t border-white/5 pt-6 md:pt-10">
                <div className="lg:col-span-7 flex flex-col">
                     <Reveal delay={100}>
                        <div className="mb-6 md:mb-8">
                            <p className="font-mono text-[8px] md:text-[9px] text-gray-500 mb-2 md:mb-4 tracking-widest uppercase">[ INQUIRIES ]</p>
                            <a href="mailto:hantomeproduction@gmail.com" className="text-lg md:text-3xl lg:text-4xl hover:text-gray-400 transition-colors block font-light tracking-tight underline-offset-8 decoration-white/20">
                                hantomeproduction@gmail.com
                            </a>
                        </div>
                        <div className="flex flex-col gap-6 items-start">
                            <a href="https://discord.gg/hnG4KkmY" target="_blank" rel="noopener noreferrer" className="group w-fit inline-flex items-center gap-4 px-6 md:px-8 py-4 md:py-5 border border-white/20 bg-white/5 text-white font-bold tracking-widest text-[10px] md:text-xs hover:bg-white hover:text-black transition-all duration-300 uppercase relative overflow-hidden">
                                <span className="relative z-10 flex items-center gap-3"><DiscordIcon className="w-4 md:w-5 h-auto" />JOIN DISCORD</span>
                            </a>
                        </div>
                     </Reveal>
                </div>

                <div className="lg:col-span-5 flex lg:justify-end items-start mt-4 lg:mt-0">
                    <Reveal delay={200} className="w-full" width="100%">
                        <div className="grid grid-cols-3 gap-2 w-full lg:w-[400px] xl:w-[480px] lg:ml-auto">
                            {socialLinks.map((sns, i) => (
                                <a key={i} href={sns.url} target="_blank" rel="noopener noreferrer" className="block w-full aspect-square border border-white/10 relative hover:bg-[#fff] transition-all duration-500 group overflow-hidden bg-black/20">
                                    <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-20">
                                        <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-gray-500 group-hover:text-black">{sns.label}</span>
                                        <ArrowUpRight className="w-3 h-3 text-gray-500 group-hover:text-black" />
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center transform transition-transform group-hover:scale-110">
                                        <sns.icon className="w-6 h-6 md:w-10 text-gray-700 group-hover:text-black" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </div>
        </div>
        
        {/* ✨ 축소된 푸터 레이아웃: 모바일 찌그러짐 방지 */}
        <footer className="py-4 md:py-6 border-t border-white/5 shrink-0 bg-black/50 backdrop-blur-sm">
            <div className="max-w-[1920px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0">
                <div className="flex flex-col items-center md:items-start">
                    <Logo className="h-3 md:h-4 text-white opacity-40 mb-1" />
                    <p className="text-[7px] md:text-[9px] font-mono text-gray-600 tracking-widest uppercase">
                        © 2026 HANTŌME PRODUCTION. ALL RIGHTS RESERVED.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <p className="text-[7px] md:text-[9px] font-mono text-gray-500 tracking-widest">SEOUL, KOREA</p>
                    <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                    <p className="text-[7px] md:text-[9px] font-mono text-gray-500 tracking-widest uppercase">Status: Active</p>
                </div>
            </div>
        </footer>
    </section>
  );
};