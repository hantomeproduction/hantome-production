import React, { useState, useEffect } from 'react';
import { Reveal } from './Reveal';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

interface PricingItem {
    label: string;
    price: string;
    desc: string;
}

interface ServiceCardProps {
  index: number;
  title: string;
  subtitle: string;
  desc: string;
  pricing: PricingItem[];
}

const ServiceCard: React.FC<ServiceCardProps> = ({ index, title, subtitle, desc, pricing }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [openIdx, setOpenIdx] = useState<number | null>(null);

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFlipped(false);
        setTimeout(() => setOpenIdx(null), 500);
    };

    return (
        <div 
            className="group relative w-full aspect-[1/1.2] md:aspect-[1/1.6] perspective-[1000px] cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div className={`relative w-full h-full transition-all duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* FRONT SIDE (수정 없음) */}
                <div className="absolute inset-0 backface-hidden bg-[#050505] border border-white/10 p-6 md:p-8 flex flex-col justify-between group-hover:border-white/20 transition-colors duration-500">
                    <div className="flex justify-between items-start shrink-0">
                        <span className="font-mono text-[10px] md:text-xs text-gray-500 tracking-widest">SVC_0{index + 1}</span>
                        <div className="flex items-center gap-3">
                             <button className="opacity-0 group-hover:opacity-100 transition-all duration-500 px-3 py-1 md:px-4 md:py-1.5 rounded-full border border-white/20 hover:border-green-500 hover:text-green-500 text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-gray-400 bg-white/5 backdrop-blur-sm transform translate-y-2 group-hover:translate-y-0">
                                Check Price
                            </button>
                            <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-green-500 transition-colors duration-500 shadow-[0_0_0_0_rgba(34,197,94,0)] group-hover:shadow-[0_0_10px_1px_rgba(34,197,94,0.5)]"></div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center flex-1 my-2 md:my-4">
                        <h3 className="text-2xl md:text-4xl lg:text-5xl font-light text-white mb-3 md:mb-6 leading-tight tracking-tight group-hover:text-green-500 transition-colors duration-500 break-words">
                            {title}
                        </h3>
                        <p className="font-mono text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.2em] group-hover:text-gray-400 transition-colors duration-500">
                            {subtitle}
                        </p>
                    </div>
                    <div className="pt-4 md:pt-8 border-t border-white/10 group-hover:border-white/20 transition-colors duration-500 mt-auto shrink-0">
                        <p className="text-xs md:text-sm text-gray-500 font-light leading-relaxed break-keep group-hover:text-gray-400 transition-colors duration-500 line-clamp-3 md:line-clamp-none">
                            {desc}
                        </p>
                    </div>
                </div>

                {/* ✨ BACK SIDE (여기서 에러 해결!) */}
                <div 
                    className="absolute inset-0 backface-hidden rotate-y-180 bg-[#050505] border border-green-500/30 p-6 md:p-8 flex flex-col cursor-default"
                    // ✨ 1. 뒷면의 빈 공간을 눌러도 앞면으로 안 뒤집히게 방어! (오직 [CLOSE] 버튼으로만 닫힘)
                    onClick={(e) => e.stopPropagation()} 
                >
                    <div className="flex justify-between items-start mb-4 md:mb-8 shrink-0">
                         <span className="font-mono text-[10px] md:text-xs text-green-500 tracking-widest">PRICING_0{index + 1}</span>
                         <button onClick={handleClose} className="text-[10px] font-mono text-gray-500 hover:text-white uppercase tracking-widest cursor-pointer border border-white/10 px-2 py-1 rounded hover:bg-white/10 transition-colors">
                            [ CLOSE ]
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar py-2 pr-2">
                        <h4 className="text-lg md:text-xl text-white font-light mb-4 md:mb-8">{title}</h4>
                        <ul className="space-y-3 md:space-y-4">
                            {pricing.map((item, idx) => (
                                <li key={idx} className="flex flex-col">
                                    {/* ✨ 2. 숫자뿐만 아니라 '그 줄 전체'를 묶어서 버튼처럼 클릭 영역 확장 */}
                                    <div 
                                        className="flex justify-between items-baseline mb-2 cursor-pointer group/row py-1"
                                        onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                                    >
                                        <span className="text-xs md:text-sm text-gray-400 uppercase tracking-wider group-hover/row:text-gray-200 transition-colors">
                                            {item.label}
                                        </span>
                                        <span 
                                            className="font-mono text-xs md:text-sm text-green-500 group-hover/row:text-white group-hover/row:scale-105 transition-all duration-300 origin-right"
                                            title="클릭해서 설명 보기"
                                        >
                                            {item.price}
                                        </span>
                                    </div>
                                    
                                    {/* 아코디언 설명창 */}
<div className={`w-full overflow-hidden transition-all duration-500 ease-in-out ${openIdx === idx ? 'max-h-32 opacity-100 mb-3' : 'max-h-0 opacity-0'}`}>
    {/* ✨ text-gray-400 -> text-gray-200 으로 더 밝게 바꾸고, 너무 얇은 font-light는 지웠어! */}
    <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-[10px] md:text-xs text-gray-200 leading-relaxed break-keep shadow-inner">
        {item.desc || '상세 설명이 등록되지 않았습니다.'}
    </div>
</div>
                                    
                                    <div className="w-full h-px bg-white/5 transition-colors mt-1"></div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-auto pt-4 md:pt-6 text-center shrink-0">
                         <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">* KRW (VAT Included)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Services: React.FC = () => {
  const [prices, setPrices] = useState<any>({});

  useEffect(() => {
    const fetchPrices = async () => {
        const docRef = doc(db, "services", "pricing");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setPrices(docSnap.data());
        }
    };
    fetchPrices();
  }, []);

  const services = [
    {
        title: "Original Sound Track",
        subtitle: "Composition / Arrangement",
        desc: "버츄얼 아티스트의 세계관을 분석하여 그들만의 고유한 서사를 담은 오리지널 음원을 기획하고 제작합니다.",
        pricing: [
            { label: "Original Song Package", price: prices.ost_song || '-', desc: prices.ost_song_desc },
            { label: "MIDI Arrangement", price: prices.ost_midi || '-', desc: prices.ost_midi_desc },
            { label: "Band Arrangement", price: prices.ost_band || '-', desc: prices.ost_band_desc },
            { label: "BGM", price: prices.ost_bgm || '-', desc: prices.ost_bgm_desc }
        ]
    },
    {
        title: "Session & Cover",
        subtitle: "Inst Production / Live Session",
        desc: "라이브 공연을 위한 밴드 세션 및 MR 제작, 그리고 아티스트 스타일에 맞춘 커버곡 재편곡을 지원합니다.",
        pricing: [
            { label: "Piano Session", price: prices.session_piano || '-', desc: prices.session_piano_desc },
            { label: "Guitar Session", price: prices.session_guitar || '-', desc: prices.session_guitar_desc },
            { label: "Bass Session", price: prices.session_bass || '-', desc: prices.session_bass_desc },
            { label: "Drums Session", price: prices.session_drums || '-', desc: prices.session_drums_desc },
            { label: "Cover Instrument", price: prices.session_cover || '-', desc: prices.session_cover_desc }
        ]
    },
    {
        title: "Mix & Master",
        subtitle: "Sound Engineering",
        desc: "최신 장비와 플러그인을 활용하여 스트리밍 플랫폼에 최적화된 스튜디오 퀄리티의 사운드를 완성합니다.",
        pricing: [
            { label: "Vocal Tune", price: prices.mix_tune || '-', desc: prices.mix_tune_desc },
            { label: "Mixing", price: prices.mix_mixing || '-', desc: prices.mix_mixing_desc },
            { label: "Mastering", price: prices.mix_mastering || '-', desc: prices.mix_mastering_desc }
        ]
    },
    {
        title: "Vocal Directing",
        subtitle: "Recording / Direction",
        desc: "캐릭터의 성격과 감정선을 극대화하는 디테일한 보컬 디렉팅과 코러스 라인 메이킹을 제공합니다.",
        pricing: [
            { label: "Vocal Guide", price: prices.vocal_guide || '-', desc: prices.vocal_guide_desc },
            { label: "Vocal Chorus", price: prices.vocal_chorus || '-', desc: prices.vocal_chorus_desc }
        ]
    }
  ];

  return (
    <section id="service" className="relative border-b border-white/5 bg-[#050505]">
        <style>{`
            .preserve-3d { transform-style: preserve-3d; }
            .backface-hidden { backface-visibility: hidden; }
            .rotate-y-180 { transform: rotateY(180deg); }
        `}</style>
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/5 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-xl">
             <span className="font-mono text-[10px] text-gray-400 tracking-widest border border-white/10 px-2 py-1 rounded-full">/003</span>
             <span className="font-mono text-[10px] text-gray-400 tracking-widest">SERVICE</span>
        </div>
        <div className="pt-24 px-6 max-w-[1920px] mx-auto">
            <Reveal>
                <div className="mb-12 border-b border-white/5 pb-12">
                    <h2 className="text-[10vw] leading-[0.8] font-bold tracking-tighter text-white uppercase opacity-90">
                        SERVICES
                    </h2>
                </div>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full pb-24">
                {services.map((svc, i) => (
                    <Reveal key={i} delay={i * 100} className="w-full" width="100%">
                        <ServiceCard {...svc} index={i} />
                    </Reveal>
                ))}
            </div>
        </div>
    </section>
  );
};