import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc, writeBatch } from 'firebase/firestore';
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

  // ✨ 서비스 가격 관리를 위한 상태 추가
  const [pricing, setPricing] = useState<any>({ ost: '', session: '', mix: '' });
  const [isPricingLoading, setIsPricingLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchPortfolios();
        fetchPricing(); // ✨ 가격 정보 불러오기 추가
      }
    });
    return () => unsubscribe();
  }, []);

  // ✨ 서비스 가격 정보를 Firebase에서 가져오는 함수
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

  // ✨ 서비스 가격 정보를 업데이트하는 함수
  const handleUpdatePricing = async () => {
    setIsPricingLoading(true);
    try {
      const pricingRef = doc(db, "services", "pricing");
      await updateDoc(pricingRef, pricing);
      alert("SYSTEM: 서비스 요율이 성공적으로 업데이트되었습니다.");
    } catch (err) {
      console.error("Pricing Update Error:", err);
      alert("ERROR: 요율 업데이트에 실패했습니다. (Firestore에 'services/pricing' 문서가 있는지 확인하세요)");
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
      await addDoc(collection(db, "portfolios"), {
        title,
        youtubeUrl,
        category,
        order: nextOrder,
        createdAt: new Date().toISOString()
      });
      setTitle('');
      setYoutubeUrl('');
      fetchPortfolios();
    } catch (err) {
      console.error(err);
    }
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
      const ref = doc(db, "portfolios", item.docId);
      batch.update(ref, { order: idx });
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
        
        {/* ✨ [신규] RATE CONFIGURATION SECTION */}
        <div className="mb-16 p-8 bg-white/[0.02] rounded-2xl border border-white/5 backdrop-blur-sm">
          <h2 className="text-xl font-mono text-blue-500 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> 
            RATE CONFIGURATION
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['ost', 'session', 'mix'].map((service) => (
              <div key={service} className="space-y-2">
                <label className="block text-[10px] text-gray-500 uppercase tracking-[0.2em] font-mono">
                  {service} PRODUCTION
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">₩</span>
                  <input
                    type="text"
                    value={pricing[service] || ''}
                    onChange={(e) => setPricing({ ...pricing, [service]: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-8 pr-4 text-white focus:border-blue-500/50 transition outline-none font-mono text-sm"
                    placeholder="000,000"
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleUpdatePricing}
            disabled={isPricingLoading}
            className="mt-8 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs group"
          >
            {isPricingLoading ? <RefreshCcw className="animate-spin" size={16} /> : <><Save size={16} className="group-hover:scale-110 transition-transform"/> Apply Rate Changes</>}
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