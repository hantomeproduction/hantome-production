import React, { useState } from 'react';
import { Reveal } from './Reveal';

interface TeamMember { name: string; korName: string; role: string; desc: string; image?: string; }

const MemberCard: React.FC<{ member: TeamMember; index: number }> = ({ member, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="group relative w-full h-full bg-[#080808]">
      {/* 1. PC 레이아웃 (기존 디자인 유지) */}
      <div className="hidden md:flex md:flex-col h-full items-stretch">
        <div className="w-full h-[40vh] overflow-hidden relative">
          <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-transparent transition-colors duration-700"></div>
          <img src={member.image} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 scale-105 group-hover:scale-110 transition-all duration-700 ease-in-out" />
          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
            <span className="text-white text-base font-bold uppercase tracking-tighter block">{member.name}</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-start p-6 border-t border-white/5 group-hover:bg-[#111] transition-colors duration-500">
          <div className="mb-2">
            <span className="text-base text-white font-bold tracking-wide">{member.korName}</span>
          </div>
          <p className="text-[11px] font-mono text-gray-500 uppercase tracking-widest mb-3">{member.role}</p>
          <p className="text-[13px] text-gray-300 font-light leading-relaxed whitespace-pre-line group-hover:text-white transition-colors">{member.desc}</p>
        </div>
      </div>

      {/* 2. 모바일 레이아웃: 카드 크기 확대 및 공백 제거 */}
      <div 
        className="md:hidden w-full h-full perspective-[1000px] cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full transition-all duration-700 preserve-3d ${isFlipped ? 'rotate-x-180' : ''}`}>
          
          {/* 앞면: 사진과 글씨를 키우고 꽉 차게 배치 */}
          <div className="absolute inset-0 backface-hidden flex items-center p-2.5 bg-[#080808]">
            <div className="shrink-0 w-16 h-16 overflow-hidden rounded-full border border-white/10 shadow-lg">
              <img src={member.image} alt={member.name} className="w-full h-full object-cover grayscale" />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-base text-white font-bold tracking-tight">{member.korName}</span>
                <span className="text-[9px] text-gray-500 font-mono uppercase opacity-50">{member.name}</span>
              </div>
              <p className="text-[11px] font-mono text-green-500/80 uppercase tracking-widest leading-none mb-1.5">{member.role}</p>
              {/* ✨ 안내 문구 추가 */}
              <p className="text-[9px] text-white/20 font-light tracking-tighter animate-pulse">
                * 터치하여 소개 보기
              </p>
            </div>
          </div>

          {/* 뒷면: 이력/소개글 */}
          <div className="absolute inset-0 backface-hidden rotate-x-180 bg-[#111] flex flex-col justify-center px-6 border-y border-green-500/10">
            <p className="text-[11px] text-gray-200 font-light leading-relaxed whitespace-pre-line text-center">
              {member.desc}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export const About: React.FC = () => {
  const members: TeamMember[] = [
    { name: "Yoonhanee", korName: "윤하늬", role: "PRODUCER / PIANIST", desc: "인디밴드 '와인루프' 세션 및\n뮤지컬 음악감독 역임,\n현 예술단 키보디스트로 활동 중", image: "/images/members/Yoonhanee.png" },
    { name: "SeongChooon", korName: "성춘", role: "PRODUCER / BASSIST", desc: "서인국, 김예지 등의 베이스 레코딩 세션,\n가려운 부분을 긁어줄 효자손 프로듀서", image: "/images/members/SeongChooon.png" },
    { name: "Sero", korName: "세로", role: "PRODUCER / PIANIST", desc: "김완선, 이세계아이돌, 크록티칼 등 협업,\n장르의 경계를 넘나드는 프로듀서", image: "/images/members/Sero.jpeg" },
    { name: "JongGeun", korName: "종근", role: "DRUMMER", desc: "현 인디밴드 멤버, 다양한 무대 세션 경험,\n여러분이 상상하는 사운드를 만들어 낼 수 있는 드러머", image: "/images/members/JongGeun.png" },
    { name: "SoodanGod", korName: "수단갓", role: "GUITARIST", desc: "올가미 밴드 기타리스트,\n유튜브 수단갓 Music 채널 오너,\n탄탄한 연주와 크레이티브함을 겸비한 기타리스트", image: "/images/members/SoodanGod.jpeg" }
  ];

  return (
    <section id="about" className="relative w-full h-[100dvh] snap-start snap-always shrink-0 flex flex-col border-b border-white/5 bg-[#080808] overflow-hidden">
        <style>{`.preserve-3d { transform-style: preserve-3d; } .backface-hidden { backface-visibility: hidden; } .rotate-x-180 { transform: rotateX(180deg); }`}</style>
        
        <div className="flex justify-between items-center px-6 py-2.5 border-b border-white/5 sticky top-0 z-30 bg-[#080808]/90 backdrop-blur-xl shrink-0">
             <span className="font-mono text-[10px] text-gray-400 tracking-widest border border-white/10 px-2 py-1 rounded-full">/002</span>
             <span className="font-mono text-[10px] text-gray-400 tracking-widest uppercase">ABOUT US</span>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
            {/* PC 전용 헤더 */}
            <div className="hidden md:grid grid-cols-1 lg:grid-cols-12 border-b border-white/5 h-auto lg:h-[28vh] shrink-0">
                <div className="lg:col-span-5 p-5 md:p-6 lg:p-8 border-r border-white/5 flex flex-col justify-center relative overflow-hidden group">
                    <Reveal>
                        <h2 className="text-[5vw] lg:text-[4.5vw] font-bold tracking-tighter text-white uppercase mb-3">ABOUT <span className="text-gray-700">US</span></h2>
                    </Reveal>
                    <Reveal delay={100}>
                        <div className="flex items-center gap-3">
                             <span className="w-6 h-[1px] bg-green-500"></span>
                             <h3 className="text-base md:text-xl font-medium tracking-tighter text-white uppercase">Define the Undefined</h3>
                        </div>
                    </Reveal>
                </div>
                <div className="lg:col-span-7 p-5 md:p-6 lg:p-8 flex flex-col justify-center bg-[#0a0a0a]">
                    <div className="space-y-4 md:space-y-5 font-light text-gray-400 leading-relaxed text-xs md:text-sm max-w-2xl relative z-10">
                        <Reveal delay={200}>
                            <div className="group/item pl-4 border-l border-white/10 hover:border-green-500 transition-colors">
                                <strong className="text-green-500 block mb-1.5 text-[10px] md:text-[11px] font-mono uppercase tracking-[0.2em]">[ Philosophy ]</strong>
                                <p className="text-gray-300 whitespace-pre-line">Hantōme Production은 현실과 가상의 경계, 그 모호함 속에 숨겨진 무한한 가능성을 탐구합니다.{"\n"}우리는 정의되지 않은 당신의 색깔을 세상에 투영합니다.</p>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </div>

            {/* ✨ 모바일 전용 헤더: 캡슐에 가리지 않게 pt-12 적용 */}
            <div className="md:hidden px-6 pt-12 pb-2 shrink-0">
                <Reveal><h2 className="text-[9vw] font-bold tracking-tighter text-white uppercase leading-none">ABOUT <span className="text-gray-700">US</span></h2></Reveal>
            </div>

            <div className="flex-1 flex flex-col min-h-0 w-full">
                <div className="px-6 py-1 border-b border-white/5 bg-[#050505] flex justify-between items-center shrink-0">
                    <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest">Core Member</span>
                    <span className="font-mono text-[8px] text-gray-600 uppercase tracking-widest">[ 05 ]</span>
                </div>
                
                {/* 모바일 5행 고정 그리드 */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 md:divide-x divide-y md:divide-y-0 md:divide-white/5 overflow-hidden">
                    {members.map((member, index) => (
                        <div key={index} className="h-full overflow-hidden">
                            <MemberCard member={member} index={index} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </section>
  );
};