import React, { useRef, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Reveal } from './Reveal';
import { Play, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';

interface ProjectProps { id: string; title: string; customThumbnail?: string; }

const ProjectCard: React.FC<ProjectProps> = ({ id, title, customThumbnail }) => {
  return (
    // ✨ 모바일 너비 조정: w-[180px]
    <div onClick={() => window.open(`https://www.youtube.com/watch?v=${id}`, '_blank')} className="group/card cursor-pointer flex flex-col gap-2 w-[180px] md:w-[280px] shrink-0 snap-start relative">
        <div className="relative aspect-video w-full overflow-hidden bg-[#111] border border-white/10 group-hover/card:border-white/30 transition-all duration-500">
             <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50 z-20 transition-all duration-300 group-hover/card:w-4 group-hover/card:h-4"></div>
             <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/50 z-20 transition-all duration-300 group-hover/card:w-4 group-hover/card:h-4"></div>
             <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/50 z-20 transition-all duration-300 group-hover/card:w-4 group-hover/card:h-4"></div>
             <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50 z-20 transition-all duration-300 group-hover/card:w-4 group-hover/card:h-4"></div>
            <img src={customThumbnail || `https://img.youtube.com/vi/${id}/maxresdefault.jpg`} alt={title} className="w-full h-full object-cover opacity-100 group-hover/card:scale-105 transition-all duration-700 ease-out" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 z-10">
                 <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 transform scale-75 group-hover/card:scale-100 transition-transform duration-500 hover:bg-white/20"><Play className="w-5 h-5 fill-white text-white ml-1" /></div>
            </div>
        </div>
        <div className="flex flex-col gap-1 border-t border-white/5 pt-2 pl-1">
            <div className="flex justify-between items-start gap-2">
                <h3 className="text-gray-200 font-medium text-[10px] md:text-[13px] leading-snug line-clamp-2 group-hover/card:text-white transition-colors duration-300 tracking-tight">{title}</h3>
                <ArrowUpRight className="w-3 h-3 text-gray-600 group-hover/card:text-white transition-colors duration-300 shrink-0" />
            </div>
            <div className="flex items-center mt-1">
                <span className="text-[7px] md:text-[8px] font-mono text-green-500 uppercase tracking-widest bg-green-500/10 px-1.5 py-0.5 rounded-sm">YOUTUBE</span>
            </div>
        </div>
    </div>
  );
};

const ProjectRow: React.FC<{ title: string; subtitle: string; projects: any[] }> = ({ title, subtitle, projects }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const scrollAmount = 600;
            if (direction === 'left') container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            else {
                const { scrollLeft, scrollWidth, clientWidth } = container;
                if (scrollLeft + clientWidth >= scrollWidth - 10) container.scrollTo({ left: 0, behavior: 'smooth' });
                else container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            const percentage = (scrollWidth - clientWidth) > 0 ? (scrollLeft / (scrollWidth - clientWidth)) * 100 : 0;
            setProgress(percentage);
        }
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (el) { el.addEventListener('scroll', handleScroll); return () => el.removeEventListener('scroll', handleScroll); }
    }, []);

    return (
        <div className="w-full py-2 md:py-3 relative flex flex-col justify-center">
            <div className="mb-2 md:mb-3 px-6 md:px-0 flex justify-between items-end">
                <div className="flex flex-col gap-1">
                    <Reveal><div className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-sm"></span><span className="text-[8px] md:text-[9px] font-mono text-green-500 tracking-[0.2em] uppercase">{subtitle}</span></div></Reveal>
                    <Reveal delay={100}><h3 className="text-xl md:text-3xl font-medium text-white tracking-tight">{title}</h3></Reveal>
                </div>
            </div>
            <div className="relative group w-full flex flex-col justify-center md:flex-1">
                 <button onClick={() => scroll('left')} className="hidden md:flex absolute left-0 top-[40%] z-30 -translate-y-1/2 p-2 bg-black/40 text-white border-y border-r border-white/20 hover:bg-white hover:text-black"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => scroll('right')} className="hidden md:flex absolute right-0 top-[40%] z-30 -translate-y-1/2 p-2 bg-black/40 text-white border-y border-l border-white/20 hover:bg-white hover:text-black"><ChevronRight className="w-4 h-4" /></button>
                <div ref={scrollRef} className="flex overflow-x-auto gap-3 md:gap-4 px-6 md:px-0 pb-3 snap-x snap-mandatory no-scrollbar scroll-smooth w-full min-h-[160px] md:min-h-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {projects.map((project, index) => (<ProjectCard key={index} id={project.id} title={project.title} customThumbnail={project.customThumbnail} />))}
                    <div className="w-6 shrink-0 md:hidden"></div>
                </div>
            </div>
            <div className="hidden md:block absolute bottom-0 left-0 w-full h-[1px] bg-white/5"><div className="h-[1px] bg-green-500 transition-all duration-300 ease-out" style={{ width: `${Math.max(5, progress)}%` }}></div></div>
        </div>
    );
};

export const Work: React.FC = () => {
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, "portfolios"), orderBy("order", "asc")));
        setWorks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchWorks();
  }, []);

  const compositionWorks = works.filter(w => w.category === 'composition');
  const sessionWorks = works.filter(w => w.category === 'session');

  if (loading) return <div className="h-[100dvh] w-full flex items-center justify-center text-gray-500 font-mono tracking-widest uppercase bg-[#050505]">Initializing Archive...</div>;

  return (
        <section id="work" className="w-full h-[100dvh] snap-start snap-always shrink-0 bg-[#050505] flex flex-col overflow-hidden relative border-b border-white/5">
             <div className="flex justify-between items-center px-6 py-3 border-b border-white/5 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-xl shrink-0">
                 <span className="font-mono text-[10px] text-gray-400 tracking-widest border border-white/10 px-2 py-1 rounded-full">/001</span>
                 <span className="font-mono text-[10px] text-gray-400 tracking-widest">PORTFOLIO</span>
             </div>
             
             <div className="flex-1 flex flex-col justify-center max-w-[1920px] mx-auto w-full md:px-6 pt-8 pb-2 md:pb-4 overflow-hidden">
                 <Reveal>
                    <div className="mb-2 md:mb-4 px-6 md:px-0 pb-2 md:pb-4 border-b border-white/5 relative shrink-0">
                         <h2 className="text-[8vw] md:text-[5vw] lg:text-[4.5vw] leading-[0.8] font-bold tracking-tighter text-white uppercase opacity-90">
                             PORTFOLIO
                         </h2>
                    </div>
                </Reveal>
                 <div className="flex-1 flex flex-col justify-evenly gap-1 overflow-hidden">
                    <ProjectRow title="작곡 / 편곡" subtitle="COMPOSITION & ARRANGEMENT" projects={compositionWorks} />
                    <ProjectRow title="세션 참여" subtitle="SESSION PARTICIPATION" projects={sessionWorks} />
                 </div>
             </div>
        </section>
  );
};