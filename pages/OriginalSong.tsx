import React, { useMemo, useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import songsData from '../data/vtuber_songs.json';

interface Song {
  rank?: number;
  artist: string;
  title: string;
  genres: string[];
  style: string;
  notes?: string;
  views: string;
  url: string;
}

type Screen = number | 'result';

const DB = songsData as Song[];

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

const STYLE_MAP: Record<string, string[]> = {
  '케이팝': ['신나는', '감성적인', '청량한', '실험적·몽환적'],
  '제이팝': ['신나는', '감성적인', '청량한', '귀여운'],
  '댄스·일렉트로닉': ['신나는', '귀여운', '실험적·몽환적'],
  '락·밴드': ['신나는', '감성적인', '청량한'],
  '발라드': ['감성적인'],
  '알앤비·힙합': ['신나는', '감성적인', '청량한', '실험적·몽환적'],
  '국악·전통': ['신나는', '감성적인'],
  '기타': ['직접 입력'],
};

const GENRES = ['케이팝', '제이팝', '댄스·일렉트로닉', '락·밴드', '발라드', '알앤비·힙합', '국악·전통', '기타'];
const PLATFORMS = ['씨미', '치지직', '숲(SOOP)', '유튜브', 'X(트위터)', '기타'];
const PURPOSES = ['데뷔곡', '기념일곡', '세계관 테마곡', '방송/유튜브 콘텐츠', '음원 발매', '아직 미정'];
const VISUAL_OPTIONS = ['음원만 필요', '심플 MV 필요', '일러스트/MV까지 상담 원함', '아직 모르겠음'];
const READY_OPTIONS = ['가사 완성됨', '가사 작업 의향 있음', '데모/흥얼거림 있음', '캐릭터 설정 있음', '아트 소스 준비됨', '전부 오마카세로 맡기고 싶음'];
const BUDGETS = ['100 ~ 300만 원', '300 ~ 450만 원', '450만 원 이상', '상담 후 결정'];
const SOURCES = ['씨미', 'X(트위터)', '지인 소개', '유튜브/커뮤니티', '기타'];

const EXTRA_REFS: Song[] = [
  { artist: 'Airi Kanna', title: '色彩 / Team. Palette', genres: ['제이팝', '락/밴드'], style: '청량한', views: '2.0M', url: 'https://www.youtube.com/watch?v=AsoPg-h-644' },
  { artist: 'Mrs. GREEN APPLE', title: '青と夏', genres: ['제이팝'], style: '청량한', views: '', url: 'https://www.youtube.com/watch?v=m34DPnRUfMU' },
  { artist: 'PLAVE', title: 'Dear. PLLI', genres: ['알앤비/힙합'], style: '감성적인', views: '5.2M', url: 'https://www.youtube.com/watch?v=ZN57uW2euJA' },
  { artist: 'PLAVE', title: '12:32', genres: ['알앤비/힙합'], style: '감성적인', views: '1.4M', url: 'https://www.youtube.com/watch?v=seNgeyf93p4' },
  { artist: 'Jack Ch. 잭', title: '돌멩이', genres: ['알앤비/힙합'], style: '감성적인', views: '873K', url: 'https://www.youtube.com/watch?v=bpfSKRFr56A' },
];

const REF_DB = [...EXTRA_REFS, ...DB];

const parseViews = (value: string): number => {
  if (!value) return 0;
  if (value.endsWith('M')) return parseFloat(value) * 1_000_000;
  if (value.endsWith('K')) return parseFloat(value) * 1_000;
  return parseFloat(value) || 0;
};

const getVideoId = (url: string): string => {
  const match = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : '';
};

const normaliseSource = (value: string): string => {
  const v = value.trim().toLowerCase();
  if (v === 'cimi' || v === '씨미') return '씨미';
  if (v === 'x' || v === 'twitter') return 'X(트위터)';
  return value.trim();
};

const getSourceParam = (): string => {
  if (typeof window === 'undefined') return '';
  return normaliseSource(new URLSearchParams(window.location.search).get('source') || '');
};

const getReferenceGroups = (genres: string[], styles: Record<string, string>) => {
  return genres.flatMap((genre) => {
    const mappedGenre = GENRE_MAP[genre];
    const style = styles[genre];
    if (!mappedGenre || !style || style === '직접 입력') return [];
    const seen = new Set<string>();
    const items = REF_DB
      .filter((song) => song.genres.includes(mappedGenre) && song.style === style)
      .filter((song) => {
        if (seen.has(song.url)) return false;
        seen.add(song.url);
        return true;
      })
      .sort((a, b) => parseViews(b.views) - parseViews(a.views))
      .slice(0, 2);
    return items.length ? [{ genre, style, items }] : [];
  });
};

const OptionButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'rounded-full border-[1.5px] px-4 py-2.5 text-sm transition-colors',
      active
        ? 'border-[#E2B6F7] bg-[rgba(226,182,247,0.15)] text-[#E2B6F7] font-bold'
        : 'border-[#303039] bg-[#101014] text-[#b8b8c2] hover:border-[#E2B6F7] hover:text-white',
    ].join(' ')}
  >
    {children}
  </button>
);

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-2 text-xs font-bold tracking-[0.1em] text-[#E2B6F7]">{children}</div>
);

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className="mb-[18px] w-full rounded-lg border-[1.5px] border-[#303039] bg-[#101014] px-[15px] py-[13px] text-[15px] text-[#ececf2] outline-none transition-colors placeholder:text-[#51515b] focus:border-[#E2B6F7]"
  />
);

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className="mb-[18px] min-h-28 w-full resize-y rounded-lg border-[1.5px] border-[#303039] bg-[#101014] px-[15px] py-[13px] text-[15px] leading-relaxed text-[#ececf2] outline-none transition-colors placeholder:text-[#51515b] focus:border-[#E2B6F7]"
  />
);

const StepWrap: React.FC<{ step: number; title: string; desc: React.ReactNode; children: React.ReactNode }> = ({ step, title, desc, children }) => (
  <div>
    <div className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E2B6F7]">Step {step} / 7</div>
    <h1 className="mb-4 text-[clamp(24px,5vw,36px)] font-bold leading-tight text-white">{title}</h1>
    <p className="mb-8 text-sm leading-[1.82] text-[#8a8a94]">{desc}</p>
    {children}
  </div>
);

const NavRow: React.FC<{
  onlyNext?: boolean;
  nextDisabled?: boolean;
  nextLabel?: string;
  onNext?: () => void;
  onBack?: () => void;
}> = ({ onlyNext, nextDisabled, nextLabel = '다음 →', onNext, onBack }) => (
  <div className="mt-[34px] flex gap-3">
    {!onlyNext && (
      <button
        type="button"
        onClick={onBack}
        className="min-h-12 shrink-0 rounded-lg border-[1.5px] border-[#33333d] bg-transparent px-5 text-sm text-[#777783] transition-colors hover:border-[#555562] hover:text-[#bdbdc8]"
      >
        ←
      </button>
    )}
    <button
      type="button"
      onClick={onNext}
      disabled={nextDisabled}
      className="min-h-12 flex-1 rounded-lg border-none px-[18px] text-[15px] font-bold text-[#060607] transition-[filter] enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:bg-[#2b2434] disabled:text-[#6f627a]"
      style={nextDisabled ? undefined : { background: 'linear-gradient(135deg, #E2B6F7, #b987ff)' }}
    >
      {nextLabel}
    </button>
  </div>
);

const PackageCard: React.FC<{
  name: string;
  price: string;
  bullets: string[];
  recommend: string;
  selected: boolean;
  onClick: () => void;
}> = ({ name, price, bullets, recommend, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'flex min-h-[248px] flex-col rounded-lg border-[1.5px] p-5 text-left transition-colors',
      selected
        ? 'border-[#E2B6F7] bg-[rgba(226,182,247,0.14)]'
        : 'border-[#303039] bg-[rgba(16,16,20,0.88)] hover:border-[#E2B6F7]',
    ].join(' ')}
  >
    <div className="mb-1.5 min-h-6 text-xl font-bold leading-none text-white">{name}</div>
    <div className="mb-4 text-[15px] font-bold leading-tight text-[#E2B6F7]">{price}</div>
    <ul className="mb-4 list-disc whitespace-nowrap pl-[17px] text-[12.5px] leading-[1.72] text-[#bdbdc8] max-[720px]:whitespace-normal">
      {bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
    </ul>
    <div className="mt-auto whitespace-nowrap border-t border-[rgba(226,182,247,0.18)] pt-3 text-[12.5px] font-bold leading-snug text-[#E2B6F7] max-[720px]:whitespace-normal">
      추천: {recommend}
    </div>
  </button>
);

export const OriginalSong: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(0);
  const [sourceParam] = useState(getSourceParam);
  const [introChecked, setIntroChecked] = useState(false);
  const [creatorName, setCreatorName] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(sourceParam === '씨미' ? ['씨미'] : []);
  const [channelUrl, setChannelUrl] = useState('');
  const [purpose, setPurpose] = useState('');
  const [deadline, setDeadline] = useState('');
  const [packageName, setPackageName] = useState('');
  const [visualScope, setVisualScope] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [styles, setStyles] = useState<Record<string, string>>({});
  const [selectedReference, setSelectedReference] = useState<Song | null>(null);
  const [customReferences, setCustomReferences] = useState('');
  const [readyMaterials, setReadyMaterials] = useState<string[]>([]);
  const [memo, setMemo] = useState('');
  const [budget, setBudget] = useState('');
  const [policyChecked, setPolicyChecked] = useState(false);
  const [email, setEmail] = useState('');
  const [discord, setDiscord] = useState('');
  const [xAccount, setXAccount] = useState('');
  const [sourceAnswer, setSourceAnswer] = useState(sourceParam || '');
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const progressPct = screen === 'result' ? 100 : Math.round(((screen as number) / 7) * 100);
  const referenceGroups = useMemo(() => getReferenceGroups(genres, styles), [genres, styles]);

  const valid = useMemo(() => ({
    1: creatorName.trim().length > 0 && platforms.length > 0 && channelUrl.trim().length > 0,
    2: purpose !== '' && deadline.trim().length > 0,
    3: packageName !== '' && visualScope !== '',
    4: genres.length > 0 && genres.every((genre) => !!styles[genre]),
    5: readyMaterials.length > 0,
    6: budget !== '' && policyChecked,
    7: email.trim().length > 0 && discord.trim().length > 0 && sourceAnswer !== '' && agree,
  }), [creatorName, platforms, channelUrl, purpose, deadline, packageName, visualScope, genres, styles, readyMaterials, budget, policyChecked, email, discord, sourceAnswer, agree]);

  const toggleArray = (arr: string[], value: string, setter: (next: string[]) => void) => {
    setter(arr.includes(value) ? arr.filter((item) => item !== value) : [...arr, value]);
  };

  const selectGenre = (genre: string) => {
    setSelectedReference(null);
    if (genres.includes(genre)) {
      setGenres(genres.filter((item) => item !== genre));
      const nextStyles = { ...styles };
      delete nextStyles[genre];
      setStyles(nextStyles);
      return;
    }
    if (genres.length >= 2) return;
    setGenres([...genres, genre]);
    if (STYLE_MAP[genre]?.length === 1) setStyles((prev) => ({ ...prev, [genre]: STYLE_MAP[genre][0] }));
  };

  const selectStyle = (genre: string, style: string) => {
    setSelectedReference(null);
    setStyles((prev) => ({ ...prev, [genre]: style }));
  };

  const goNext = () => {
    setScreen((current) => (typeof current === 'number' ? current + 1 : current));
    window.scrollTo(0, 0);
  };

  const goBack = () => {
    setScreen((current) => (typeof current === 'number' ? current - 1 : current));
    window.scrollTo(0, 0);
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      await addDoc(collection(db, 'original_song_inquiries'), {
        sourceParam,
        creatorName: creatorName.trim(),
        platforms,
        channelUrl: channelUrl.trim(),
        purpose,
        deadline: deadline.trim(),
        packageName,
        visualScope,
        genres,
        styles,
        selectedReference,
        customReferences: customReferences.trim(),
        readyMaterials,
        memo: memo.trim(),
        budget,
        policyChecked,
        email: email.trim(),
        discord: discord.trim(),
        xAccount: xAccount.trim(),
        sourceAnswer,
        agree,
        createdAt: serverTimestamp(),
      });
      setScreen('result');
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('오리지널곡 제작 상담 저장 실패:', error);
      setSubmitError('상담 신청 제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-[#050506] px-4 py-10 text-[#ececf2]"
      style={{
        fontFamily: "'Paperozi', 'Paperlogy', 'Apple SD Gothic Neo', sans-serif",
        background:
          'radial-gradient(circle at 32% 18%, rgba(153, 93, 255, 0.22), transparent 28%), radial-gradient(circle at 70% 76%, rgba(226, 182, 247, 0.14), transparent 30%), #050506',
      }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[760px] flex-col justify-center">
        <div className="mb-[30px] flex items-center justify-between gap-4">
          <img src="/logo.png" alt="Hantome Production" className="h-[60px] w-[168px] object-contain object-left drop-shadow-[0_0_18px_rgba(226,182,247,0.18)] max-[720px]:h-12 max-[720px]:w-[134px]" />
          {sourceParam && (
            <div className="whitespace-nowrap rounded-full border border-[rgba(226,182,247,0.42)] bg-[rgba(226,182,247,0.08)] px-3 py-2 text-xs text-[#E2B6F7]">
              {sourceParam} 유입 링크
            </div>
          )}
        </div>

        <div className="mb-[38px] h-[3px] overflow-hidden rounded-sm bg-[#19191f] max-[720px]:mb-[34px]">
          <div className="h-full rounded-sm bg-gradient-to-r from-[#E2B6F7] to-[#b987ff] transition-[width] duration-300" style={{ width: `${progressPct}%` }} />
        </div>

        {screen === 0 && (
          <div>
            <div className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E2B6F7]">Original Song Inquiry</div>
            <h1 className="mb-4 text-[clamp(28px,5vw,46px)] font-bold leading-tight text-white">버츄얼 크리에이터<br />오리지널곡 제작 상담</h1>
            <p className="mb-8 text-sm leading-[1.82] text-[#8a8a94]">
              데뷔곡, 기념일곡, 세계관 테마곡, 방송/유튜브용 오리지널 음원 제작 상담을 받습니다.
              작성 내용 기준으로 제작 가능 범위, 예상 견적, 일정감을 안내드립니다.
            </p>

            <div className="mb-6 border border-[#2b2b33] border-l-[3px] border-l-[#E2B6F7] bg-[rgba(15,15,18,0.82)] px-5 py-[18px] text-[13px] leading-[1.82] text-[#c7c7d0]">
              <strong className="text-[#E2B6F7]">{sourceParam === '씨미' ? '씨미 크리에이터분들을 위한 오리지널곡 제작 상담' : '한토메 프로덕션'}</strong><br />
              한토메 프로덕션 제작진이 사전 회의를 통해 방향성을 확정한 뒤 제작을 진행합니다.<br />
              정확한 견적은 곡 길이, 보컬 수, 수정 범위, 비주얼/MV 포함 여부에 따라 달라집니다.
            </div>

            <label className="mb-[18px] flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={introChecked} onChange={(event) => setIntroChecked(event.target.checked)} className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer" style={{ accentColor: '#E2B6F7' }} />
              <span className="text-sm leading-normal text-[#d6d6df]">제작 상담 신청 목적과 견적 안내 방식에 동의합니다.</span>
            </label>

            <NavRow onlyNext nextDisabled={!introChecked} nextLabel="상담 신청 시작 →" onNext={goNext} />
          </div>
        )}

        {screen === 1 && (
          <StepWrap step={1} title="기본 정보" desc="활동명, 플랫폼, 채널 링크를 알려주세요.">
            <FieldLabel>버츄얼 크리에이터 활동명</FieldLabel>
            <TextInput value={creatorName} onChange={(event) => setCreatorName(event.target.value)} placeholder="활동명을 입력해 주세요" />

            <FieldLabel>주 활동 플랫폼 <span className="font-normal text-[#62626c]">(복수 선택 가능)</span></FieldLabel>
            <div className="mb-5 flex flex-wrap gap-2.5">
              {PLATFORMS.map((platform) => (
                <OptionButton key={platform} active={platforms.includes(platform)} onClick={() => toggleArray(platforms, platform, setPlatforms)}>
                  {platform}
                </OptionButton>
              ))}
            </div>

            <FieldLabel>대표 채널 링크</FieldLabel>
            <TextInput type="url" value={channelUrl} onChange={(event) => setChannelUrl(event.target.value)} placeholder="https://" />

            <NavRow nextDisabled={!valid[1]} onNext={goNext} onBack={goBack} />
          </StepWrap>
        )}

        {screen === 2 && (
          <StepWrap step={2} title="제작 목적" desc="이번 오리지널곡을 어떤 콘텐츠로 공개하고 싶은지 선택해 주세요.">
            <FieldLabel>제작 목적</FieldLabel>
            <div className="mb-5 flex flex-wrap gap-2.5">
              {PURPOSES.map((item) => (
                <OptionButton key={item} active={purpose === item} onClick={() => setPurpose(item)}>{item}</OptionButton>
              ))}
            </div>

            <FieldLabel>희망 공개일 또는 납기</FieldLabel>
            <TextInput value={deadline} onChange={(event) => setDeadline(event.target.value)} placeholder="예: 2026년 8월 데뷔 예정 / 아직 미정" />

            <NavRow nextDisabled={!valid[2]} onNext={goNext} onBack={goBack} />
          </StepWrap>
        )}

        {screen === 3 && (
          <StepWrap step={3} title="제작 포맷 선택" desc="원하는 제작 범위를 선택해 주세요. 아래 금액은 시작가 기준이며 최종 견적은 사전 회의 후 확정됩니다.">
            <div className="mb-5 grid grid-cols-3 gap-3 max-[720px]:grid-cols-1">
              <PackageCard name="Basic" price="100만 원부터" selected={packageName === 'Basic'} onClick={() => setPackageName('Basic')} bullets={['작곡 + 편곡 중심', '가사 직접 준비 가능하신 분', '보컬 녹음, 믹싱, MV는 별도 협의']} recommend="콘셉트와 가사가 이미 있는 경우" />
              <PackageCard name="Standard" price="300만 원부터" selected={packageName === 'Standard'} onClick={() => setPackageName('Standard')} bullets={['작곡 + 작사 + 편곡', '보컬 가이드', '믹싱/마스터링']} recommend="처음 오리지널곡 제작하는 경우" />
              <PackageCard name="Premium" price="450만 원부터" selected={packageName === 'Premium'} onClick={() => setPackageName('Premium')} bullets={['Standard 구성', '일러스트/MV 기획 및 제작 연계', '공개 일정용 패키지 구성']} recommend="데뷔곡, 기념일곡, 큰 공개 콘텐츠" />
            </div>

            <FieldLabel>비주얼/MV 필요 여부</FieldLabel>
            <div className="mb-5 flex flex-wrap gap-2.5">
              {VISUAL_OPTIONS.map((item) => (
                <OptionButton key={item} active={visualScope === item} onClick={() => setVisualScope(item)}>{item}</OptionButton>
              ))}
            </div>

            <NavRow nextDisabled={!valid[3]} onNext={goNext} onBack={goBack} />
          </StepWrap>
        )}

        {screen === 4 && (
          <StepWrap step={4} title="장르 & 레퍼런스" desc="원하는 장르와 스타일을 선택하면 가까운 버츄얼 오리지널곡 레퍼런스를 추천합니다.">
            <FieldLabel>장르 <span className="font-normal text-[#62626c]">(최대 2개 선택 가능)</span></FieldLabel>
            <div className="mb-5 flex flex-wrap gap-2.5">
              {GENRES.map((genre) => (
                <OptionButton key={genre} active={genres.includes(genre)} onClick={() => selectGenre(genre)}>{genre}</OptionButton>
              ))}
            </div>

            {genres.map((genre) => (
              <div key={genre} className="mb-3">
                <FieldLabel>{genres.length > 1 ? `${genre} 스타일` : '스타일'}</FieldLabel>
                <div className="mb-2 flex flex-wrap gap-2.5">
                  {STYLE_MAP[genre].map((style) => (
                    <OptionButton key={style} active={styles[genre] === style} onClick={() => selectStyle(genre, style)}>{style}</OptionButton>
                  ))}
                </div>
              </div>
            ))}

            {referenceGroups.length > 0 && (
              <div className="mb-5">
                <FieldLabel>가장 가까운 추천 레퍼런스</FieldLabel>
                <div className="grid gap-2.5">
                  {referenceGroups.map((group) => (
                    <React.Fragment key={`${group.genre}-${group.style}`}>
                      <div className="mt-2 text-xs font-bold tracking-[0.08em] text-[#E2B6F7] first:mt-0">{group.genre} × {group.style}</div>
                      {group.items.map((song) => {
                        const videoId = getVideoId(song.url);
                        const thumb = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
                        const selected = selectedReference?.url === song.url;
                        return (
                          <div
                            key={song.url}
                            onClick={() => setSelectedReference(song)}
                            className={[
                              'grid cursor-pointer grid-cols-[86px_1fr_auto] items-center gap-3 rounded-lg border-[1.5px] bg-[rgba(16,16,20,0.88)] p-3 transition-colors max-[720px]:grid-cols-[78px_1fr]',
                              selected ? 'border-[#E2B6F7] bg-[rgba(226,182,247,0.14)]' : 'border-[#303039] hover:border-[#E2B6F7]',
                            ].join(' ')}
                          >
                            {thumb ? <img src={thumb} alt={song.title} loading="lazy" className="h-12 w-[86px] rounded-md object-cover max-[720px]:h-11 max-[720px]:w-[78px]" /> : <div className="h-12 w-[86px] rounded-md bg-[#22222a]" />}
                            <span>
                              <span className="mb-1 block text-[13px] font-bold leading-snug text-white">{song.artist} - {song.title}</span>
                              <span className="text-xs text-[#777783]">{song.style} · {song.views ? `조회수 ${song.views}` : '조회수 정보 없음'}</span>
                            </span>
                            <a href={song.url} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} className="whitespace-nowrap rounded-full border border-[rgba(226,182,247,0.48)] bg-[rgba(226,182,247,0.1)] px-3 py-2 text-xs font-bold text-[#E2B6F7] no-underline hover:bg-[rgba(226,182,247,0.18)] hover:text-white max-[720px]:col-start-2 max-[720px]:w-max">
                              들어보기
                            </a>
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-normal text-[#676772]">추천곡 중 가까운 방향이 있으면 선택해 주세요. 직접 입력한 참고곡이 더 정확하면 선택하지 않아도 됩니다.</p>
              </div>
            )}

            <FieldLabel>직접 참고곡 링크</FieldLabel>
            <TextArea value={customReferences} onChange={(event) => setCustomReferences(event.target.value)} placeholder="유튜브 링크나 곡 제목을 적어주세요. 여러 개면 줄바꿈으로 입력해 주세요." />

            <NavRow nextDisabled={!valid[4]} onNext={goNext} onBack={goBack} />
          </StepWrap>
        )}

        {screen === 5 && (
          <StepWrap step={5} title="제작 준비 상태" desc="현재 준비된 것을 모두 선택해 주세요.">
            <FieldLabel>준비된 자료</FieldLabel>
            <div className="mb-5 flex flex-wrap gap-2.5">
              {READY_OPTIONS.map((item) => (
                <OptionButton key={item} active={readyMaterials.includes(item)} onClick={() => toggleArray(readyMaterials, item, setReadyMaterials)}>{item}</OptionButton>
              ))}
            </div>

            <FieldLabel>제작 메모</FieldLabel>
            <TextArea value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="원하는 콘셉트, 피하고 싶은 방향, 팀에게 전달하고 싶은 내용을 적어주세요." />

            <NavRow nextDisabled={!valid[5]} onNext={goNext} onBack={goBack} />
          </StepWrap>
        )}

        {screen === 6 && (
          <StepWrap step={6} title="예산 & 제작 정책" desc="예산감과 제작 정책 확인 여부를 알려주세요.">
            <FieldLabel>예상 예산</FieldLabel>
            <div className="mb-5 flex flex-wrap gap-2.5">
              {BUDGETS.map((item) => (
                <OptionButton key={item} active={budget === item} onClick={() => setBudget(item)}>{item}</OptionButton>
              ))}
            </div>

            <details open className="mb-4 overflow-hidden rounded-lg border border-[#2b2b33] bg-[rgba(15,15,18,0.82)]">
              <summary className="cursor-pointer px-4 py-3.5 text-[13px] font-bold text-[#E2B6F7]">제작 과정 및 수정 정책 자세히 보기</summary>
              <div className="border-t border-[#23232a] p-4 text-[13px] leading-[1.75] text-[#c7c7d0]">
                <p className="mb-[18px]">제작 전 제작진과 음성 또는 대면 회의를 진행합니다.<br />회의에서는 제작 목적, 곡 방향성, 예산, 공개 일정, 필요한 제작 범위를 확정합니다.</p>
                <p className="mb-[18px]">제작 진행 후에는 확정된 제작 범위 안에서 파트별 최대 2회까지 수정이 가능합니다.<br />수정 가능 파트는 계약 범위에 따라 작사, 작곡, 믹싱/마스터링, 일러스트, M/V로 구분됩니다.</p>
                <p className="mb-[18px]">수정 1회는 한 번에 전달받은 피드백 묶음 기준입니다.<br />동일 파트에 대한 세부 피드백은 한 번에 정리해서 전달해 주셔야 합니다.</p>
                <p>초기 회의에서 확정한 방향성을 크게 변경하는 경우,<br />예: 장르 변경, 곡 구조 전면 변경, 콘셉트 재설정, 신규 일러스트 추가, M/V 구성 변경 등은 추가 비용 또는 일정 조정이 발생할 수 있습니다.</p>
              </div>
            </details>

            <label className="mb-[18px] flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={policyChecked} onChange={(event) => setPolicyChecked(event.target.checked)} className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer" style={{ accentColor: '#E2B6F7' }} />
              <span className="text-sm leading-normal text-[#d6d6df]">제작 과정과 수정 정책을 확인했습니다.</span>
            </label>

            <NavRow nextDisabled={!valid[6]} onNext={goNext} onBack={goBack} />
          </StepWrap>
        )}

        {screen === 7 && (
          <StepWrap step={7} title="연락처" desc="견적 안내와 제작 상담을 받을 이메일, 디스코드 계정을 입력해 주세요.">
            <FieldLabel>이메일 주소</FieldLabel>
            <TextInput type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="example@email.com" />

            <FieldLabel>디스코드 아이디</FieldLabel>
            <TextInput value={discord} onChange={(event) => setDiscord(event.target.value)} placeholder="Discord ID 또는 username" />

            <FieldLabel>X(트위터) 계정 <span className="font-normal text-[#62626c]">(선택)</span></FieldLabel>
            <TextInput value={xAccount} onChange={(event) => setXAccount(event.target.value)} placeholder="@계정명" />

            <FieldLabel>이 신청을 알게 된 경로</FieldLabel>
            <div className="mb-5 flex flex-wrap gap-2.5">
              {SOURCES.map((item) => (
                <OptionButton key={item} active={sourceAnswer === item} onClick={() => setSourceAnswer(item)}>{item}</OptionButton>
              ))}
            </div>

            <label className="mb-[18px] flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer" style={{ accentColor: '#E2B6F7' }} />
              <span className="text-sm leading-normal text-[#d6d6df]">입력한 이메일과 디스코드로 한토메 프로덕션의 제작 상담 안내를 받는 것에 동의합니다.</span>
            </label>

            {submitError && <div className="mb-3 text-[13px] text-red-300">{submitError}</div>}

            <NavRow nextDisabled={!valid[7] || submitting} nextLabel={submitting ? '제출 중...' : '상담 신청 완료 →'} onNext={submit} onBack={goBack} />
          </StepWrap>
        )}

        {screen === 'result' && (
          <div>
            <div className="pb-8 pt-7 text-center">
              <div className="mx-auto mb-[18px] grid h-[58px] w-[58px] place-items-center rounded-full border border-[rgba(226,182,247,0.45)] bg-[rgba(226,182,247,0.12)] text-3xl text-[#E2B6F7]">✓</div>
              <div className="mb-2 text-2xl font-bold text-white">상담 신청이 접수됐습니다</div>
              <div className="text-sm leading-relaxed text-[#8a8a94]">작성 내용 확인 후 영업일 기준 1~3일 이내 연락드립니다.<br />선택하신 방향과 레퍼런스를 바탕으로 제작 범위와 견적을 안내드릴게요.</div>
            </div>

            <div className="mb-5 rounded-lg border border-[#2b2b33] bg-[rgba(15,15,18,0.88)] p-[18px]">
              <h3 className="mb-3.5 text-[13px] font-bold uppercase tracking-[0.12em] text-[#E2B6F7]">접수 요약</h3>
              <div className="grid gap-2.5 text-[13px] leading-relaxed text-[#c7c7d0]">
                <div><strong className="mr-1.5 text-white">활동명</strong>{creatorName || '-'}</div>
                <div><strong className="mr-1.5 text-white">제작 목적</strong>{purpose || '-'}</div>
                <div><strong className="mr-1.5 text-white">제작 포맷</strong>{packageName} / {visualScope}</div>
                <div><strong className="mr-1.5 text-white">장르</strong>{genres.join(', ') || '-'}</div>
                <div><strong className="mr-1.5 text-white">레퍼런스</strong>{selectedReference ? `${selectedReference.artist} - ${selectedReference.title}` : '직접 입력 또는 상담 중 큐레이션'}</div>
                <div><strong className="mr-1.5 text-white">예산</strong>{budget || '-'}</div>
                <div><strong className="mr-1.5 text-white">연락처</strong>{email} / {discord}{xAccount ? ` / ${xAccount}` : ''}</div>
                <div><strong className="mr-1.5 text-white">유입</strong>{sourceAnswer || sourceParam || '미기록'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
