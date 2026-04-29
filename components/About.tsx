import React, { useState } from 'react';
import { Reveal } from './Reveal';

interface TeamMember { name: string; korName: string; role: string; desc: string; image?: string; }

const MemberCard: React.FC<{ member: TeamMember; index: number }> = ({ member, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="group relative w-full h-full bg-transparent overflow-hidden border-r border-white/5 last:border-r-0">
      <div className="absolute inset-0 bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

      <div className="hidden md:flex md:flex-col h-full items-stretch relative z-10">
        <div className="w-full h-[45vh] overflow-hidden relative">
          <img 
            src={member.image} 
            alt={member.name} 
            className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-all duration-1000 ease-in-out" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80"></div>
          <div className="absolute bottom-0 left-0 w-full p-6 z-20">
            <span className="text-white text-xl font-bold uppercase tracking-tighter block drop-shadow-md">{member.name}</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-start p-6 transition-colors duration-500 bg-[#050505]/40 backdrop-blur-sm group-hover:bg-main-purple/[0.05]">
          <div className="mb-2">
            <span className="text-lg text-main-purple font-bold tracking-wide">{member.korName}</span>
          </div>
          <p className="text-[11px] font-mono text-gray-400 uppercase tracking-widest mb-4">[{member.role}]</p>
          <p className="text-[13px] text-gray-300 font-light leading-relaxed whitespace-pre-line group-hover:text-white transition-colors duration-500">{member.desc}</p>
        </div>
      </div>

      <div 
        className="md:hidden w-full h-full perspective-[1000px] cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full transition-all duration-700 preserve-3d ${isFlipped ? 'rotate-x-180' : ''}`}>
          <div className="absolute inset-0 backface-hidden flex items-center p-4 bg-[#050505]/50 backdrop-blur-md">
            <div className="shrink-0 w-20 h-20 overflow-hidden rounded-full border border-main-purple/30 shadow-[0_0_15px_rgba(226,182,247,0.2)]">
              <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
            </div>
            <div className="ml-5 flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-lg text-white font-bold tracking-tight">{member.korName}</span>
                <span className="text-[10px] text-gray-500 font-mono uppercase">{member.name}</span>
              </div>
              <p className="text-[11px] font-mono text-main-purple uppercase tracking-widest leading-none mb-2">{member.role}</p>
              <p className="text-[10px] text-main-purple/40 font-light animate-pulse">* 터치하여 상세 소개</p>
            </div>
          </div>
          <div className="absolute inset-0 backface-hidden rotate-x-180 bg-[#111]/80 backdrop-blur-xl flex flex-col justify-center px-8 border-y border-main-purple/20">
            <p className="text-sm text-gray-200 font-light leading-relaxed whitespace-pre-line text-center">{member.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const About: React.FC = () => {
  const members: TeamMember[] = [
    { name: "Yoonhanee", korName: "윤하늬", role: "PRODUCER / PIANIST", desc: "인디밴드 '와인루프' 세션 및\n음악감독 역임,\n현 예술단 키보디스트로 활동 중", image: "/images/members/Yoonhanee.png" },
    { name: "SeongChooon", korName: "성춘", role: "PRODUCER / BASSIST", desc: "서인국, 김예지 등의 베이스 세션,\n가려운 부분을 긁어줄 효자손 프로듀서", image: "/images/members/SeongChooon.png" },
    { name: "Sero", korName: "세로", role: "PRODUCER / PIANIST", desc: "김완선, 이세계아이돌 등 협업,\n장르의 경계를 넘나드는 프로듀서", image: "/images/members/Sero.jpeg" },
    { name: "JongGeun", korName: "종근", role: "DRUMMER", desc: "현 인디밴드 멤버, 다양한 세션 경험,\n여러분이 상상하는 사운드를 만드는 드러머", image: "/images/members/JongGeun.png" },
    { name: "SoodanGod", korName: "수단갓", role: "GUITARIST", desc: "올가미 밴드 기타리스트,\n유튜브 수단갓 Music 채널 오너,\n탄탄하고 크레이티브한 기타리스트", image: "/images/members/SoodanGod.jpeg" }
  ];

  return (
    // ✨ 팩트: snap-always 부활! 미끄러짐 완벽 차단
    <section id="about" className="relative w-full h-[100dvh] snap-start snap-always shrink-0 flex flex-col border-b border-white/5 bg-[#050505] overflow-hidden">
        <style>{`.preserve-3d { transform-style: preserve-3d; } .backface-hidden { backface-visibility: hidden; } .rotate-x-180 { transform: rotateX(180deg); }`}</style>
        
        <div className="absolute top-1/2 left-0 w-[100vw] h-[100vh] pointer-events-none -translate-y-1/2 -translate-x-1/3 z-[1]" 
             style={{ background: 'radial-gradient(circle, rgba(226,182,247,0.2) 0%, rgba(226,182,247,0) 65%)' }}>
        </div>

        <div className="flex justify-between items-center px-6 py-3 border-b border-white/5 sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-xl shrink-0">
             <span className="font-mono text-[10px] text-main-purple tracking-widest border border-main-purple/20 px-2 py-1 rounded-full bg-main-purple/5">/002</span>
             <span className="font-mono text-[10px] text-gray-400 tracking-widest uppercase">ABOUT US</span>
        </div>

        <div className="flex-1 flex flex-col min-h-0 z-10 relative">
            <div className="hidden md:grid grid-cols-1 lg:grid-cols-12 border-b border-white/5 h-auto lg:h-[28vh] shrink-0">
                <div className="lg:col-span-5 p-8 flex flex-col justify-center relative border-r border-white/5">
                    <Reveal>
                        <h2 className="text-[5vw] lg:text-[4.5vw] font-bold tracking-tighter text-white uppercase mb-2">ABOUT <span className="text-main-purple">US</span></h2>
                    </Reveal>
                    <Reveal delay={100}>
                        <div className="flex items-center gap-3">
                             <span className="w-8 h-[1px] bg-main-purple shadow-[0_0_8px_#E2B6F7]"></span>
                             <h3 className="text-lg font-medium tracking-tighter text-gray-300 uppercase">Define the Undefined</h3>
                        </div>
                    </Reveal>
                </div>
                <div className="lg:col-span-7 p-8 flex flex-col justify-center bg-transparent">
                    <Reveal delay={200}>
                        <div className="pl-6 border-l-2 border-main-purple/30">
                            <strong className="text-main-purple block mb-2 text-[11px] font-mono uppercase tracking-[0.3em]">[ Philosophy ]</strong>
                            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line font-light">
                                Hantōme Production은 현실과 가상의 경계, 그 모호함 속에 숨겨진 무한한 가능성을 탐구합니다.{"\n"}우리는 정의되지 않은 당신의 색깔을 세상에 투영합니다.
                            </p>
                        </div>
                    </Reveal>
                </div>
            </div>

            <div className="md:hidden px-6 pt-16 pb-4 shrink-0">
                <Reveal><h2 className="text-[10vw] font-bold tracking-tighter text-white uppercase leading-none">ABOUT <span className="text-main-purple">US</span></h2></Reveal>
            </div>

            <div className="flex-1 flex flex-col min-h-0 w-full relative bg-transparent z-10">
                <div className="px-6 py-1.5 border-y border-white/5 bg-transparent flex justify-between items-center shrink-0">
                    <span className="font-mono text-[9px] text-main-purple uppercase tracking-widest font-bold">Creative Members</span>
                    <span className="font-mono text-[9px] text-gray-600 uppercase tracking-widest">[ 05 ]</span>
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 divide-y md:divide-y-0 overflow-hidden bg-transparent">
                    {members.map((member, index) => (
                        <MemberCard key={index} member={member} index={index} />
                    ))}
                </div>
            </div>
        </div>
    </section>
  );
};