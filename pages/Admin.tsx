import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc, writeBatch } from 'firebase/firestore';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ChevronUp, ChevronDown, RefreshCcw } from 'lucide-react';

export const Admin: React.FC = () => {
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

  const fetchPortfolios = async () => {
    // order 순으로 가져오기
    const q = query(collection(db, "portfolios"), orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    setPortfolios(data);
  };

  // 기존 데이터 복구 로직
  const repairOrder = async () => {
    if (!window.confirm("기존 데이터들에 순서 번호를 부여할까요?")) return;
    try {
      const q = query(collection(db, "portfolios"), orderBy("createdAt", "asc"));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach((docSnap, index) => {
        batch.update(doc(db, "portfolios", docSnap.id), { order: index });
      });
      await batch.commit();
      alert("복구 완료!");
      fetchPortfolios();
    } catch (err) { alert("복구 실패!"); }
  };

  // 순서 변경 (같은 카테고리 내에서만 스왑)
  const moveOrderInCategory = async (filteredList: any[], index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= filteredList.length) return;

    const currentItem = filteredList[index];
    const targetItem = filteredList[newIndex];

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

  const handleDelete = async (docId: string) => {
    if (window.confirm("삭제하시겠습니까?")) {
      await deleteDoc(doc(db, "portfolios", docId));
      fetchPortfolios();
    }
  };

  // 카테고리별 데이터 분리
  const compositionItems = portfolios.filter(p => p.category === 'composition');
  const sessionItems = portfolios.filter(p => p.category === 'session');

  if (!user) { /* 로그인 폼은 이전과 동일 */ return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center"><form onSubmit={(e) => { e.preventDefault(); signInWithEmailAndPassword(auth, email, password).catch(() => setError("실패!")); }} className="bg-white/5 p-8 rounded-2xl border border-white/10 w-96"><h2 className="text-2xl font-bold mb-6 text-center text-white">Admin Login</h2><input type="email" placeholder="Email" className="w-full p-3 mb-4 bg-black rounded border border-white/20 text-white" onChange={(e)=>setEmail(e.target.value)} /><input type="password" placeholder="Password" className="w-full p-3 mb-6 bg-black rounded border border-white/20 text-white" onChange={(e)=>setPassword(e.target.value)} /><button className="w-full bg-green-500 py-3 rounded font-bold text-black hover:bg-green-400">로그인</button>{error && <p className="text-red-500 mt-4 text-sm">{error}</p>}</form></div>; }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto pt-32 px-6 pb-20">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">작업물 관리</h1>
          <div className="flex gap-4">
            <button onClick={repairOrder} className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded text-xs"><RefreshCcw size={14} /> 순서 복구</button>
            <button onClick={() => auth.signOut()} className="text-gray-400 hover:text-white text-sm">로그아웃</button>
          </div>
        </div>

        {/* 입력 폼 */}
        <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-16">
          <div className="grid grid-cols-1 gap-4">
            <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="곡 제목" className="bg-black p-3 rounded border border-white/10 text-white" />
            <input value={youtubeUrl} onChange={(e)=>setYoutubeUrl(e.target.value)} placeholder="유튜브 URL" className="bg-black p-3 rounded border border-white/10 text-white" />
            <div className="flex gap-4">
              <button onClick={() => setCategory('composition')} className={`flex-1 py-2 rounded ${category === 'composition' ? 'bg-green-500 text-black' : 'bg-white/10 text-white'}`}>작/편곡</button>
              <button onClick={() => setCategory('session')} className={`flex-1 py-2 rounded ${category === 'session' ? 'bg-green-500 text-black' : 'bg-white/10 text-white'}`}>세션 참여</button>
            </div>
            <button onClick={handleAddPortfolio} className="bg-white text-black font-bold py-3 rounded mt-2">DB에 저장!</button>
          </div>
        </div>

        {/* 1번 줄: 작/편곡 리스트 */}
        <div className="mb-20">
          <h2 className="text-xl font-mono text-green-500 mb-6 flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> COMPOSITION & ARRANGEMENT</h2>
          <div className="space-y-3">
            {compositionItems.map((item, index) => (
              <AdminListCard key={item.docId} item={item} index={index} list={compositionItems} onMove={moveOrderInCategory} onDelete={handleDelete} />
            ))}
          </div>
        </div>

        {/* 2번 줄: 세션 참여 리스트 */}
        <div>
          <h2 className="text-xl font-mono text-blue-500 mb-6 flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> SESSION PARTICIPATION</h2>
          <div className="space-y-3">
            {sessionItems.map((item, index) => (
              <AdminListCard key={item.docId} item={item} index={index} list={sessionItems} onMove={moveOrderInCategory} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// 재사용을 위한 리스트 카드 컴포넌트
const AdminListCard = ({ item, index, list, onMove, onDelete }: any) => (
  <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5 group hover:border-white/20 transition-all">
    <div className="flex items-center gap-4">
      <div className="flex flex-col gap-1">
        <button onClick={() => onMove(list, index, 'up')} disabled={index === 0} className="text-gray-500 hover:text-white disabled:opacity-0"><ChevronUp size={18}/></button>
        <button onClick={() => onMove(list, index, 'down')} disabled={index === list.length - 1} className="text-gray-500 hover:text-white disabled:opacity-0"><ChevronDown size={18}/></button>
      </div>
      <p className="font-medium text-white">{item.title}</p>
    </div>
    <button onClick={() => onDelete(item.docId)} className="text-red-500 text-xs hover:underline opacity-0 group-hover:opacity-100 transition-opacity">삭제</button>
  </div>
);