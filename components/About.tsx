import React from 'react';
import { Reveal } from './Reveal';

interface TeamMember { name: string; korName: string; role: string; desc: string; image?: string; }

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
        
        <div className="flex justify-between items-center px-6 py-3 border-b border-white/5 sticky top-0 z-30 bg-[#080808]/90 backdrop-blur-xl shrink-0">
             <span className="font-mono text-[10px] text-gray-400 tracking-widest border border-white/10 px-2 py-1 rounded-full">/002</span>
             <span className="font-mono text-[10px] text-gray-400 tracking-widest">ABOUT US</span>
        </div>

        {/* ✨ 글씨가 커진 만큼 위쪽 구역 높이를 살짝 늘림 (h-[25%] -> h-[28%]) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-white/5 shrink-0 h-auto lg:h-[28%]">
            <div className="lg:col-span-5 p-5 md:p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.03),transparent_50%)]"></div>
                <Reveal>
                    <h2 className="text-[8vw] lg:text-[4vw] leading-[0.85] font-bold tracking-tighter text-white uppercase mb-3 relative z-10 transition-transform duration-700 group-hover:scale-[1.02]">
                        ABOUT <span className="text-gray-700 transition-colors duration-500 group-hover:text-gray-500">US</span>
                    </h2>
                </Reveal>
                <Reveal delay={100}>
                    <div className="flex items-center gap-3">
                         <span className="w-6 h-[1px] bg-green-500"></span>
                         <h3 className="text-base md:text-lg font-light text-gray-300 tracking-tight">
                            Define the <span className="font-serif italic text-white">Undefined</span>.
                        </h3>
                    </div>
                </Reveal>
            </div>

            <div className="lg:col-span-7 p-5 md:p-6 lg:p-8 flex flex-col justify-center bg-[#0a0a0a] relative">
                 <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                 
                {/* ✨ 본문 텍스트 크기 증가: text-xs md:text-sm */}
                <div className="space-y-4 md:space-y-5 font-light text-gray-400 leading-relaxed text-xs md:text-sm max-w-2xl relative z-10">
                    <Reveal delay={200}>
                        <div className="group/item pl-4 border-l border-white/10 hover:border-green-500 transition-colors duration-500">
                            {/* ✨ 철학 타이틀 크기 증가: text-[10px] md:text-[11px] */}
                            <strong className="text-green-500 block mb-1.5 text-[10px] md:text-[11px] font-mono uppercase tracking-[0.2em]">
                                [ Philosophy ]
                            </strong>
                            <p className="text-gray-300 group-hover/item:text-white transition-colors duration-500">
                                Hantōme Production은 현실과 가상의 경계, 그 모호함 속에 숨겨진 무한한 가능성을 탐구합니다. 우리는 정의되지 않은 당신의 색깔을 세상에 투영합니다.
                            </p>
                        </div>
                    </Reveal>
                    <Reveal delay={300}>
                         <div className="group/item pl-4 border-l border-white/10 hover:border-green-500 transition-colors duration-500">
                            {/* ✨ 비전 타이틀 크기 증가 */}
                            <strong className="text-green-500 block mb-1.5 text-[10px] md:text-[11px] font-mono uppercase tracking-[0.2em]">
                                [ Vision ]
                            </strong>
                            <p className="text-gray-300 group-hover/item:text-white transition-colors duration-500">
                                단순한 음악 제작을 넘어, 버츄얼 아티스트의 고유한 서사와 정체성을 완성하는 크리에이티브 파트너로서 함께합니다.
                            </p>
                        </div>
                    </Reveal>
                </div>
            </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 w-full">
            <div className="px-6 py-2 border-b border-white/5 bg-[#050505] flex justify-between items-center shrink-0">
                <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">Core Member</span>
                <span className="font-mono text-[9px] text-gray-600 uppercase tracking-widest">[ 05 ]</span>
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-white/5 min-h-0">
                {members.map((member, index) => (
                    <Reveal key={index} delay={index * 100} width="100%" className="group relative h-full bg-[#080808] hover:bg-[#0c0c0c] transition-colors duration-500">
                        <div className="flex flex-row md:flex-col h-full items-center md:items-stretch p-3 md:p-0">
                            
                            {/* ✨ 텍스트 커진 만큼 사진 비율 살짝 조정 (h-[55%]) */}
                            <div className="order-2 md:order-1 shrink-0 w-16 h-16 md:w-full md:h-[55%] overflow-hidden relative rounded-full md:rounded-none ml-4 md:ml-0 border border-white/10 md:border-0">
                                <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-transparent transition-colors duration-700 hidden md:block"></div>
                                <img src={member.image} alt={member.name} className="w-full h-full object-cover grayscale md:grayscale group-hover:grayscale-0 scale-105 group-hover:scale-110 transition-all duration-700 ease-in-out" />
                                <div className="hidden md:block absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                    <span className="text-white text-base font-bold uppercase tracking-tighter block">{member.name}</span>
                                </div>
                            </div>
                            
                            <div className="order-1 md:order-2 flex-1 flex flex-col justify-between md:p-5 md:border-t md:border-white/5 group-hover:bg-[#111] transition-colors duration-500 overflow-hidden">
                                <div>
                                    <div className="mb-2">
                                        <h4 className="text-white font-bold text-sm tracking-tight uppercase group-hover:text-green-500 transition-colors duration-300 md:hidden">{member.name}</h4>
                                        {/* ✨ 한글 이름 크기 증가 & 폰트 굵기(font-bold) & 색상(text-white) 적용! */}
                                        <span className="text-sm md:text-base text-white font-bold tracking-wide">{member.korName}</span>
                                    </div>
                                    <p className="text-[10px] md:text-[11px] font-mono text-green-500 md:text-gray-500 uppercase tracking-widest mb-1.5 mt-1 md:mt-0">{member.role}</p>
                                    
                                    {/* 멤버 설명도 잘 보이게 유지 */}
                                    <p className="text-[11px] md:text-[13px] text-gray-300 font-light leading-relaxed whitespace-pre-line group-hover:text-white transition-colors line-clamp-3 md:line-clamp-none">{member.desc}</p>
                                </div>
                            </div>
                            
                        </div>
                    </Reveal>
                ))}
            </div>
        </div>
    </section>
  );
};