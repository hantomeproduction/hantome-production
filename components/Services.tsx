import React, { useState, useEffect } from 'react';
import { Reveal } from './Reveal';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

interface PricingItem { label: string; price: string; desc: string; }
interface ServiceCardProps { index: number; title: string; subtitle: string; desc: string; pricing: PricingItem[]; }

const ServiceCard: React.FC<ServiceCardProps> = ({ index, title, subtitle, desc, pricing }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [openIdx, setOpenIdx] = useState<number | null>(null);

    const handleClose = (e: React.MouseEvent) => { e.stopPropagation(); setIsFlipped(false); setTimeout(() => setOpenIdx(null), 500); };

    return (
        <div className="group relative w-full h-full perspective-[1000px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
            <div className={`relative w-full h-full transition-all duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* FRONT SIDE */}
                <div className="absolute inset-0 backface-hidden bg-[#050505] border border-white/10 p-5 md:p-6 flex flex-col justify-between group-hover:border-white/20 transition-colors duration-500">
                    <div className="flex justify-between items-start shrink-0">
                        <span className="font-mono text-[9px] md:text-[10px] text-gray-500 tracking-widest">SVC_0{index + 1}</span>
                        <div className="flex items-center gap-3">
                             <button className="opacity-0 group-hover:opacity-100 transition-all duration-500 px-3 py-1 rounded-full border border-white/20 hover:border-green-500 hover:text-green-500 text-[9px] font-mono uppercase tracking-widest text-gray-400 bg-white/5 backdrop-blur-sm transform translate-y-2 group-hover:translate-y-0">Check Price</button>
                            <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-green-500 transition-colors duration-500 shadow-[0_0_0_0_rgba(34,197,94,0)] group-hover:shadow-[0_0_10px_1px_rgba(34,197,94,0.5)]"></div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center flex-1 my-2">
                        <h3 className="text-2xl md:text-4xl lg:text-5xl font-light text-white mb-2 md:mb-4 leading-tight tracking-tight group-hover:text-green-500 transition-colors duration-500 break-words">
                            {title}
                        </h3>
                        <p className="font-mono text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.2em] group-hover:text-gray-400 transition-colors duration-500">
                            {subtitle}
                        </p>
                    </div>
                    <div className="pt-3 border-t border-white/10 group-hover:border-white/20 transition-colors duration-500 mt-auto shrink-0">
                        <p className="text-xs md:text-sm text-gray-500 font-light leading-relaxed break-keep group-hover:text-gray-400 transition-colors duration-500 line-clamp-2 md:line-clamp-3">
                            {desc}
                        </p>
                    </div>
                </div>

                {/* BACK SIDE */}
                <div 
                    className="absolute inset-0 backface-hidden rotate-y-180 bg-[#050505] border border-green-500/30 p-5 md:p-6 flex flex-col cursor-pointer" 
                    onClick={handleClose}
                >
                    <div className="flex justify-between items-start mb-4 md:mb-6 shrink-0">
                         <span className="font-mono text-[10px] md:text-xs text-green-500 tracking-widest">PRICING_0{index + 1}</span>
                         <button onClick={handleClose} className="text-[10px] md:text-[11px] font-mono text-gray-400 hover:text-white uppercase tracking-widest cursor-pointer border border-white/10 px-2 py-1 rounded hover:bg-white/10 transition-colors">
                            [ CLOSE ]
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto no-scrollbar py-2 pr-2">
                        <h4 className="text-xl md:text-2xl lg:text-3xl text-white font-light mb-6 md:mb-8">{title}</h4>
                        
                        <ul className="space-y-2 md:space-y-3">
                            {pricing.map((item, idx) => (
                                <li key={idx} className="flex flex-col" onClick={(e) => e.stopPropagation()}>
                                    <div 
                                        className="flex justify-between items-center cursor-pointer group/row py-3 md:py-4 border-b border-transparent hover:border-white/5 transition-colors" 
                                        onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                                    >
                                        <span className="text-xs md:text-sm text-gray-400 uppercase tracking-wider group-hover/row:text-gray-200 transition-colors">{item.label}</span>
                                        <span className="font-mono text-xs md:text-sm text-green-500 group-hover/row:text-white group-hover/row:scale-105 transition-all duration-300 origin-right" title="클릭해서 설명 보기">{item.price}</span>
                                    </div>
                                    <div className={`w-full overflow-hidden transition-all duration-500 ease-in-out ${openIdx === idx ? 'max-h-[200px] opacity-100 mb-3' : 'max-h-0 opacity-0'}`}>
                                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-[11px] md:text-xs text-gray-200 leading-relaxed break-keep shadow-inner whitespace-pre-line">
                                            {item.desc || '상세 설명이 등록되지 않았습니다.'}
                                        </div>
                                    </div>
                                    <div className="w-full h-px bg-white/5 transition-colors mt-1"></div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="mt-auto pt-4 text-center shrink-0">
                         <p className="text-[9px] md:text-[10px] font-mono text-gray-600 uppercase tracking-widest">* KRW (VAT Included)</p>
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
        const docSnap = await getDoc(doc(db, "services", "pricing"));
        if (docSnap.exists()) setPrices(docSnap.data());
    };
    fetchPrices();
  }, []);

  const formatDesc = (desc: string, fallback: string) => {
      let result = desc || fallback;
      if (!result) return '';
      result = result.replace(
          "작곡, 작사, 악기녹음, 믹스&마스터링 등 오리지널송 모든 제작 과정이 포함 된 패키지입니다. 작업 방식과 과정에 따라 가격이 달라져서 세세한 상담 후에 진행 도와드립니다. 자세한 내용은 문의 부탁드립니다.",
          "작곡, 작사, 악기녹음, 믹스&마스터링 등 오리지널송 모든 제작 과정이 포함 된 패키지입니다.\n작업 방식과 과정에 따라 가격이 달라져서 세세한 상담 후에 진행 도와드립니다.\n자세한 내용은 문의 부탁드립니다."
      );
      result = result.replace(
          "오리지널송 스케치가 있으시다면, 스케치를 바탕으로 완성도 있는 미디 편곡을 진행합니다.",
          "오리지널송 스케치가 있으시다면,\n스케치를 바탕으로 완성도 있는 미디 편곡을 진행합니다."
      );
      result = result.replace(
          "커버곡을 위한 맞춤형 인스트루멘탈 제작. 모든 악기 작업이 미디(가상악기)로 진행됩니다.",
          "커버곡을 위한 맞춤형 인스트루멘탈 제작.\n모든 악기 작업이 미디(가상악기)로 진행됩니다."
      );
      return result;
  };

  const services = [
    { title: "Original Sound Track", subtitle: "Composition / Arrangement", desc: "버츄얼 아티스트의 세계관을 분석하여 그들만의 고유한 서사를 담은 오리지널 음원을 기획하고 제작합니다.", pricing: [{ label: "Original Song Package", price: prices.ost_song || '-', desc: formatDesc(prices.ost_song_desc, "작곡, 작사, 악기녹음, 믹스&마스터링 등 오리지널송 모든 제작 과정이 포함 된 패키지입니다.\n작업 방식과 과정에 따라 가격이 달라져서 세세한 상담 후에 진행 도와드립니다.\n자세한 내용은 문의 부탁드립니다.") }, { label: "MIDI Arrangement", price: prices.ost_midi || '-', desc: formatDesc(prices.ost_midi_desc, "오리지널송 스케치가 있으시다면,\n스케치를 바탕으로 완성도 있는 미디 편곡을 진행합니다.") }, { label: "Band Arrangement", price: prices.ost_band || '-', desc: formatDesc(prices.ost_band_desc, "리얼 세션 녹음이 포함된 고퀄리티 밴드 사운드 편곡입니다.") }, { label: "BGM", price: prices.ost_bgm || '-', desc: formatDesc(prices.ost_bgm_desc, "방송, 게임, 유튜브용 오리지널 배경음악을 제작합니다.") }] },
    { title: "Session & Cover", subtitle: "Inst Production / Live Session", desc: "라이브 공연을 위한 밴드 세션 및 MR 제작, 그리고 아티스트 스타일에 맞춘 커버곡 재편곡을 지원합니다.", pricing: [{ label: "Piano Session", price: prices.session_piano || '-', desc: prices.session_piano_desc }, { label: "Guitar Session", price: prices.session_guitar || '-', desc: prices.session_guitar_desc }, { label: "Bass Session", price: prices.session_bass || '-', desc: prices.session_bass_desc }, { label: "Drums Session", price: prices.session_drums || '-', desc: prices.session_drums_desc }, { label: "Cover Instrument", price: prices.session_cover || '-', desc: formatDesc(prices.session_cover_desc, "커버곡을 위한 맞춤형 인스트루멘탈 제작.\n모든 악기 작업이 미디(가상악기)로 진행됩니다.") }] },
    { title: "Mix & Master", subtitle: "Sound Engineering", desc: "최신 장비와 플러그인을 활용하여 스트리밍 플랫폼에 최적화된 스튜디오 퀄리티의 사운드를 완성합니다.", pricing: [{ label: "Vocal Tune", price: prices.mix_tune || '-', desc: prices.mix_tune_desc }, { label: "Mixing", price: prices.mix_mixing || '-', desc: prices.mix_mixing_desc }, { label: "Mastering", price: prices.mix_mastering || '-', desc: prices.mix_mastering_desc }] },
    { title: "Vocal Directing", subtitle: "Recording / Direction", desc: "캐릭터의 성격과 감정선을 극대화하는 디테일한 보컬 디렉팅과 코러스 라인 메이킹을 제공합니다.", pricing: [{ label: "Vocal Guide", price: prices.vocal_guide || '-', desc: prices.vocal_guide_desc }, { label: "Vocal Chorus", price: prices.vocal_chorus || '-', desc: prices.vocal_chorus_desc }] }
  ];

  return (
    <section id="service" className="relative w-full h-[100dvh] snap-start snap-always shrink-0 flex flex-col border-b border-white/5 bg-[#050505] overflow-hidden">
        <style>{`.preserve-3d { transform-style: preserve-3d; } .backface-hidden { backface-visibility: hidden; } .rotate-y-180 { transform: rotateY(180deg); }`}</style>
        
        <div className="flex justify-between items-center px-6 py-3 border-b border-white/5 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-xl shrink-0">
             <span className="font-mono text-[10px] text-gray-400 tracking-widest border border-white/10 px-2 py-1 rounded-full">/003</span>
             <span className="font-mono text-[10px] text-gray-400 tracking-widest">SERVICE / PRICE</span>
        </div>
        
        <div className="flex-1 flex flex-col max-w-[1920px] mx-auto w-full px-6 pt-8 pb-4 min-h-0">
            <Reveal>
                {/* ✨ 타이틀을 혼자 단독으로 웅장하게 배치 */}
                <div className="border-b border-white/5 pb-4 shrink-0">
                    <h2 className="text-[8vw] md:text-[5vw] lg:text-[4.5vw] leading-[0.8] font-bold tracking-tighter text-white uppercase opacity-90">
                        SERVICE / PRICE
                    </h2>
                </div>
            </Reveal>

            <Reveal delay={100}>
                {/* ✨ 타이틀 밑선 바로 아래 공간에, 카드를 안내하는 느낌으로 우측에 딱 붙여버림! (크기도 증가) */}
                <div className="flex justify-end w-full pt-3 mb-3 md:mb-4 shrink-0">
                    <span className="text-xs md:text-sm lg:text-base font-medium text-green-500 animate-pulse tracking-wide">
                        * 카드를 클릭하면 상세 가격이 표시됩니다.
                    </span>
                </div>
            </Reveal>
            
            <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
                {services.map((svc, i) => (
                    <Reveal key={i} delay={i * 100} className="w-full h-full" width="100%"><ServiceCard {...svc} index={i} /></Reveal>
                ))}
            </div>
        </div>
    </section>
  );
};