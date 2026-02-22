import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc, writeBatch, setDoc } from 'firebase/firestore';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ChevronUp, ChevronDown, RefreshCcw, Save } from 'lucide-react';

export const Admin: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [category, setCategory] = useState<'composition' | 'session'>('composition');
  const [portfolios, setPortfolios] = useState<any[]>([]);

  // ✨ 가격 14개 + 설명 14개 상태
  const [pricing, setPricing] = useState<any>({});
  const [isPricingLoading, setIsPricingLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchPortfolios();
        fetchPricing();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchPricing = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "services"));
      if (!querySnapshot.empty) {
        const pricingDoc = querySnapshot.docs.find(d => d.id === 'pricing');
        if (pricingDoc) {
          setPricing(pricingDoc.data());
        }
      }
    } catch (err) {
      console.error("Pricing Fetch Error:", err);
    }
  };

  // ✨ DB 초기화 (설명 필드 포함해서 덮어씌움)
  const handleInitializePricing = async () => {
    if (window.confirm("초기 데이터(가격+설명)를 파이어베이스로 세팅할까? (기존 데이터 초기화)")) {
      try {
        const pricingRef = doc(db, "services", "pricing");
        await setDoc(pricingRef, {
          ost_song: "₩1,500,000", ost_song_desc: "보컬 탑라인 메이킹, 작사, 기본 믹싱이 포함된 올인원 패키지입니다.", 
          ost_midi: "₩500,000", ost_midi_desc: "스케치를 바탕으로 완성도 있는 미디 편곡을 진행합니다.", 
          ost_band: "₩1,500,000", ost_band_desc: "리얼 세션 녹음이 포함된 고퀄리티 밴드 사운드 편곡입니다.", 
          ost_bgm: "₩300,000", ost_bgm_desc: "방송, 게임, 유튜브용 오리지널 배경음악을 제작합니다.",
          
          session_piano: "₩250,000", session_piano_desc: "프로페셔널 피아노/키보드 트랙 레코딩.", 
          session_guitar: "₩250,000", session_guitar_desc: "어쿠스틱, 일렉트릭 기타 트랙 레코딩.", 
          session_bass: "₩250,000", session_bass_desc: "베이스 기타 트랙 레코딩.", 
          session_drums: "₩250,000", session_drums_desc: "미디 드럼 프로그래밍 또는 리얼 드럼 레코딩.", 
          session_cover: "₩300,000", session_cover_desc: "커버곡을 위한 맞춤형 인스트루멘탈 제작.",
          
          mix_tune: "₩150,000", mix_tune_desc: "디테일한 피치 교정 및 박자 에디팅 작업.", 
          mix_mixing: "₩300,000", mix_mixing_desc: "각 트랙의 밸런스를 맞추는 스튜디오 믹싱.", 
          mix_mastering: "₩150,000", mix_mastering_desc: "음원 플랫폼 기준에 맞춘 최종 음압 및 톤 보정.",
          
          vocal_guide: "₩150,000", vocal_guide_desc: "녹음을 위한 가이드 보컬 트랙 제공.", 
          vocal_chorus: "₩250,000", vocal_chorus_desc: "풍성한 사운드를 위한 코러스 라인 메이킹 및 녹음."
        });
        alert("SYSTEM: 가격+설명 데이터 세팅 완료!");
        fetchPricing();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleUpdatePricing = async () => {
    setIsPricingLoading(true);
    try {
      const pricingRef = doc(db, "services", "pricing");
      await updateDoc(pricingRef, pricing);
      alert("SYSTEM: 성공적으로 업데이트되었습니다.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsPricingLoading(false);
    }
  };

  const fetchPortfolios = async () => {
    const q = query(collection(db, "portfolios"), orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    setPortfolios(data);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError('로그인 실패: 정보를 확인하세요.');
    }
  };

  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !youtubeUrl) return;
    try {
      const nextOrder = portfolios.length > 0 ? Math.max(...portfolios.map(p => p.order || 0)) + 1 : 0;
      await addDoc(collection(db, "portfolios"), { title, youtubeUrl, category, order: nextOrder, createdAt: new Date().toISOString() });
      setTitle(''); setYoutubeUrl(''); fetchPortfolios();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (docId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteDoc(doc(db, "portfolios", docId));
      fetchPortfolios();
    }
  };

  const moveOrderInCategory = async (categoryList: any[], currentIndex: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= categoryList.length) return;
    const newList = [...categoryList];
    [newList[currentIndex], newList[newIndex]] = [newList[newIndex], newList[currentIndex]];
    const batch = writeBatch(db);
    newList.forEach((item, idx) => {
      batch.update(doc(db, "portfolios", item.docId), { order: idx });
    });
    await batch.commit();
    fetchPortfolios();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <form onSubmit={handleLogin} className="w-full max-w-md space-y-6 bg-white/5 p-8 rounded-2xl border border-white/10">
            <h1 className="text-2xl font-bold font-mono tracking-tighter">ADMIN ACCESS</h1>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black border border-white/10 p-3 rounded-lg outline-none focus:border-white transition" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black border border-white/10 p-3 rounded-lg outline-none focus:border-white transition" />
            <button type="submit" className="w-full bg-white text-black py-3 font-bold rounded-lg hover:bg-gray-200 transition">LOGIN</button>
          </form>
        </div>
      </div>
    );
  }

  const compositionItems = portfolios.filter(p => p.category === 'composition');
  const sessionItems = portfolios.filter(p => p.category === 'session');

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-6 py-32">
        
        {/* ✨ RATE CONFIGURATION SECTION */}
        <div className="mb-16 p-8 bg-white/[0.02] rounded-2xl border border-white/5 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-mono text-blue-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> 
              RATE & DETAILS CONFIG
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            
            {/* 1. OST 섹션 */}
            <div className="space-y-6 bg-black/40 p-5 rounded-xl border border-white/5">
              <h3 className="text-sm font-bold text-white tracking-widest border-b border-white/10 pb-3">ORIGINAL SOUND TRACK</h3>
              {[
                { key: 'ost_song', label: 'Original Song Package' },
                { key: 'ost_midi', label: 'MIDI Arrangement' },
                { key: 'ost_band', label: 'Band Arrangement' },
                { key: 'ost_bgm', label: 'BGM' }
              ].map(item => (
                <div key={item.key} className="space-y-1">
                  <label className="block text-[10px] text-gray-500 uppercase tracking-wider font-mono">{item.label}</label>
                  <input type="text" value={pricing[item.key] || ''} onChange={(e) => setPricing({...pricing, [item.key]: e.target.value})} className="w-full bg-black border border-white/10 p-2 rounded text-white text-xs font-mono focus:border-blue-500 outline-none" placeholder="가격 (예: ₩1,500,000)" />
                  <textarea value={pricing[`${item.key}_desc`] || ''} onChange={(e) => setPricing({...pricing, [`${item.key}_desc`]: e.target.value})} className="w-full bg-black/50 border border-white/5 p-2 rounded text-gray-400 text-[10px] focus:border-blue-500 outline-none resize-none h-16" placeholder="상세 설명 입력" />
                </div>
              ))}
            </div>

            {/* 2. SESSION 섹션 */}
            <div className="space-y-6 bg-black/40 p-5 rounded-xl border border-white/5">
              <h3 className="text-sm font-bold text-white tracking-widest border-b border-white/10 pb-3">SESSION & COVER</h3>
              {[
                { key: 'session_piano', label: 'Piano Session' },
                { key: 'session_guitar', label: 'Guitar Session' },
                { key: 'session_bass', label: 'Bass Session' },
                { key: 'session_drums', label: 'Drums Session' },
                { key: 'session_cover', label: 'Cover Instrument' }
              ].map(item => (
                <div key={item.key} className="space-y-1">
                  <label className="block text-[10px] text-gray-500 uppercase tracking-wider font-mono">{item.label}</label>
                  <input type="text" value={pricing[item.key] || ''} onChange={(e) => setPricing({...pricing, [item.key]: e.target.value})} className="w-full bg-black border border-white/10 p-2 rounded text-white text-xs font-mono focus:border-blue-500 outline-none" />
                  <textarea value={pricing[`${item.key}_desc`] || ''} onChange={(e) => setPricing({...pricing, [`${item.key}_desc`]: e.target.value})} className="w-full bg-black/50 border border-white/5 p-2 rounded text-gray-400 text-[10px] focus:border-blue-500 outline-none resize-none h-16" placeholder="상세 설명 입력" />
                </div>
              ))}
            </div>

            {/* 3. MIX & MASTER 섹션 */}
            <div className="space-y-6 bg-black/40 p-5 rounded-xl border border-white/5">
              <h3 className="text-sm font-bold text-white tracking-widest border-b border-white/10 pb-3">MIX & MASTER</h3>
              {[
                { key: 'mix_tune', label: 'Vocal Tune' },
                { key: 'mix_mixing', label: 'Mixing' },
                { key: 'mix_mastering', label: 'Mastering' }
              ].map(item => (
                <div key={item.key} className="space-y-1">
                  <label className="block text-[10px] text-gray-500 uppercase tracking-wider font-mono">{item.label}</label>
                  <input type="text" value={pricing[item.key] || ''} onChange={(e) => setPricing({...pricing, [item.key]: e.target.value})} className="w-full bg-black border border-white/10 p-2 rounded text-white text-xs font-mono focus:border-blue-500 outline-none" />
                  <textarea value={pricing[`${item.key}_desc`] || ''} onChange={(e) => setPricing({...pricing, [`${item.key}_desc`]: e.target.value})} className="w-full bg-black/50 border border-white/5 p-2 rounded text-gray-400 text-[10px] focus:border-blue-500 outline-none resize-none h-16" placeholder="상세 설명 입력" />
                </div>
              ))}
            </div>

            {/* 4. VOCAL DIRECTING 섹션 */}
            <div className="space-y-6 bg-black/40 p-5 rounded-xl border border-white/5">
              <h3 className="text-sm font-bold text-white tracking-widest border-b border-white/10 pb-3">VOCAL DIRECTING</h3>
              {[
                { key: 'vocal_guide', label: 'Vocal Guide' },
                { key: 'vocal_chorus', label: 'Vocal Chorus' }
              ].map(item => (
                <div key={item.key} className="space-y-1">
                  <label className="block text-[10px] text-gray-500 uppercase tracking-wider font-mono">{item.label}</label>
                  <input type="text" value={pricing[item.key] || ''} onChange={(e) => setPricing({...pricing, [item.key]: e.target.value})} className="w-full bg-black border border-white/10 p-2 rounded text-white text-xs font-mono focus:border-blue-500 outline-none" />
                  <textarea value={pricing[`${item.key}_desc`] || ''} onChange={(e) => setPricing({...pricing, [`${item.key}_desc`]: e.target.value})} className="w-full bg-black/50 border border-white/5 p-2 rounded text-gray-400 text-[10px] focus:border-blue-500 outline-none resize-none h-16" placeholder="상세 설명 입력" />
                </div>
              ))}
            </div>

          </div>
          
          <button
            onClick={handleUpdatePricing}
            disabled={isPricingLoading}
            className="mt-8 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs group"
          >
            {isPricingLoading ? <RefreshCcw className="animate-spin" size={16} /> : <><Save size={16} className="group-hover:scale-110 transition-transform"/> Save All Changes</>}
          </button>

          {/* ✨ DB 덮어씌우기 (1회용) */}
          <button
            onClick={handleInitializePricing}
            className="mt-4 w-full py-3 bg-red-900/30 hover:bg-red-900/60 text-red-200 font-mono rounded-xl border border-red-500/30 transition-all text-[10px] tracking-widest"
          >
            [⚠️ 1회용] DB 초기 데이터 (설명 포함) 덮어씌우기
          </button>

        </div>

        {/* 기존 등록 폼 */}
        <div className="mb-16">
          <h2 className="text-xl font-mono text-white mb-6 flex items-center gap-2">NEW PORTFOLIO</h2>
          <form onSubmit={handleAddPortfolio} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/5 p-6 rounded-2xl border border-white/10">
            <input type="text" placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-black border border-white/10 p-3 rounded-lg outline-none focus:border-white transition" />
            <input type="text" placeholder="YouTube URL" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} className="bg-black border border-white/10 p-3 rounded-lg outline-none focus:border-white transition" />
            <select value={category} onChange={(e: any) => setCategory(e.target.value)} className="bg-black border border-white/10 p-3 rounded-lg outline-none focus:border-white transition cursor-pointer">
              <option value="composition">Composition</option>
              <option value="session">Session</option>
            </select>
            <button type="submit" className="bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition uppercase tracking-widest text-xs">Add Work</button>
          </form>
        </div>

        {/* 기존 리스트 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-xl font-mono text-blue-500 mb-6 flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> COMPOSITION</h2>
            <div className="space-y-3">
              {compositionItems.map((item, index) => (
                <AdminListCard key={item.docId} item={item} index={index} list={compositionItems} onMove={moveOrderInCategory} onDelete={handleDelete} />
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-mono text-blue-500 mb-6 flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> SESSION PARTICIPATION</h2>
            <div className="space-y-3">
              {sessionItems.map((item, index) => (
                <AdminListCard key={item.docId} item={item} index={index} list={sessionItems} onMove={moveOrderInCategory} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const AdminListCard = ({ item, index, list, onMove, onDelete }: any) => (
  <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5 group hover:border-white/20 transition-all text-sm">
    <div className="flex items-center gap-4">
      <div className="flex flex-col gap-1">
        <button onClick={() => onMove(list, index, 'up')} disabled={index === 0} className="text-gray-500 hover:text-white disabled:opacity-0"><ChevronUp size={18}/></button>
        <button onClick={() => onMove(list, index, 'down')} disabled={index === list.length - 1} className="text-gray-500 hover:text-white disabled:opacity-0"><ChevronDown size={18}/></button>
      </div>
      <div>
        <p className="font-medium text-white">{item.title}</p>
        <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-wider">{item.category}</p>
      </div>
    </div>
    <button onClick={() => onDelete(item.docId)} className="text-gray-500 hover:text-red-500 transition-colors px-3 py-1 font-mono text-[10px] uppercase">Delete</button>
  </div>
);