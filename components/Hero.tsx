import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// 고해상도(Retina) 캔버스 배경 애니메이션
const CanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W: number, H: number;
    let animationFrameId: number;

    const orbs = [
      { cx:0.38, cy:0.50, rx:0.20, ry:0.14, period:22, phase:0.00, size:0.52, colors:['#2a1460','#7b4fcf','#c4a8f5'], alpha:0.38 },
      { cx:0.65, cy:0.48, rx:0.17, ry:0.21, period:18, phase:2.09, size:0.48, colors:['#1a0a50','#5530aa','#9b6fef'], alpha:0.35 },
      { cx:0.52, cy:0.32, rx:0.26, ry:0.19, period:26, phase:4.19, size:0.44, colors:['#200a40','#9040a0','#d4a8f5'], alpha:0.32 },
      { cx:0.48, cy:0.70, rx:0.21, ry:0.15, period:30, phase:1.05, size:0.46, colors:['#120830','#4020a0','#7b4fcf'], alpha:0.34 },
      { cx:0.45, cy:0.44, rx:0.24, ry:0.19, period:12, phase:0.50, size:0.28, colors:['#6030b0','#c4a8f5','#e8d6fd'], alpha:0.45 },
      { cx:0.58, cy:0.56, rx:0.21, ry:0.23, period:10, phase:3.14, size:0.26, colors:['#4020a0','#9b6fef','#c4a8f5'], alpha:0.42 },
      { cx:0.35, cy:0.62, rx:0.19, ry:0.21, period:14, phase:1.57, size:0.24, colors:['#801860','#d08ae0','#f0c8f8'], alpha:0.38 },
      { cx:0.70, cy:0.30, rx:0.15, ry:0.19, period:16, phase:5.24, size:0.22, colors:['#3020a0','#8060d0','#c4a8f5'], alpha:0.40 },
      { cx:0.50, cy:0.46, rx:0.30, ry:0.23, period:8,  phase:0.80, size:0.09, colors:['#c4a8f5','#e8d6fd','#ffffff'], alpha:0.70 },
      { cx:0.42, cy:0.52, rx:0.26, ry:0.21, period:7,  phase:2.60, size:0.08, colors:['#e0a0f0','#f4d0fc','#ffffff'], alpha:0.65 },
      { cx:0.58, cy:0.42, rx:0.22, ry:0.25, period:9,  phase:4.80, size:0.07, colors:['#a080e0','#d0b8f8','#ffffff'], alpha:0.65 },
    ];

    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1,3), 16);
      const g = parseInt(hex.slice(3,5), 16);
      const b = parseInt(hex.slice(5,7), 16);
      return [r, g, b];
    };

    const drawOrb = (cx: number, cy: number, radius: number, colors: string[], alpha: number) => {
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      const [r0,g0,b0] = hexToRgb(colors[0]);
      const [r1,g1,b1] = hexToRgb(colors[1]);
      const [r2,g2,b2] = hexToRgb(colors[2]);
      grad.addColorStop(0,   `rgba(${r2},${g2},${b2},${alpha * 0.55})`);
      grad.addColorStop(0.25,`rgba(${r1},${g1},${b1},${alpha * 0.40})`);
      grad.addColorStop(0.6, `rgba(${r0},${g0},${b0},${alpha * 0.18})`);
      grad.addColorStop(1,   `rgba(${r0},${g0},${b0},0)`);

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.scale(dpr, dpr);
    };
    
    window.addEventListener('resize', resize);
    resize();

    const TAU = Math.PI * 2;
    const startTime = performance.now();

    const render = (now: number) => {
      const t = (now - startTime) / 1000;
      const mn = Math.min(W, H);

      ctx.fillStyle = '#070510';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'screen';

      for (const orb of orbs) {
        const angle = TAU * t / orb.period + orb.phase;
        const ox = (orb.cx + Math.cos(angle) * orb.rx) * W;
        const oy = (orb.cy + Math.sin(angle) * orb.ry) * H;
        const radius = orb.size * mn;
        drawOrb(ox, oy, radius, orb.colors, orb.alpha);
      }

      ctx.globalCompositeOperation = 'source-over';
      const vig = ctx.createRadialGradient(W/2, H/2, mn*0.15, W/2, H/2, mn*0.90);
      vig.addColorStop(0, 'rgba(7,5,16,0)');
      vig.addColorStop(1, 'rgba(7,5,16,0.85)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 block z-0" />;
};

export const Hero: React.FC = () => {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, "portfolios"), orderBy("order", "asc")));
        const urls = snapshot.docs.map(doc => {
          const data = doc.data();
          return data.customThumbnail || `https://img.youtube.com/vi/${doc.id}/maxresdefault.jpg`;
        });
        setThumbnails(urls);
        setIsLoaded(true);
      } catch (err) {
        console.error(err);
      }
    };
    fetchWorks();
  }, []);

  useEffect(() => {
    if (thumbnails.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % thumbnails.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [thumbnails]);

  return (
    <section id="hero" className="relative w-full h-[100dvh] snap-start snap-always shrink-0 overflow-hidden bg-[#050505] text-white flex flex-col items-center justify-center">
        
        {/* 1. 배경 캔버스 + 오버레이 */}
        <CanvasBackground />
        <div className="absolute inset-0 bg-[#050505]/20 z-10 pointer-events-none"></div>

        {/* 🌟 중앙 컨텐츠 래퍼 */}
        <div className="relative w-full flex flex-col items-center justify-center z-20">
            
            {/* 로고 마스킹 팝업 영역 (이미지 슬라이드) */}
            <div className="relative w-full max-w-[90vw] md:max-w-[70vw] aspect-[3/1] flex items-center justify-center">
                <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: `url('/logoW.png')`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        maskImage: `url('/logoW.png')`,
                        WebkitMaskImage: `url('/logoW.png')`,
                        maskSize: 'contain',
                        WebkitMaskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        WebkitMaskPosition: 'center',
                    } as React.CSSProperties}
                >
                    <div className="w-full h-full relative overflow-hidden bg-black">
                        {thumbnails.map((img, idx) => {
                            const isActive = idx === currentIndex;
                            return (
                                <img 
                                    key={idx} 
                                    src={img} 
                                    alt="portfolio" 
                                    className="absolute inset-0 w-full h-full object-cover transition-all" 
                                    style={{ 
                                        transitionDuration: '800ms', 
                                        transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
                                        opacity: isActive ? 1 : 0, 
                                        transform: isActive ? 'scale(1)' : 'scale(0.85)', 
                                        filter: isActive ? 'blur(8px)' : 'blur(20px)', 
                                        zIndex: isActive ? 10 : 0 
                                    }} 
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ✨ 다시 원래대로 롤백된 깔끔한 텍스트 문구 (은은한 그림자 + 넓은 자간 적용) */}
            <div className="mt-6 md:mt-8 flex justify-center opacity-0 animate-[fadeIn_1s_ease-out_forwards] pointer-events-none" style={{ animationDelay: '200ms' }}>
                <p className="text-[13px] md:text-base lg:text-lg font-medium tracking-[0.2em] text-white/80 drop-shadow-md uppercase text-center">
                    크리에이터들을 위한 뮤직 프로덕션
                </p>
            </div>

            {/* 로딩 표시 */}
            {!isLoaded && (
                <div className="absolute -bottom-16 text-white font-mono tracking-widest animate-pulse">
                    LOADING HANTOME...
                </div>
            )}
        </div>

        {/* 하단 스크롤 버튼 (가운데 정렬, 렌더링 즉시 고정) */}
        <div className="absolute bottom-8 left-0 w-full px-6 z-20">
            <div className="max-w-[1920px] mx-auto flex justify-center">
                <button 
                    onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })} 
                    className="font-mono text-xs md:text-sm font-bold tracking-widest uppercase hover:text-main-purple transition-colors flex items-center gap-2 drop-shadow-md"
                >
                    Scroll Down <span className="animate-bounce">↓</span>
                </button>
            </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
    </section>
  );
};