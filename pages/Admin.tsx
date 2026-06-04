import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc, writeBatch, setDoc, serverTimestamp } from 'firebase/firestore';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ChevronUp, ChevronDown, RefreshCcw, Save } from 'lucide-react';

type InquiryStatus = 'new' | 'contacted' | 'quoting' | 'won' | 'lost' | 'archived';

type OriginalSongInquiry = {
  docId: string;
  sourceParam?: string;
  creatorName?: string;
  platforms?: string[];
  channelUrl?: string;
  purpose?: string;
  deadline?: string;
  packageName?: string;
  visualScope?: string;
  genres?: string[];
  styles?: Record<string, string>;
  selectedReference?: {
    artist?: string;
    title?: string;
    url?: string;
    style?: string;
    views?: string;
  } | null;
  customReferences?: string;
  readyMaterials?: string[];
  memo?: string;
  budget?: string;
  email?: string;
  discord?: string;
  xAccount?: string;
  sourceAnswer?: string;
  createdAt?: { seconds?: number };
  status?: InquiryStatus;
  adminMemo?: string;
};

const INQUIRY_STATUS_OPTIONS: Array<{ value: InquiryStatus; label: string }> = [
  { value: 'new', label: '신규' },
  { value: 'contacted', label: '연락 완료' },
  { value: 'quoting', label: '견적 진행' },
  { value: 'won', label: '계약 확정' },
  { value: 'lost', label: '보류/무산' },
  { value: 'archived', label: '보관' },
];

const csvCell = (value: unknown): string => {
  const text = Array.isArray(value) ? value.join(', ') : String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
};

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

  // ✨ 이벤트 응답
  const [applications, setApplications] = useState<any[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsSort, setAppsSort] = useState<'createdAt' | 'email'>('createdAt');
  const [inquiries, setInquiries] = useState<OriginalSongInquiry[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<'all' | InquiryStatus>('all');
  const [inquirySearch, setInquirySearch] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<OriginalSongInquiry | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchPortfolios();
        fetchPricing();
        fetchApplications();
        fetchInquiries();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchInquiries = async () => {
    setInquiriesLoading(true);
    try {
      const q = query(collection(db, 'original_song_inquiries'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((d) => ({
        docId: d.id,
        status: 'new' as InquiryStatus,
        ...d.data(),
      })) as OriginalSongInquiry[];
      setInquiries(data);
      setSelectedInquiry((current) => {
        if (!current) return data[0] || null;
        return data.find((item) => item.docId === current.docId) || data[0] || null;
      });
    } catch (err) {
      console.error('Original Song Inquiries Fetch Error:', err);
    } finally {
      setInquiriesLoading(false);
    }
  };

  const fetchApplications = async () => {
    setAppsLoading(true);
    try {
      const q = query(collection(db, "event_applications"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(d => ({ docId: d.id, ...d.data() }));
      setApplications(data);
    } catch (err) {
      console.error("Applications Fetch Error:", err);
    } finally {
      setAppsLoading(false);
    }
  };

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

  const updateInquiryStatus = async (docId: string, status: InquiryStatus) => {
    await updateDoc(doc(db, 'original_song_inquiries', docId), {
      status,
      updatedAt: serverTimestamp(),
    });
    setInquiries((prev) => prev.map((item) => (item.docId === docId ? { ...item, status } : item)));
    setSelectedInquiry((prev) => (prev?.docId === docId ? { ...prev, status } : prev));
  };

  const updateInquiryMemo = async (docId: string, adminMemo: string) => {
    await updateDoc(doc(db, 'original_song_inquiries', docId), {
      adminMemo,
      updatedAt: serverTimestamp(),
    });
    setInquiries((prev) => prev.map((item) => (item.docId === docId ? { ...item, adminMemo } : item)));
    setSelectedInquiry((prev) => (prev?.docId === docId ? { ...prev, adminMemo } : prev));
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

  // 이벤트 응답: createdAt 또는 email 기준 정렬 (이메일 정렬 시 중복 육안 확인)
  const sortedApplications = [...applications].sort((a, b) => {
    if (appsSort === 'email') {
      return (a.email || '').localeCompare(b.email || '');
    }
    // createdAt(서버 타임스탬프) 내림차순. 직렬화 안전하게 seconds 비교
    const ta = a.createdAt?.seconds ?? 0;
    const tb = b.createdAt?.seconds ?? 0;
    return tb - ta;
  });

  const fmtDate = (ts: any): string => {
    if (!ts?.seconds) return '-';
    return new Date(ts.seconds * 1000).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });
  };

  const normalizedInquirySearch = inquirySearch.trim().toLowerCase();
  const filteredInquiries = inquiries.filter((item) => {
    const status = item.status || 'new';
    const statusMatches = inquiryStatusFilter === 'all' || status === inquiryStatusFilter;
    const searchTarget = [
      item.creatorName,
      item.email,
      item.discord,
      item.xAccount,
      item.channelUrl,
      item.sourceParam,
      item.sourceAnswer,
      item.packageName,
      item.purpose,
    ].filter(Boolean).join(' ').toLowerCase();
    const searchMatches = !normalizedInquirySearch || searchTarget.includes(normalizedInquirySearch);
    return statusMatches && searchMatches;
  });

  const exportInquiriesCsv = () => {
    const header = ['접수일', '상태', '활동명', '이메일', '디스코드', 'X', '채널', '플랫폼', '목적', '납기', '패키지', '비주얼', '장르', '예산', '유입', '관리자 메모'];
    const rows = filteredInquiries.map((item) => [
      fmtDate(item.createdAt),
      INQUIRY_STATUS_OPTIONS.find((option) => option.value === (item.status || 'new'))?.label || '신규',
      item.creatorName,
      item.email,
      item.discord,
      item.xAccount,
      item.channelUrl,
      item.platforms,
      item.purpose,
      item.deadline,
      item.packageName,
      item.visualScope,
      item.genres,
      item.budget,
      item.sourceParam || item.sourceAnswer,
      item.adminMemo,
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `original-song-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-6 py-32">

        {/* 오리지널곡 제작 문의 SECTION */}
        <div className="mb-16 p-8 bg-white/[0.02] rounded-2xl border border-[#E2B6F7]/15 backdrop-blur-sm">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h2 className="text-xl font-mono text-[#E2B6F7] flex items-center gap-2">
              <span className="w-2 h-2 bg-[#E2B6F7] rounded-full animate-pulse"></span>
              ORIGINAL SONG INQUIRIES
              <span className="text-xs text-gray-500 font-mono">({filteredInquiries.length}/{inquiries.length}건)</span>
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={inquirySearch}
                onChange={(e) => setInquirySearch(e.target.value)}
                placeholder="활동명 / 이메일 / 디스코드 검색"
                className="bg-black border border-white/10 px-3 py-2 rounded-lg text-xs outline-none focus:border-[#E2B6F7] min-w-[240px]"
              />
              <select
                value={inquiryStatusFilter}
                onChange={(e) => setInquiryStatusFilter(e.target.value as 'all' | InquiryStatus)}
                className="bg-black border border-white/10 px-3 py-2 rounded-lg text-xs font-mono outline-none focus:border-[#E2B6F7] cursor-pointer"
              >
                <option value="all">전체 상태</option>
                {INQUIRY_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <button
                onClick={exportInquiriesCsv}
                className="bg-[#E2B6F7]/10 hover:bg-[#E2B6F7]/20 border border-[#E2B6F7]/30 text-[#E2B6F7] px-3 py-2 rounded-lg text-xs font-mono transition"
              >
                CSV 내보내기
              </button>
              <button
                onClick={fetchInquiries}
                className="bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-lg text-xs font-mono transition flex items-center gap-2"
              >
                <RefreshCcw size={14} className={inquiriesLoading ? 'animate-spin' : ''} /> 새로고침
              </button>
            </div>
          </div>

          {filteredInquiries.length === 0 ? (
            <div className="text-center text-gray-600 font-mono text-sm py-12 border border-dashed border-white/10 rounded-xl">
              {inquiriesLoading ? '불러오는 중…' : '접수 데이터가 없습니다.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-gray-500 font-mono uppercase tracking-wider border-b border-white/10">
                      <th className="py-3 pr-4 whitespace-nowrap">접수일</th>
                      <th className="py-3 pr-4 whitespace-nowrap">활동명</th>
                      <th className="py-3 pr-4 whitespace-nowrap">연락처</th>
                      <th className="py-3 pr-4 whitespace-nowrap">패키지</th>
                      <th className="py-3 pr-4 whitespace-nowrap">장르</th>
                      <th className="py-3 pr-4 whitespace-nowrap">예산</th>
                      <th className="py-3 pr-4 whitespace-nowrap">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInquiries.map((item) => (
                      <tr
                        key={item.docId}
                        onClick={() => setSelectedInquiry(item)}
                        className="border-b border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer"
                      >
                        <td className="py-3 pr-4 whitespace-nowrap text-gray-500 font-mono">{fmtDate(item.createdAt)}</td>
                        <td className="py-3 pr-4 whitespace-nowrap text-white font-medium">{item.creatorName || '-'}</td>
                        <td className="py-3 pr-4 whitespace-nowrap text-gray-400">
                          <div className="text-[#E2B6F7]">{item.email || '-'}</div>
                          <div>{item.discord || '-'}</div>
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap text-gray-400">{item.packageName || '-'}</td>
                        <td className="py-3 pr-4 whitespace-nowrap text-gray-400">{Array.isArray(item.genres) ? item.genres.join(', ') : '-'}</td>
                        <td className="py-3 pr-4 whitespace-nowrap text-gray-400">{item.budget || '-'}</td>
                        <td className="py-3 pr-4 whitespace-nowrap">
                          <select
                            value={item.status || 'new'}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateInquiryStatus(item.docId, e.target.value as InquiryStatus)}
                            className="bg-black border border-white/10 px-2 py-1 rounded text-[11px] outline-none focus:border-[#E2B6F7]"
                          >
                            {INQUIRY_STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <InquiryDetailCard
                inquiry={selectedInquiry}
                fmtDate={fmtDate}
                onStatusChange={updateInquiryStatus}
                onMemoSave={updateInquiryMemo}
              />
            </div>
          )}
        </div>

        {/* ✨ 이벤트 응답 SECTION */}
        <div className="mb-16 p-8 bg-white/[0.02] rounded-2xl border border-white/5 backdrop-blur-sm">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h2 className="text-xl font-mono text-[#E2B6F7] flex items-center gap-2">
              <span className="w-2 h-2 bg-[#E2B6F7] rounded-full animate-pulse"></span>
              EVENT APPLICATIONS
              <span className="text-xs text-gray-500 font-mono">({applications.length}건)</span>
            </h2>
            <div className="flex items-center gap-2">
              <select
                value={appsSort}
                onChange={(e: any) => setAppsSort(e.target.value)}
                className="bg-black border border-white/10 px-3 py-2 rounded-lg text-xs font-mono outline-none focus:border-[#E2B6F7] transition cursor-pointer"
              >
                <option value="createdAt">최신순</option>
                <option value="email">이메일순 (중복 확인)</option>
              </select>
              <button
                onClick={fetchApplications}
                className="bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-lg text-xs font-mono transition flex items-center gap-2"
              >
                <RefreshCcw size={14} className={appsLoading ? 'animate-spin' : ''} /> 새로고침
              </button>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="text-center text-gray-600 font-mono text-sm py-12 border border-dashed border-white/10 rounded-xl">
              {appsLoading ? '불러오는 중…' : '아직 응모 데이터가 없습니다.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-500 font-mono uppercase tracking-wider border-b border-white/10">
                    <th className="py-3 pr-4 whitespace-nowrap">접수일</th>
                    <th className="py-3 pr-4 whitespace-nowrap">활동명</th>
                    <th className="py-3 pr-4 whitespace-nowrap">이메일</th>
                    <th className="py-3 pr-4 whitespace-nowrap">X 계정</th>
                    <th className="py-3 pr-4 whitespace-nowrap">팔로워</th>
                    <th className="py-3 pr-4 whitespace-nowrap">플랫폼</th>
                    <th className="py-3 pr-4 whitespace-nowrap">장르</th>
                    <th className="py-3 pr-4 whitespace-nowrap">예산</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedApplications.map((app) => (
                    <tr key={app.docId} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 pr-4 whitespace-nowrap text-gray-500 font-mono">{fmtDate(app.createdAt)}</td>
                      <td className="py-3 pr-4 whitespace-nowrap text-white font-medium">{app.vtuberName || '-'}</td>
                      <td className="py-3 pr-4 whitespace-nowrap text-[#E2B6F7]">{app.email || '-'}</td>
                      <td className="py-3 pr-4 whitespace-nowrap text-gray-400">{app.xAccount || '-'}</td>
                      <td className="py-3 pr-4 whitespace-nowrap text-gray-400">{app.follower || '-'}</td>
                      <td className="py-3 pr-4 whitespace-nowrap text-gray-400">{Array.isArray(app.platforms) ? app.platforms.join(', ') : '-'}</td>
                      <td className="py-3 pr-4 whitespace-nowrap text-gray-400">{Array.isArray(app.genres) ? app.genres.join(', ') : '-'}</td>
                      <td className="py-3 pr-4 whitespace-nowrap text-gray-400">{app.budget || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

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

const InquiryDetailCard = ({
  inquiry,
  fmtDate,
  onStatusChange,
  onMemoSave,
}: {
  inquiry: OriginalSongInquiry | null;
  fmtDate: (ts: any) => string;
  onStatusChange: (docId: string, status: InquiryStatus) => void;
  onMemoSave: (docId: string, adminMemo: string) => void;
}) => {
  const [memoDraft, setMemoDraft] = useState('');

  useEffect(() => {
    setMemoDraft(inquiry?.adminMemo || '');
  }, [inquiry?.docId, inquiry?.adminMemo]);

  if (!inquiry) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/30 p-5 text-sm text-gray-500">
        좌측 목록에서 접수 건을 선택하세요.
      </div>
    );
  }

  const stylesText = inquiry.styles
    ? Object.entries(inquiry.styles).map(([genre, style]) => `${genre}: ${style}`).join(' / ')
    : '-';

  const referenceText = inquiry.selectedReference
    ? `${inquiry.selectedReference.artist || '-'} - ${inquiry.selectedReference.title || '-'}`
    : inquiry.customReferences || '-';

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-5 text-sm text-gray-300 xl:sticky xl:top-28 self-start">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="text-xs font-mono text-[#E2B6F7] mb-1">{fmtDate(inquiry.createdAt)}</div>
          <h3 className="text-xl font-bold text-white">{inquiry.creatorName || '-'}</h3>
          <div className="text-xs text-gray-500 mt-1">{inquiry.sourceParam || inquiry.sourceAnswer || '유입 미기록'}</div>
        </div>
        <select
          value={inquiry.status || 'new'}
          onChange={(e) => onStatusChange(inquiry.docId, e.target.value as InquiryStatus)}
          className="bg-black border border-white/10 px-2 py-2 rounded text-xs outline-none focus:border-[#E2B6F7]"
        >
          {INQUIRY_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 text-xs leading-relaxed">
        <DetailRow label="이메일" value={inquiry.email} />
        <DetailRow label="디스코드" value={inquiry.discord} />
        <DetailRow label="X" value={inquiry.xAccount} />
        <DetailRow label="채널" value={inquiry.channelUrl} link />
        <DetailRow label="플랫폼" value={Array.isArray(inquiry.platforms) ? inquiry.platforms.join(', ') : '-'} />
        <DetailRow label="목적/납기" value={`${inquiry.purpose || '-'} / ${inquiry.deadline || '-'}`} />
        <DetailRow label="패키지" value={`${inquiry.packageName || '-'} / ${inquiry.visualScope || '-'}`} />
        <DetailRow label="장르/스타일" value={`${Array.isArray(inquiry.genres) ? inquiry.genres.join(', ') : '-'} / ${stylesText}`} />
        {inquiry.selectedReference?.url ? (
          <DetailRow label="레퍼런스" value={`${referenceText}\n${inquiry.selectedReference.url}`} />
        ) : (
          <DetailRow label="레퍼런스" value={referenceText} />
        )}
        <DetailRow label="준비 자료" value={Array.isArray(inquiry.readyMaterials) ? inquiry.readyMaterials.join(', ') : '-'} />
        <DetailRow label="예산" value={inquiry.budget} />
        <DetailRow label="제작 메모" value={inquiry.memo} />
      </div>

      <div className="mt-5">
        <label className="block text-[10px] text-gray-500 uppercase tracking-wider font-mono mb-2">Admin Memo</label>
        <textarea
          value={memoDraft}
          onChange={(e) => setMemoDraft(e.target.value)}
          className="w-full min-h-28 resize-y rounded-lg border border-white/10 bg-black p-3 text-xs text-white outline-none focus:border-[#E2B6F7]"
          placeholder="연락 내용, 견적 메모, 후속 액션 기록"
        />
        <button
          onClick={() => onMemoSave(inquiry.docId, memoDraft)}
          className="mt-3 w-full rounded-lg bg-[#E2B6F7] px-4 py-3 text-xs font-bold text-black hover:brightness-110 transition"
        >
          메모 저장
        </button>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, link }: { label: string; value?: string; link?: boolean }) => {
  const display = value || '-';
  return (
    <div className="border-b border-white/5 pb-2">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
      {link && value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="break-all text-[#E2B6F7] hover:text-white">
          {value}
        </a>
      ) : (
        <div className="whitespace-pre-wrap break-words text-gray-300">{display}</div>
      )}
    </div>
  );
};
