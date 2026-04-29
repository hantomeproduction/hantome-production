import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Reveal } from './Reveal';

// ✨ 배경 CSS 블러 필터를 완전히 제거하고 원본 HTML 로직을 완벽 반영
const CanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W: number, H: number;
    let animationFrameId: number;

    const TAU = Math.PI * 2;
    const orbs = [
      { cx:0.38, cy:0.50, rx:0.25, ry:0.18, period:22, phase:0.00, size:0.5, colors:['#2a1460','#7b4fcf','#c4a8f5'], alpha:0.7 },
      { cx:0.65, cy:0.48, rx:0.22, ry:0.25, period:18, phase:2.09, size:0.45, colors:['#1a0a50','#5530aa','#9b6fef'], alpha:0.65 },
      { cx:0.52, cy:0.32, rx:0.30, ry:0.22, period:26, phase:4.19, size:0.4, colors:['#200a40','#4a2590','#b692f0'], alpha:0.6 }
    ];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, W, H);
      const mn = Math.min(W, H);
      
      // 우주 배경색
      ctx.fillStyle = '#070510'; 
      ctx.fillRect(0, 0, W, H);
      
      ctx.globalCompositeOperation = 'screen';

      orbs.forEach(orb => {
        const t = time / 1000;
        const x = orb.cx * W + Math.cos(TAU * t / orb.period + orb.phase) * (orb.rx * W);
        const y = orb.cy * H + Math.sin(TAU * t / orb.period + orb.phase * 0.8) * (orb.ry * H);

        const radius = orb.size * mn;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        
        // 원본 HTML의 다층 그래디언트 로직 반영
        grad.addColorStop(0, orb.colors[2] + 'AA'); 
        grad.addColorStop(0.25, orb.colors[1] + '66');
        grad.addColorStop(0.6, orb.colors[0] + '2E');
        grad.addColorStop(1, 'transparent');

        ctx.globalAlpha = orb.alpha;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, TAU);
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';
      animationFrameId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // ✨ filter: blur 제거 완료
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />;
};

export const Hero: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const heroRef = useRef<HTMLElement>(null);
  const logoWrapperRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, "portfolios"), orderBy("order", "asc")));
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const validPortfolios = fetched.map((p: any) => ({
          ...p,
          imageUrl: p.customThumbnail || `https://img.youtube.com/vi/${p.id}/maxresdefault.jpg`
        }));
        setPortfolios(validPortfolios);
        setIsLoaded(true);
      } catch (err) {
        console.error(err);
        setIsLoaded(true);
      }
    };
    fetchWorks();
  }, []);

  useEffect(() => {
    if (!isHovered || portfolios.length === 0) return;
    const interval = setInterval(() => {
      setCurrentImgIdx((prev) => (prev + 1) % portfolios.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [isHovered, portfolios]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || window.innerWidth < 768) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!logoWrapperRef.current || !glareRef.current || !subtitleRef.current) return;

      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      const x = (clientX / innerWidth) * 2 - 1;
      const y = (clientY / innerHeight) * 2 - 1;

      const rect = logoWrapperRef.current.getBoundingClientRect();
      setMousePos({
        x: clientX - rect.left,
        y: clientY - rect.top
      });

      requestAnimationFrame(() => {
        logoWrapperRef.current!.style.transform = `rotateX(${y * -12}deg) rotateY(${x * 18}deg) scale3d(1.03, 1.03, 1.03)`;
        const percentX = ((x + 1) / 2) * 100;
        const percentY = ((y + 1) / 2) * 100;
        glareRef.current!.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(226,182,247,0.35) 0%, rgba(226,182,247,0) 60%)`;
        subtitleRef.current!.style.transform = `translateZ(20px) translateX(${x * -10}px) translateY(${y * -10}px)`;
      });
    };

    const handleMouseLeave = () => {
      requestAnimationFrame(() => {
        if (logoWrapperRef.current) logoWrapperRef.current.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        if (subtitleRef.current) subtitleRef.current.style.transform = `translateZ(0px) translateX(0px) translateY(0px)`;
      });
    };

    hero.addEventListener('mousemove', handleMouseMove);
    hero.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      hero.removeEventListener('mousemove', handleMouseMove);
      hero.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <section 
      ref={heroRef} 
      id="hero" 
      className="relative w-full h-[100dvh] snap-start snap-always shrink-0 flex flex-col justify-center items-center bg-transparent overflow-hidden"
      style={{ perspective: '1500px' }}
    >
        <CanvasBackground />

        <div className="relative z-10 w-full flex flex-col items-center px-6">
            <div className={`max-w-[1200px] w-full flex flex-col items-center transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                
                {/* 로고 사이즈 1.4배 유지 */}
                <div 
                  ref={logoWrapperRef} 
                  className="relative mb-6 md:mb-10 w-[95vw] md:w-[85vw] lg:w-[75vw] xl:w-[65vw] flex justify-center transition-all duration-300 ease-out cursor-crosshair" 
                  style={{ transformStyle: 'preserve-3d' }}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                    <div 
                      ref={glareRef}
                      className="absolute inset-0 z-30 pointer-events-none rounded-full blur-[40px] mix-blend-screen transition-all duration-300 ease-out opacity-50"
                      style={{ background: `radial-gradient(circle at 50% 50%, rgba(226,182,247,0.2) 0%, rgba(226,182,247,0) 60%)` }}
                    />

                    {/* 기본 로고 레이어 */}
                    <img 
                      src="/logo.png" 
                      alt="HANTŌME" 
                      className="w-full h-auto object-contain transition-all duration-700 ease-out z-20"
                      style={{ 
                        filter: 'drop-shadow(0px 0px 30px rgba(226,182,247,0.3)) brightness(1.1)',
                        transform: 'translateZ(40px)'
                      }}
                    />

                    {/* ✨ 포트폴리오 창문 (스포트라이트) : 선명도 up, 지름 대폭 확대 */}
                    {portfolios.length > 0 && (
                      <div 
                        className={`absolute inset-0 w-full h-full transition-all duration-500 ease-out z-25 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                        style={{ 
                          WebkitMaskImage: 'url(/logoW.png)', 
                          WebkitMaskSize: 'contain', 
                          WebkitMaskPosition: 'center', 
                          WebkitMaskRepeat: 'no-repeat',
                          maskImage: 'url(/logoW.png)', 
                          maskSize: 'contain', 
                          maskPosition: 'center', 
                          maskRepeat: 'no-repeat',
                          transform: 'translateZ(50px)'
                        }}
                      >
                        <div 
                          className="w-full h-full relative"
                          style={{
                            // 지름 360px로 시원하게 확대
                            WebkitMaskImage: `radial-gradient(circle 360px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
                            maskImage: `radial-gradient(circle 360px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`
                          }}
                        >
                          {portfolios.map((p, idx) => (
                            <div 
                              key={p.id}
                              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${idx === currentImgIdx ? 'opacity-100' : 'opacity-0'}`}
                            >
                              <img 
                                src={p.imageUrl} 
                                alt="portfolio" 
                                // ✨ 블러 4px로 선명하게 조정
                                className="w-full h-full object-cover scale-110 blur-[4px] brightness-125"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
            </div>

            <div ref={subtitleRef} className="mt-6 md:mt-8 w-full flex justify-center transition-all duration-300 ease-out pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
                <Reveal delay={200}>
                    <p className="text-[13px] md:text-base lg:text-lg font-medium tracking-[0.2em] text-white/80 drop-shadow-md uppercase text-center">
                        크리에이터들을 위한 뮤직 프로덕션
                    </p>
                </Reveal>
            </div>
        </div>

        <div className="absolute bottom-8 left-0 w-full px-6 z-20 pointer-events-auto">
            <div className="max-w-[1920px] mx-auto flex justify-center">
                <button 
                    onClick={() => {
                        const container = document.getElementById('main-scroll-container');
                        const workElement = document.getElementById('work');
                        if (container && workElement) {
                            container.scrollTo({ top: workElement.offsetTop, behavior: 'smooth' });
                        }
                    }} 
                    className="font-mono text-xs md:text-sm font-bold tracking-widest uppercase hover:text-main-purple transition-colors flex items-center gap-2 drop-shadow-md"
                >
                    Scroll Down <span className="animate-bounce">↓</span>
                </button>
            </div>
        </div>
    </section>
  );
};