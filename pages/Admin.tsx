import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc, writeBatch } from 'firebase/firestore'; // writeBatch 추가
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ChevronUp, ChevronDown, RefreshCcw } from 'lucide-react'; // 아이콘 추가

export const Admin: React.FC = () => {
  // ... (기존 상태 변수들 동일)
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [category, setCategory] = useState<'composition' | 'session'>('composition');
  const [portfolios, setPortfolios] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) fetchPortfolios();
    });
    return () => unsubscribe();
  }, []);

  // 목록 가져오기 로직
  const fetchPortfolios = async () => {
    // 팁: 복구 전에는 아무것도 안 뜰 수 있어. 그게 정상이야!
    const q = query(collection(db, "portfolios"), orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    setPortfolios(data);
  };

  // 🔥 [긴급 복구] 번호표 없는 데이터들에 순서 부여하기
  const repairOrder = async () => {
    if (!window.confirm("기존 데이터들에 순서 번호를 부여할까요?")) return;
    
    try {
      const q = query(collection(db, "portfolios"), orderBy("createdAt", "asc"));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db); // 한 번에 업데이트하기 위한 도구

      snapshot.docs.forEach((docSnap, index) => {
        const docRef = doc(db, "portfolios", docSnap.id);
        batch.update(docRef, { order: index }); // 0, 1, 2... 순서대로 번호 부여
      });

      await batch.commit();
      alert("데이터 복구 완료! 이제 화면에 잘 나올 거야.");
      fetchPortfolios();
    } catch (err) {
      console.error(err);
      alert("복구 실패! 콘솔을 확인해봐.");
    }
  };

  // ... (moveOrder, handleAddPortfolio, handleDelete 등 기존 함수들 동일)
  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= portfolios.length) return;
    const currentItem = portfolios[index];
    const targetItem = portfolios[newIndex];
    try {
      const currentRef = doc(db, "portfolios", currentItem.docId);
      const targetRef = doc(db, "portfolios", targetItem.docId);
      await updateDoc(currentRef, { order: targetItem.order });
      await updateDoc(targetRef, { order: currentItem.order });
      fetchPortfolios();
    } catch (err) { console.error(err); }
  };

  const handleAddPortfolio = async () => {
    if (!title || !youtubeUrl) return alert("입력 확인!");
    const videoId = youtubeUrl.includes('v=') ? youtubeUrl.split('v=')[1].split('&')[0] : youtubeUrl.split('/').pop();
    try {
      const nextOrder = portfolios.length > 0 ? Math.max(...portfolios.map(p => p.order || 0)) + 1 : 0;
      await addDoc(collection(db, "portfolios"), { title, id: videoId, category, order: nextOrder, createdAt: new Date() });
      setTitle(''); setYoutubeUrl('');
      fetchPortfolios();
    } catch (err) { alert("저장 실패!"); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await signInWithEmailAndPassword(auth, email, password); } catch (err: any) { setError("실패!"); }
  };

  const handleDelete = async (docId: string) => {
    if (window.confirm("삭제?")) { await deleteDoc(doc(db, "portfolios", docId)); fetchPortfolios(); }
  };

  if (!user) { /* 로그인 폼 부분 생략 (기존과 동일) */ return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center"><form onSubmit={handleLogin} className="bg-white/5 p-8 rounded-2xl border border-white/10 w-96"><h2 className="text-2xl font-bold mb-6 text-center text-white">Admin Login</h2><input type="email" placeholder="Email" className="w-full p-3 mb-4 bg-black rounded border border-white/20 text-white" onChange={(e)=>setEmail(e.target.value)} /><input type="password" placeholder="Password" className="w-full p-3 mb-6 bg-black rounded border border-white/20 text-white" onChange={(e)=>setPassword(e.target.value)} /><button className="w-full bg-green-500 py-3 rounded font-bold text-black hover:bg-green-400 transition-colors">로그인</button>{error && <p className="text-red-500 mt-4 text-sm">{error}</p>}</form></div>; }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto pt-32 px-6 pb-20">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">작업물 관리</h1>
          <div className="flex gap-4">
            <button onClick={repairOrder} className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded hover:bg-yellow-500/20 transition-all text-sm">
              <RefreshCcw size={16} /> 기존 데이터 순서 복구
            </button>
            <button onClick={() => auth.signOut()} className="text-gray-400 hover:text-white transition-colors">로그아웃</button>
          </div>
        </div>
        {/* ... (이후 입력 폼 및 리스트 렌더링 부분 기존과 동일) */}
        <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-10">
          <div className="grid grid-cols-1 gap-4">
            <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="곡 제목" className="bg-black p-3 rounded border border-white/10 text-white" />
            <input value={youtubeUrl} onChange={(e)=>setYoutubeUrl(e.target.value)} placeholder="유튜브 URL" className="bg-black p-3 rounded border border-white/10 text-white" />
            <div className="flex gap-4">
              <button onClick={() => setCategory('composition')} className={`flex-1 py-2 rounded transition-all ${category === 'composition' ? 'bg-green-500 text-black' : 'bg-white/10 text-white'}`}>작/편곡</button>
              <button onClick={() => setCategory('session')} className={`flex-1 py-2 rounded transition-all ${category === 'session' ? 'bg-green-500 text-black' : 'bg-white/10 text-white'}`}>세션 참여</button>
            </div>
            <button onClick={handleAddPortfolio} className="bg-white text-black font-bold py-3 rounded mt-2 hover:bg-gray-200 transition-colors">DB에 저장!</button>
          </div>
        </div>

        <div className="space-y-4">
          {portfolios.map((item, index) => (
            <div key={item.docId} className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5 group hover:border-white/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveOrder(index, 'up')} disabled={index === 0} className="text-gray-500 hover:text-white disabled:opacity-0"><ChevronUp size={18}/></button>
                  <button onClick={() => moveOrder(index, 'down')} disabled={index === portfolios.length - 1} className="text-gray-500 hover:text-white disabled:opacity-0"><ChevronDown size={18}/></button>
                </div>
                <div>
                  <span className="text-[10px] text-green-500 uppercase font-mono tracking-widest">{item.category}</span>
                  <p className="font-medium text-white">{item.title}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(item.docId)} className="text-red-500 text-sm hover:underline opacity-0 group-hover:opacity-100 transition-opacity">삭제</button>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};