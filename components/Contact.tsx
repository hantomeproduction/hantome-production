import React from 'react';
import { Reveal } from './Reveal';
// ✨ 안 쓰는 ArrowUp 아이콘 수입도 깔끔하게 제거했어
import { ArrowUpRight } from 'lucide-react';

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 127.14 96.36" fill="#5865F2" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22c2.36-24.44-5-47.25-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>
);
const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="#FF0000" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
);
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="insta-gradient" x1="100%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" style={{stopColor:'#f09433'}} />
        <stop offset="25%" style={{stopColor:'#e6683c'}} />
        <stop offset="50%" style={{stopColor:'#dc2743'}} />
        <stop offset="75%" style={{stopColor:'#cc2366'}} />
        <stop offset="100%" style={{stopColor:'#bc1888'}} />
      </linearGradient>
    </defs>
    <path fill="url(#insta-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.073-4.947-.2-4.356-2.623-6.78-6.979-6.98C15.668.014 15.259 0 12 0z"/><path fill="url(#insta-gradient)" d="M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/><circle fill="url(#insta-gradient)" cx="18.406" cy="5.594" r="1.44"/>
  </svg>
);
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="#FFFFFF" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
);

export const Contact: React.FC = () => {
  const socialLinks = [
    { label: 'Youtube', icon: YoutubeIcon, url: 'https://www.youtube.com/@%ED%95%9C%ED%86%A0%EB%A9%94%ED%94%84%EB%A1%9C%EB%8D%95%EC%85%98', color: 'hover:bg-[#FF0000]/10 hover:border-[#FF0000]/50' },
    { label: 'Instagram', icon: InstagramIcon, url: 'https://www.instagram.com/hantomeproduction/', color: 'hover:bg-[#bc1888]/10 hover:border-[#bc1888]/50' },
    { label: 'Twitter(X)', icon: XIcon, url: 'https://x.com/Hantome_Product', color: 'hover:bg-white/10 hover:border-white/50' }
  ];

  return (
    <section id="contact" className="relative w-full h-auto min-h-[100dvh] md:h-[100dvh] snap-start snap-always shrink-0 flex flex-col bg-[#050505] overflow-x-hidden overflow-y-auto md:overflow-hidden">
        
        <div className="absolute bottom-0 right-0 w-[100vw] h-[100vh] pointer-events-none translate-x-1/4 translate-y-1/4 z-[1]" 
             style={{ background: 'radial-gradient(circle, rgba(226,182,247,0.18) 0%, rgba(226,182,247,0) 65%)' }}>
        </div>

        <div className="flex justify-between items-center px-6 py-3 border-b border-white/5 sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-xl shrink-0">
             <span className="font-mono text-[10px] text-main-purple tracking-widest border border-main-purple/20 px-2 py-1 rounded-full bg-main-purple/5">/004</span>
             <span className="font-mono text-[10px] text-gray-400 tracking-widest uppercase">CONTACT</span>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 max-w-[1920px] mx-auto w-full min-h-0 py-16 md:py-10 relative z-10">
            <Reveal>
                <div className="flex items-center gap-4 mb-4">
                    <span className="w-12 h-[2px] bg-main-purple shadow-[0_0_10px_#E2B6F7]"></span>
                    <p className="font-mono text-sm text-main-purple tracking-[0.3em] uppercase font-bold">Get in Touch</p>
                </div>
                <h2 className="text-[12vw] md:text-[8vw] leading-[0.8] font-bold tracking-tighter mb-12 uppercase text-white select-none">
                    CONTACT
                </h2>
            </Reveal>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 border-t border-white/10 pt-12">
                <div className="lg:col-span-7 flex flex-col">
                     <Reveal delay={100}>
                        <div className="mb-10">
                            <p className="font-mono text-[10px] text-main-purple/60 mb-4 tracking-widest uppercase font-bold">[ EMAIL INQUIRIES ]</p>
                            <a href="mailto:hantomeproduction@gmail.com" className="text-[1.2rem] sm:text-2xl md:text-4xl lg:text-5xl hover:text-main-purple transition-all duration-500 block font-bold tracking-tight break-all">
                                hantomeproduction<span className="text-main-purple">@</span>gmail.com
                            </a>
                        </div>
                        <div className="flex flex-col gap-6 items-start">
                            <a href="https://discord.gg/EMuhwwUJZs" target="_blank" rel="noopener noreferrer" className="group w-full md:w-fit inline-flex items-center gap-4 px-8 py-5 border border-[#5865F2]/30 bg-[#5865F2]/10 text-white font-bold tracking-widest text-xs hover:bg-[#5865F2] hover:text-white transition-all duration-300 uppercase shadow-[0_0_20px_rgba(88,101,242,0.2)]">
                                <span className="relative z-10 flex items-center justify-center gap-3 w-full"><DiscordIcon className="w-5 h-auto" />JOIN OUR DISCORD</span>
                            </a>
                        </div>
                     </Reveal>
                </div>

                <div className="lg:col-span-5 flex justify-start lg:justify-end items-start mt-8 lg:mt-0 w-full">
                    <Reveal delay={200} width="100%">
                        <div className="grid grid-cols-3 gap-3 w-full lg:w-[400px] xl:w-[480px] lg:ml-auto">
                            {socialLinks.map((sns, i) => (
                                <a key={i} href={sns.url} target="_blank" rel="noopener noreferrer" className={`block w-full aspect-square border border-white/10 relative transition-all duration-500 group overflow-hidden bg-[#050505]/40 backdrop-blur-sm ${sns.color}`}>
                                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20">
                                        <span className="font-mono text-[9px] uppercase tracking-widest text-gray-500 group-hover:text-white font-bold">{sns.label}</span>
                                        <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-white" />
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center transform transition-transform group-hover:scale-110 duration-700 z-10">
                                        <sns.icon className="w-8 h-8 md:w-14 md:h-14" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </div>
        </div>
        
        <footer className="py-16 border-t border-white/10 shrink-0 bg-[#050505] relative z-20">
            {/* ✨ 불필요해진 justify-between 대신 두 그룹(로고/정책)이 양끝으로 가도록 레이아웃 심플하게 정리 */}
            <div className="max-w-[1920px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center md:items-end gap-12 md:gap-8">
                
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <img src="/logo.png" alt="HANTŌME" className="h-8 md:h-12 object-contain mb-4" />
                    <div className="flex flex-col gap-1 text-[11px] text-gray-500 font-light tracking-wide">
                        <p>Virtual Artist Management & Creative Production.</p>
                        <p className="text-main-purple/60">Defined by your imagination.</p>
                    </div>
                </div>

                {/* 중앙 버튼 있던 자리 완벽하게 삭제 완료 */}

                <div className="flex flex-col items-center md:items-end text-center md:text-right gap-6 md:gap-4">
                    <div className="flex gap-8 text-[11px] font-mono text-gray-500 uppercase tracking-widest">
                        <a href="#" className="hover:text-main-purple transition-colors">Terms</a>
                        <a href="#" className="hover:text-main-purple transition-colors">Privacy</a>
                    </div>
                    <div className="text-[10px] font-mono text-gray-600 tracking-widest uppercase">
                        © 2026 HANTŌME PRODUCTION.
                    </div>
                </div>
            </div>
        </footer>
    </section>
  );
};