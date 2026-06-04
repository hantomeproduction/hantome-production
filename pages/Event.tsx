import React, { useState, useMemo } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import songsData from '../data/vtuber_songs.json';

// ──────────────────────────────────────────────
// 타입 & 상수
// ──────────────────────────────────────────────
interface Song {
  rank: number;
  artist: string;
  title: string;
  genres: string[];
  style: string;
  notes: string;
  views: string;
  url: string;
}

const DB: Song[] = songsData as Song[];

// 폼 표기(가운뎃점) → JSON genres 표기(슬래시) 매핑
const GENRE_MAP: Record<string, string | null> = {
  '케이팝': '케이팝',
  '제이팝': '제이팝',
  '댄스·일렉트로닉': '댄스/일렉트로닉',
  '락·밴드': '락/밴드',
  '발라드': '발라드',
  '알앤비·힙합': '알앤비/힙합',
  '국악·전통': '국악/전통',
  '기타': null,
};

// 장르별 선택 가능 스타일 (null = 스타일 선택 스킵)
const STYLE_MAP: Record<string, string[] | null> = {
  '케이팝': ['신나는', '감성적인', '청량한', '실험적·몽환적'],
  '제이팝': ['신나는', '감성적인', '청량한', '귀여운'],
  '댄스·일렉트로닉': ['신나는', '귀여운'],
  '락·밴드': ['신나는', '감성적인', '청량한'],
  '발라드': null,
  '알앤비·힙합': ['신나는', '감성적인', '청량한', '실험적·몽환적'],
  '국악·전통': ['신나는', '감성적인'],
  '기타': null,
};

const GENRES = ['케이팝', '제이팝', '댄스·일렉트로닉', '락·밴드', '발라드', '알앤비·힙합', '국악·전통', '기타'];
const PLATFORMS = ['숲(SOOP)', '치지직', '씨미', '유튜브', '기타'];
const FOLLOWERS = ['1,000 ~ 5,000', '5,000 ~ 2만', '2만 이상'];
const READY = ['가사 완성됨', '가사 작업 의향 있음', '데모(흥얼거림) 있음', '아트 소스 준비됨', '전부 오마카세로 맡기고 싶음'];
const CHANNELS = ['X(트위터)', '지인 소개', '유튜브·커뮤니티', '기타'];
const FREQS = ['월 1회 이상', '분기 1회 이상', '올해 처음 도전', '아직 없음'];
const BUDGETS = ['100만 원 미만', '100 ~ 200만 원', '200 ~ 300만 원', '300만 원 이상'];

// ⚠️ 대표 결정 블로커 — 확정 후 교체
const ANNOUNCE_DATE = '당첨자 발표 D-Day 예정'; // TODO: 실제 발표일로 교체
const X_EVENT_URL = ''; // TODO: 실제 X(트위터) 이벤트 게시물 URL 삽입

// ──────────────────────────────────────────────
// 헬퍼
// ──────────────────────────────────────────────
const parseViews = (v: string): number => {
  if (!v) return 0;
  if (v.endsWith('M')) return parseFloat(v) * 1_000_000;
  if (v.endsWith('K')) return parseFloat(v) * 1_000;
  return parseFloat(v) || 0;
};

const getVideoId = (url: string): string | null => {
  const m = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
};

// 장르×스타일 매칭 → 뷰수 상위. 0건이면 폴백(해당 장르 뷰수 상위)
const matchSongs = (formGenre: string, style: string, limit: number): { items: Song[]; isFallback: boolean } => {
  const dbGenre = GENRE_MAP[formGenre];
  if (!dbGenre) return { items: [], isFallback: false };

  const exact = DB
    .filter((s) => s.genres.includes(dbGenre) && s.style === style)
    .sort((a, b) => parseViews(b.views) - parseViews(a.views))
    .slice(0, limit);

  if (exact.length > 0) return { items: exact, isFallback: false };

  // 폴백: 스타일 무관, 해당 장르 뷰수 상위
  const fallback = DB
    .filter((s) => s.genres.includes(dbGenre))
    .sort((a, b) => parseViews(b.views) - parseViews(a.views))
    .slice(0, limit);

  return { items: fallback, isFallback: true };
};

// ──────────────────────────────────────────────
// 작은 UI 조각
// ──────────────────────────────────────────────
const OptBtn: React.FC<{ active: boolean; disabled?: boolean; onClick?: () => void; children: React.ReactNode; full?: boolean }> = ({
  active, disabled, onClick, children, full,
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={[
      'rounded-[20px] border-[1.5px] text-sm transition-all outline-none font-[inherit]',
      full ? 'text-left rounded-[10px] px-[18px] py-[14px] w-full' : 'px-[18px] py-[10px]',
      disabled
        ? 'opacity-30 cursor-not-allowed border-[#333] bg-[#111] text-[#aaa]'
        : active
          ? 'bg-[rgba(226,182,247,0.15)] border-[#E2B6F7] text-[#E2B6F7] font-bold'
          : 'border-[#333] bg-[#111] text-[#aaa] hover:border-[#E2B6F7] hover:text-white cursor-pointer',
    ].join(' ')}
  >
    {children}
  </button>
);

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-xs font-bold text-[#E2B6F7] tracking-[0.1em] mb-2">{children}</div>
);

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className="w-full bg-[#111] border-[1.5px] border-[#333] rounded-lg text-[#e0e0e0] px-4 py-3 text-[15px] font-[inherit] mb-5 outline-none transition-colors focus:border-[#E2B6F7] placeholder:text-[#444]"
  />
);

const RefCard: React.FC<{ song: Song }> = ({ song }) => {
  const vid = getVideoId(song.url);
  const thumb = vid ? `https://img.youtube.com/vi/${vid}/mqdefault.jpg` : '';
  return (
    <a
      href={song.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-[14px] items-center bg-[#0f0f0f] border border-[#222] rounded-[10px] p-3 no-underline transition-colors hover:border-[#E2B6F7]"
    >
      {thumb ? (
        <img src={thumb} alt={song.title} loading="lazy" className="w-24 h-[54px] object-cover rounded-md shrink-0 bg-[#1a1a1a]" />
      ) : (
        <div className="w-24 h-[54px] rounded-md shrink-0 bg-[#1a1a1a]" />
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-white mb-1 truncate">{song.title}</div>
        <div className="text-xs text-[#666]">{song.artist}</div>
        {song.views && <div className="text-[11px] text-[#444] mt-0.5">조회수 {song.views}</div>}
      </div>
      <span className="text-[#333] shrink-0 text-lg">›</span>
    </a>
  );
};

// ──────────────────────────────────────────────
// 메인 컴포넌트
// ──────────────────────────────────────────────
export const Event: React.FC = () => {
  // 화면: 0(안내) ~ 7(연락처), 'result'
  const [screen, setScreen] = useState<number | 'result'>(0);

  // 동의
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);

  // Step 1
  const [vtuberName, setVtuberName] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [follower, setFollower] = useState('');

  // Step 2
  const [exp, setExp] = useState(''); // '있음' | '없음 (이번이 처음)'
  const [creativePart, setCreativePart] = useState('');

  // Step 3
  const [genres, setGenres] = useState<string[]>([]);
  const [styles, setStyles] = useState<Record<string, string>>({});
  const [genreOtherUrl, setGenreOtherUrl] = useState(''); // 기타 장르 링크
  const [styleOtherUrls, setStyleOtherUrls] = useState<Record<string, string>>({}); // 장르별 기타 스타일 링크

  // Step 4
  const [mvType, setMvType] = useState('');

  // Step 5
  const [ready, setReady] = useState<string[]>([]);

  // Step 6
  const [channel, setChannel] = useState('');
  const [freq, setFreq] = useState('');
  const [budget, setBudget] = useState('');

  // Step 7
  const [email, setEmail] = useState('');
  const [xAccount, setXAccount] = useState('');
  const [agree, setAgree] = useState(false);

  // 제출 상태
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // ── validation ──
  const valid = useMemo(() => {
    const v: Record<number, boolean> = {};
    v[1] = vtuberName.trim().length > 0 && platforms.length > 0 && follower !== '';
    v[2] = exp !== '' && (exp !== '있음' || creativePart !== '');
    v[3] = genres.length > 0 && genres.every((g) => {
      if (g === '기타') return genreOtherUrl.trim().length > 0;
      if (STYLE_MAP[g] === null) return true; // 발라드 자동
      const s = styles[g];
      if (!s) return false;
      if (s === '기타') return (styleOtherUrls[g] || '').trim().length > 0;
      return true;
    });
    v[4] = mvType !== '';
    v[5] = ready.length > 0;
    v[6] = channel !== '' && freq !== '' && budget !== '';
    v[7] = /.+@.+\..+/.test(email.trim()) && xAccount.trim().length > 0 && agree;
    return v;
  }, [vtuberName, platforms, follower, exp, creativePart, genres, styles, genreOtherUrl, styleOtherUrls, mvType, ready, channel, freq, budget, email, xAccount, agree]);

  const canStart = check1 && check2;

  // ── 토글 헬퍼 ──
  const toggleArr = (arr: string[], val: string, setter: (a: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const selectGenre = (g: string) => {
    if (genres.includes(g)) {
      setGenres(genres.filter((x) => x !== g));
      const ns = { ...styles }; delete ns[g]; setStyles(ns);
    } else {
      if (genres.length >= 2) return; // 최대 2개
      setGenres([...genres, g]);
      if (g === '발라드') setStyles((prev) => ({ ...prev, '발라드': '감성적인' }));
    }
  };

  const selectStyle = (g: string, s: string) => {
    setStyles((prev) => ({ ...prev, [g]: s }));
  };

  // ── 네비게이션 ──
  const goNext = () => setScreen((s) => (typeof s === 'number' ? s + 1 : s));
  const goBack = () => setScreen((s) => (typeof s === 'number' ? s - 1 : s));
  const progressPct = screen === 'result' ? 100 : Math.round(((screen as number) / 7) * 100);

  // ── 제출 ──
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      await addDoc(collection(db, 'event_applications'), {
        vtuberName: vtuberName.trim(),
        platforms,
        follower,
        experience: exp,
        creativePart: exp === '있음' ? creativePart : '',
        genres,
        styles,
        genreOtherUrl: genres.includes('기타') ? genreOtherUrl.trim() : '',
        styleOtherUrls,
        mvType,
        ready,
        channel,
        uploadFreq: freq,
        budget,
        email: email.trim(),
        xAccount: xAccount.trim(),
        agree,
        createdAt: serverTimestamp(),
      });
      setScreen('result');
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('이벤트 응모 저장 실패:', err);
      setSubmitError('응모 제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  // ──────────────────────────────────────────────
  // 결과화면 데이터 계산
  // ──────────────────────────────────────────────
  const hasOther = genres.includes('기타') || Object.values(styles).includes('기타');

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0]" style={{ fontFamily: "'Paperlogy', 'Apple SD Gothic Neo', sans-serif" }}>
      <Navbar />

      <div className="max-w-[600px] mx-auto px-4 pt-32 pb-24">
        {/* Progress */}
        <div className="bg-[#1a1a1a] h-[3px] rounded-sm mb-8 overflow-hidden">
          <div
            className="h-full rounded-sm transition-[width] duration-[400ms] ease-out"
            style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #E2B6F7, #c084fc)' }}
          />
        </div>

        {/* ── Screen 0: 안내 ── */}
        {screen === 0 && (
          <div>
            <div className="text-[11px] font-bold text-[#E2B6F7] tracking-[0.2em] uppercase mb-3">이벤트 안내</div>
            <h1 className="text-[22px] font-bold text-white mb-2 leading-tight">오리지널 곡 무료 제작<br />이벤트 참여 안내</h1>
            <p className="text-sm text-[#888] mb-7 leading-relaxed">응모 전 아래 내용을 확인해 주세요.</p>

            <div className="bg-[#0f0f0f] border border-[#333] border-l-[3px] border-l-[#E2B6F7] px-5 py-4 mb-6 text-[13px] text-[#bbb] leading-[1.7]">
              본 이벤트는 <strong className="text-[#E2B6F7]">팔로워 1,000명 이상의 버츄얼 크리에이터 본인</strong>만 참여 가능합니다.<br />
              본인 신청이 아닌 경우 당첨 시 취소될 수 있습니다.<br /><br />
              참여 전 한토메 프로덕션 <strong className="text-[#E2B6F7]">X(트위터) 팔로우 + RT</strong>를 완료해 주세요.
              {X_EVENT_URL && (
                <>
                  <br />
                  <a href={X_EVENT_URL} target="_blank" rel="noopener noreferrer" className="text-[#E2B6F7] underline">이벤트 게시물 바로가기 →</a>
                </>
              )}
            </div>

            <label className="flex items-start gap-3 mb-[14px] cursor-pointer">
              <input type="checkbox" checked={check1} onChange={(e) => setCheck1(e.target.checked)} className="w-[18px] h-[18px] mt-0.5 shrink-0 cursor-pointer" style={{ accentColor: '#E2B6F7' }} />
              <span className="text-sm text-[#ccc] leading-snug">X(트위터) 팔로우 + RT를 완료했습니다</span>
            </label>
            <label className="flex items-start gap-3 mb-[14px] cursor-pointer">
              <input type="checkbox" checked={check2} onChange={(e) => setCheck2(e.target.checked)} className="w-[18px] h-[18px] mt-0.5 shrink-0 cursor-pointer" style={{ accentColor: '#E2B6F7' }} />
              <span className="text-sm text-[#ccc] leading-snug">본인이 직접 신청합니다 (본인 신청이 아닐 경우 당첨이 취소될 수 있습니다)</span>
            </label>

            <NavRow onlyNext nextDisabled={!canStart} nextLabel="응모 시작하기 →" onNext={goNext} />
          </div>
        )}

        {/* ── Screen 1: 기본 정보 ── */}
        {screen === 1 && (
          <StepWrap step={1} title="기본 정보" desc="활동명과 주요 플랫폼을 알려주세요.">
            <FieldLabel>버츄얼 크리에이터 활동명</FieldLabel>
            <TextInput value={vtuberName} onChange={(e) => setVtuberName(e.target.value)} placeholder="활동명을 입력해 주세요" />

            <FieldLabel>주 활동 플랫폼 <span className="font-normal text-[#555] text-[11px]">(복수 선택 가능)</span></FieldLabel>
            <div className="flex flex-wrap gap-[10px] mb-5">
              {PLATFORMS.map((p) => (
                <OptBtn key={p} active={platforms.includes(p)} onClick={() => toggleArr(platforms, p, setPlatforms)}>{p}</OptBtn>
              ))}
            </div>

            <FieldLabel>팔로워 규모</FieldLabel>
            <div className="flex flex-wrap gap-[10px] mb-5">
              {FOLLOWERS.map((f) => (
                <OptBtn key={f} active={follower === f} onClick={() => setFollower(f)}>{f}</OptBtn>
              ))}
            </div>

            <NavRow nextDisabled={!valid[1]} onNext={goNext} onBack={goBack} />
          </StepWrap>
        )}

        {/* ── Screen 2: 오리지널 경험 ── */}
        {screen === 2 && (
          <StepWrap step={2} title="오리지널 경험" desc="이전에 오리지널 곡을 만들어 본 적 있으신가요?">
            <FieldLabel>오리지널 곡 제작 경험</FieldLabel>
            <div className="flex flex-wrap gap-[10px] mb-5">
              {['있음', '없음 (이번이 처음)'].map((o) => (
                <OptBtn key={o} active={exp === o} onClick={() => { setExp(o); if (o !== '있음') setCreativePart(''); }}>{o}</OptBtn>
              ))}
            </div>

            {exp === '있음' && (
              <div className="-mt-2 mb-5 p-4 bg-[#0f0f0f] border border-[#222] rounded-lg">
                <div className="text-xs font-bold text-[#aaa] tracking-[0.1em] mb-2">창작에 직접 참여하셨나요?</div>
                <div className="flex flex-wrap gap-[10px]">
                  {['예, 직접 참여했어요', '아니요, 외주를 맡겼어요'].map((o) => (
                    <OptBtn key={o} active={creativePart === o} onClick={() => setCreativePart(o)}>{o}</OptBtn>
                  ))}
                </div>
              </div>
            )}

            <NavRow nextDisabled={!valid[2]} onNext={goNext} onBack={goBack} />
          </StepWrap>
        )}

        {/* ── Screen 3: 장르 & 스타일 ── */}
        {screen === 3 && (
          <StepWrap step={3} title="장르 & 스타일" desc={<>만들고 싶은 곡의 분위기를 선택해 주세요.<br />선택에 맞는 레퍼런스를 보여드릴게요.</>}>
            <FieldLabel>장르 <span className="font-normal text-[#555] text-[11px]">(최대 2개 선택 가능)</span></FieldLabel>
            <div className="flex flex-wrap gap-[10px] mb-5">
              {GENRES.map((g) => (
                <OptBtn key={g} active={genres.includes(g)} onClick={() => selectGenre(g)}>{g}</OptBtn>
              ))}
            </div>

            {/* 스타일 섹션 (선택 장르별) */}
            {genres.map((g) => {
              if (g === '기타') {
                return (
                  <div key={g} className="mt-3">
                    <FieldLabel>기타 장르 레퍼런스 유튜브 링크</FieldLabel>
                    <TextInput type="url" value={genreOtherUrl} onChange={(e) => setGenreOtherUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
                  </div>
                );
              }
              if (STYLE_MAP[g] === null) {
                return (
                  <div key={g} className="mt-3 px-4 py-3 bg-[#0f0f0f] border border-[#222] rounded-lg">
                    <span className="text-[13px] text-[#888]">발라드는 자동으로 <strong className="text-[#E2B6F7]">감성적인</strong> 스타일로 레퍼런스가 큐레이션됩니다.</span>
                  </div>
                );
              }
              const styleOpts = [...(STYLE_MAP[g] as string[]), '기타'];
              const cur = styles[g] || '';
              const label = genres.length > 1 ? `${g} 스타일` : '스타일';
              return (
                <div key={g} className="mt-3">
                  <FieldLabel>{label}</FieldLabel>
                  <div className="flex flex-wrap gap-[10px] mb-2">
                    {styleOpts.map((s) => (
                      <OptBtn key={s} active={cur === s} onClick={() => selectStyle(g, s)}>{s}</OptBtn>
                    ))}
                  </div>
                  {cur === '기타' && (
                    <div className="mb-5 p-4 bg-[#0f0f0f] border border-[#222] rounded-lg">
                      <div className="text-xs font-bold text-[#aaa] tracking-[0.1em] mb-2">레퍼런스 유튜브 링크</div>
                      <TextInput type="url" value={styleOtherUrls[g] || ''} onChange={(e) => setStyleOtherUrls((prev) => ({ ...prev, [g]: e.target.value }))} placeholder="https://www.youtube.com/watch?v=..." />
                    </div>
                  )}
                </div>
              );
            })}

            <NavRow nextDisabled={!valid[3]} onNext={goNext} onBack={goBack} />
          </StepWrap>
        )}

        {/* ── Screen 4: MV 형태 ── */}
        {screen === 4 && (
          <StepWrap step={4} title="MV 형태" desc={<>원하시는 MV 형태를 선택해 주세요.<br />이번 이벤트는 심플타입만 지원됩니다.</>}>
            <div className="flex flex-col gap-[10px] mb-5">
              <OptBtn full active={mvType === '심플타입'} onClick={() => setMvType('심플타입')}>
                <strong>✅ 심플타입</strong> — 일러스트 1장
                <span className="block text-xs text-[#888] mt-1">이번 이벤트 대상 플랜</span>
              </OptBtn>
              <OptBtn full active={false} disabled>
                <strong>🔒 고급타입</strong> — 일러스트 3~5장<span className="text-[11px] ml-1">유료 서비스</span>
                <span className="block text-xs text-[#555] mt-1">유료 서비스 문의: hantomeproduction@gmail.com</span>
              </OptBtn>
              <OptBtn full active={false} disabled>
                <strong>🔒 스토리타입</strong> — 일러스트 7장 이상<span className="text-[11px] ml-1">유료 서비스</span>
                <span className="block text-xs text-[#555] mt-1">유료 서비스 문의: hantomeproduction@gmail.com</span>
              </OptBtn>
              <OptBtn full active={false} disabled>
                <strong>🔒 기타 구상 있음</strong><span className="text-[11px] ml-1">유료 서비스</span>
                <span className="block text-xs text-[#555] mt-1">유료 서비스 문의: hantomeproduction@gmail.com</span>
              </OptBtn>
            </div>

            <NavRow nextDisabled={!valid[4]} onNext={goNext} onBack={goBack} />
          </StepWrap>
        )}

        {/* ── Screen 5: 제작 준비 상태 ── */}
        {screen === 5 && (
          <StepWrap step={5} title="제작 준비 상태" desc="현재 준비된 것을 모두 선택해 주세요. (복수 선택 가능)">
            <div className="flex flex-wrap gap-[10px] mb-5">
              {READY.map((r) => (
                <OptBtn key={r} active={ready.includes(r)} onClick={() => toggleArr(ready, r, setReady)}>{r}</OptBtn>
              ))}
            </div>
            <NavRow nextDisabled={!valid[5]} onNext={goNext} onBack={goBack} />
          </StepWrap>
        )}

        {/* ── Screen 6: 활동 현황 ── */}
        {screen === 6 && (
          <StepWrap step={6} title="활동 현황" desc="더 좋은 서비스를 위한 질문이에요.">
            <FieldLabel>이 이벤트를 어떻게 알게 됐나요?</FieldLabel>
            <div className="flex flex-wrap gap-[10px] mb-5">
              {CHANNELS.map((c) => (
                <OptBtn key={c} active={channel === c} onClick={() => setChannel(c)}>{c}</OptBtn>
              ))}
            </div>

            <FieldLabel>음악 콘텐츠 업로드 빈도</FieldLabel>
            <div className="flex flex-wrap gap-[10px] mb-5">
              {FREQS.map((f) => (
                <OptBtn key={f} active={freq === f} onClick={() => setFreq(f)}>{f}</OptBtn>
              ))}
            </div>

            <FieldLabel>오리지널 제작 예산으로 예상했던 금액</FieldLabel>
            <div className="flex flex-wrap gap-[10px] mb-5">
              {BUDGETS.map((b) => (
                <OptBtn key={b} active={budget === b} onClick={() => setBudget(b)}>{b}</OptBtn>
              ))}
            </div>

            <NavRow nextDisabled={!valid[6]} onNext={goNext} onBack={goBack} />
          </StepWrap>
        )}

        {/* ── Screen 7: 연락처 ── */}
        {screen === 7 && (
          <StepWrap step={7} title="연락처" desc="당첨 결과 및 서비스 안내를 받으실 연락처를 입력해 주세요.">
            <FieldLabel>이메일 주소</FieldLabel>
            <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" />

            <FieldLabel>X(트위터) 계정</FieldLabel>
            <TextInput type="text" value={xAccount} onChange={(e) => setXAccount(e.target.value)} placeholder="@계정명" />

            <label className="flex items-start gap-3 mb-[14px] cursor-pointer">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="w-[18px] h-[18px] mt-0.5 shrink-0 cursor-pointer" style={{ accentColor: '#E2B6F7' }} />
              <span className="text-sm text-[#ccc] leading-snug">이벤트 결과 및 한토메 프로덕션의 제작 서비스 안내 수신에 동의합니다</span>
            </label>

            {submitError && <p className="text-red-400 text-[13px] mb-3">{submitError}</p>}

            <NavRow
              nextDisabled={!valid[7] || submitting}
              nextLabel={submitting ? '제출 중…' : '응모 완료 →'}
              onNext={handleSubmit}
              onBack={goBack}
            />
          </StepWrap>
        )}

        {/* ── Result ── */}
        {screen === 'result' && (
          <div>
            <div className="text-center pt-6 pb-8">
              <div className="text-5xl mb-4">✅</div>
              <div className="text-2xl font-bold text-white mb-2">응모가 완료됐습니다!</div>
              <div className="text-sm text-[#666]">접수해 주셔서 감사합니다</div>
              <div className="text-[13px] text-[#E2B6F7] mt-1.5">{ANNOUNCE_DATE}</div>
            </div>

            <ResultRefs genres={genres} styles={styles} hasOther={hasOther} />

            {email && (
              <div className="text-center text-[13px] text-[#555] p-4 border-t border-[#1a1a1a]">
                📧 결과는 <strong className="text-[#888]">{email}</strong>로 발송됩니다
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

// ──────────────────────────────────────────────
// Step 래퍼
// ──────────────────────────────────────────────
const StepWrap: React.FC<{ step: number; title: string; desc: React.ReactNode; children: React.ReactNode }> = ({ step, title, desc, children }) => (
  <div>
    <div className="text-[11px] font-bold text-[#E2B6F7] tracking-[0.2em] uppercase mb-3">Step {step} / 7</div>
    <h2 className="text-[22px] font-bold text-white mb-2 leading-tight">{title}</h2>
    <p className="text-sm text-[#888] mb-7 leading-relaxed">{desc}</p>
    {children}
  </div>
);

// ──────────────────────────────────────────────
// 네비게이션 행
// ──────────────────────────────────────────────
const NavRow: React.FC<{
  onlyNext?: boolean;
  nextDisabled?: boolean;
  nextLabel?: string;
  onNext?: () => void;
  onBack?: () => void;
}> = ({ onlyNext, nextDisabled, nextLabel = '다음 →', onNext, onBack }) => (
  <div className="flex gap-3 mt-8">
    {!onlyNext && (
      <button
        type="button"
        onClick={onBack}
        className="shrink-0 px-5 py-[14px] rounded-lg border-[1.5px] border-[#333] bg-transparent text-[#666] cursor-pointer text-sm transition-colors hover:border-[#555] hover:text-[#aaa]"
      >
        ←
      </button>
    )}
    <button
      type="button"
      onClick={onNext}
      disabled={nextDisabled}
      className="flex-1 py-[14px] rounded-lg border-none text-[#050505] cursor-pointer text-[15px] font-bold transition-[filter] disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:brightness-110"
      style={{ background: 'linear-gradient(135deg, #E2B6F7, #c084fc)' }}
    >
      {nextLabel}
    </button>
  </div>
);

// ──────────────────────────────────────────────
// 결과 레퍼런스 섹션
// ──────────────────────────────────────────────
const ResultRefs: React.FC<{ genres: string[]; styles: Record<string, string>; hasOther: boolean }> = ({ genres, styles, hasOther }) => {
  // 기타 장르/스타일 or 장르 없음 → 담당자 큐레이션
  if (hasOther || genres.length === 0) {
    return (
      <>
        <div className="text-[11px] font-bold text-[#E2B6F7] tracking-[0.2em] uppercase mb-4 pt-2">레퍼런스 큐레이션 예정</div>
        <div className="bg-[#0f0f0f] border border-[#222] rounded-[10px] p-6 text-center text-sm text-[#666] leading-[1.7] mb-7">
          입력하신 레퍼런스를 바탕으로<br />담당자가 직접 큐레이션해서 연락드릴게요. 🎵<br /><br />
          <strong className="text-[#E2B6F7]">영업일 기준 3일 이내 연락드립니다.</strong>
        </div>
      </>
    );
  }

  // 장르 1개 → TOP 3, 2개 → 각 섹션별 TOP 2
  if (genres.length === 1) {
    const g = genres[0];
    const style = styles[g] || '감성적인';
    const { items, isFallback } = matchSongs(g, style, 3);
    return (
      <>
        <div className="text-[11px] font-bold text-[#E2B6F7] tracking-[0.2em] uppercase mb-4 pt-2">
          {g} × {style} 레퍼런스{items.length > 0 ? ` TOP ${items.length}` : ''}
        </div>
        {isFallback && (
          <p className="text-xs text-[#666] mb-3">이 조합의 정확한 레퍼런스가 적어, <strong className="text-[#888]">{g}</strong> 인기곡으로 보여드려요.</p>
        )}
        <div className="flex flex-col gap-3 mb-7">
          {items.length === 0 ? (
            <div className="bg-[#0f0f0f] border border-[#222] rounded-[10px] p-6 text-center text-sm text-[#666] leading-[1.7]">
              이 조합의 레퍼런스를 준비 중이에요.<br />담당자가 직접 큐레이션해서 연락드릴게요. 🎵
            </div>
          ) : (
            items.map((s) => <RefCard key={s.url} song={s} />)
          )}
        </div>
      </>
    );
  }

  // 장르 2개
  return (
    <>
      <div className="text-[11px] font-bold text-[#E2B6F7] tracking-[0.2em] uppercase mb-4 pt-2">레퍼런스 추천</div>
      {genres.map((g) => {
        const style = styles[g] || '감성적인';
        const { items, isFallback } = matchSongs(g, style, 2);
        return (
          <div key={g} className="mb-4">
            <div className="text-[11px] font-bold text-[#E2B6F7] tracking-[0.2em] uppercase mb-3 mt-4">{g} × {style}</div>
            {isFallback && items.length > 0 && (
              <p className="text-xs text-[#666] mb-2">정확한 매칭이 적어 <strong className="text-[#888]">{g}</strong> 인기곡으로 보여드려요.</p>
            )}
            {items.length === 0 ? (
              <div className="bg-[#0f0f0f] border border-[#222] rounded-[10px] p-6 text-center text-sm text-[#666] leading-[1.7] mb-2">
                이 조합의 레퍼런스를 준비 중이에요. 담당자가 직접 큐레이션해서 연락드릴게요. 🎵
              </div>
            ) : (
              <div className="flex flex-col gap-3 mb-2">
                {items.map((s) => <RefCard key={s.url} song={s} />)}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

export default Event;
