import React, { useMemo, useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import songsData from '../../data/vtuber_songs.json';
import {
  OptionButton,
  FieldLabel,
  TextInput,
  TextArea,
  StepWrap,
  NavRow,
  PackageCard,
  BasicInfoStep,
  ContactStep,
  ResultScreen,
} from './shared';

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
const PURPOSES = ['데뷔곡', '기념일곡', '세계관 테마곡', '방송/유튜브 콘텐츠', '음원 발매', '기타'];
const VISUAL_OPTIONS = ['음원만 필요', '심플 MV 필요', '일러스트/MV까지 상담 원함', '아직 모르겠음'];
const READY_OPTIONS = ['가사 완성됨', '가사 작업 의향 있음', '데모/흥얼거림 있음', '캐릭터 설정 있음', '아트 소스 준비됨', '전부 오마카세로 맡기고 싶음'];
const BUDGETS = ['100 ~ 300만 원', '300 ~ 450만 원', '450만 원 이상', '상담 후 결정'];

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

const getReferenceGroups = (genres: string[], styles: Record<string, string>) =>
  genres.flatMap((genre) => {
    const mappedGenre = GENRE_MAP[genre];
    const style = styles[genre];
    if (!mappedGenre || !style || style === '직접 입력') return [];
    const seen = new Set<string>();
    const items = REF_DB
      .filter((s) => s.genres.includes(mappedGenre) && s.style === style)
      .filter((s) => { if (seen.has(s.url)) return false; seen.add(s.url); return true; })
      .sort((a, b) => parseViews(b.views) - parseViews(a.views))
      .slice(0, 2);
    return items.length ? [{ genre, style, items }] : [];
  });

const TOTAL = 7;

export const OriginalForm: React.FC<{ sourceParam: string; onReset: () => void }> = ({ sourceParam, onReset }) => {
  const [screen, setScreen] = useState(1);
  const [creatorName, setCreatorName] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(sourceParam === '씨미' ? ['씨미'] : []);
  const [channelUrl, setChannelUrl] = useState('');
  const [purpose, setPurpose] = useState('');
  const [purposeOther, setPurposeOther] = useState('');
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
  const [done, setDone] = useState(false);

  const referenceGroups = useMemo(() => getReferenceGroups(genres, styles), [genres, styles]);

  const effectivePurpose = purpose === '기타' ? purposeOther.trim() : purpose;

  const valid: Record<number, boolean> = {
    1: creatorName.trim().length > 0 && platforms.length > 0 && channelUrl.trim().length > 0,
    2: purpose !== '' && (purpose !== '기타' || purposeOther.trim().length > 0) && deadline.trim().length > 0,
    3: packageName !== '' && visualScope !== '',
    4: genres.length > 0 && genres.every((g) => !!styles[g]),
    5: readyMaterials.length > 0,
    6: budget !== '' && policyChecked,
    7: email.trim().length > 0 && discord.trim().length > 0 && sourceAnswer !== '' && agree,
  };

  const next = () => { setScreen((s) => s + 1); window.scrollTo(0, 0); };
  const back = () => { setScreen((s) => s - 1); window.scrollTo(0, 0); };

  const toggleArray = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const selectGenre = (genre: string) => {
    setSelectedReference(null);
    if (genres.includes(genre)) {
      setGenres(genres.filter((g) => g !== genre));
      const ns = { ...styles }; delete ns[genre]; setStyles(ns);
      return;
    }
    if (genres.length >= 2) return;
    setGenres([...genres, genre]);
    if (STYLE_MAP[genre]?.length === 1) setStyles((p) => ({ ...p, [genre]: STYLE_MAP[genre][0] }));
  };

  const submit = async () => {
    setSubmitting(true); setSubmitError('');
    try {
      await addDoc(collection(db, 'production_inquiries'), {
        inquiryType: 'original',
        sourceParam,
        creatorName: creatorName.trim(),
        platforms,
        channelUrl: channelUrl.trim(),
        purpose: effectivePurpose,
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
        email: email.trim(),
        discord: discord.trim(),
        xAccount: xAccount.trim(),
        sourceAnswer,
        createdAt: serverTimestamp(),
      });
      setDone(true); window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setSubmitError('상담 신청 제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <ResultScreen rows={[
        ['활동명', creatorName],
        ['제작 목적', effectivePurpose],
        ['제작 포맷', `${packageName} / ${visualScope}`],
        ['장르', genres.join(', ')],
        ['레퍼런스', selectedReference ? `${selectedReference.artist} - ${selectedReference.title}` : '직접 입력 또는 상담 중 큐레이션'],
        ['예산', budget],
        ['연락처', `${email} / ${discord}${xAccount ? ` / ${xAccount}` : ''}`],
        ['유입', sourceAnswer || sourceParam || '미기록'],
      ]} />
    );
  }

  return (
    <>
      {screen === 1 && (
        <BasicInfoStep
          total={TOTAL}
          creatorName={creatorName} setCreatorName={setCreatorName}
          platforms={platforms} setPlatforms={setPlatforms}
          channelUrl={channelUrl} setChannelUrl={setChannelUrl}
          valid={valid[1]}
          onNext={next} onBack={onReset}
        />
      )}

      {screen === 2 && (
        <StepWrap step={2} total={TOTAL} title="제작 목적" desc="이번 오리지널곡을 어떤 콘텐츠로 공개하고 싶은지 선택해 주세요.">
          <FieldLabel>제작 목적</FieldLabel>
          <div className="mb-5 flex flex-wrap gap-2.5">
            {PURPOSES.map((item) => (
              <OptionButton key={item} active={purpose === item} onClick={() => setPurpose(item)}>{item}</OptionButton>
            ))}
          </div>
          {purpose === '기타' && (
            <TextInput
              value={purposeOther}
              onChange={(e) => setPurposeOther(e.target.value)}
              placeholder="제작 목적을 직접 입력해 주세요"
            />
          )}
          <FieldLabel>희망 공개일 또는 납기</FieldLabel>
          <TextInput value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="예: 2026년 8월 데뷔 예정 / 아직 미정" />
          <NavRow nextDisabled={!valid[2]} onNext={next} onBack={back} />
        </StepWrap>
      )}

      {screen === 3 && (
        <StepWrap step={3} total={TOTAL} title="제작 포맷 선택" desc="원하는 제작 범위를 선택해 주세요. 아래 금액은 시작가 기준이며 최종 견적은 사전 회의 후 확정됩니다.">
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
          <NavRow nextDisabled={!valid[3]} onNext={next} onBack={back} />
        </StepWrap>
      )}

      {screen === 4 && (
        <StepWrap step={4} total={TOTAL} title="장르 & 레퍼런스" desc="원하는 장르와 스타일을 선택하면 가까운 버츄얼 오리지널곡 레퍼런스를 추천합니다.">
          <FieldLabel>장르 <span className="font-normal text-[#62626c]">(최대 2개 선택 가능)</span></FieldLabel>
          <div className="mb-5 flex flex-wrap gap-2.5">
            {GENRES.map((g) => (
              <OptionButton key={g} active={genres.includes(g)} onClick={() => selectGenre(g)}>{g}</OptionButton>
            ))}
          </div>

          {genres.map((genre) => (
            <div key={genre} className="mb-3">
              <FieldLabel>{genres.length > 1 ? `${genre} 스타일` : '스타일'}</FieldLabel>
              <div className="mb-2 flex flex-wrap gap-2.5">
                {STYLE_MAP[genre].map((style) => (
                  <OptionButton key={style} active={styles[genre] === style} onClick={() => { setSelectedReference(null); setStyles((p) => ({ ...p, [genre]: style })); }}>{style}</OptionButton>
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
                          className={['grid cursor-pointer grid-cols-[86px_1fr_auto] items-center gap-3 rounded-lg border-[1.5px] bg-[rgba(16,16,20,0.88)] p-3 transition-colors max-[720px]:grid-cols-[78px_1fr]', selected ? 'border-[#E2B6F7] bg-[rgba(226,182,247,0.14)]' : 'border-[#303039] hover:border-[#E2B6F7]'].join(' ')}
                        >
                          {thumb ? <img src={thumb} alt={song.title} loading="lazy" className="h-12 w-[86px] rounded-md object-cover max-[720px]:h-11 max-[720px]:w-[78px]" /> : <div className="h-12 w-[86px] rounded-md bg-[#22222a]" />}
                          <span>
                            <span className="mb-1 block text-[13px] font-bold leading-snug text-white">{song.artist} - {song.title}</span>
                            <span className="text-xs text-[#777783]">{song.style} · {song.views ? `조회수 ${song.views}` : '조회수 정보 없음'}</span>
                          </span>
                          <a href={song.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="whitespace-nowrap rounded-full border border-[rgba(226,182,247,0.48)] bg-[rgba(226,182,247,0.1)] px-3 py-2 text-xs font-bold text-[#E2B6F7] no-underline hover:bg-[rgba(226,182,247,0.18)] hover:text-white max-[720px]:col-start-2 max-[720px]:w-max">
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
          <TextArea value={customReferences} onChange={(e) => setCustomReferences(e.target.value)} placeholder="유튜브 링크나 곡 제목을 적어주세요. 여러 개면 줄바꿈으로 입력해 주세요." />
          <NavRow nextDisabled={!valid[4]} onNext={next} onBack={back} />
        </StepWrap>
      )}

      {screen === 5 && (
        <StepWrap step={5} total={TOTAL} title="제작 준비 상태" desc="현재 준비된 것을 모두 선택해 주세요.">
          <FieldLabel>준비된 자료</FieldLabel>
          <div className="mb-5 flex flex-wrap gap-2.5">
            {READY_OPTIONS.map((item) => (
              <OptionButton key={item} active={readyMaterials.includes(item)} onClick={() => toggleArray(readyMaterials, item, setReadyMaterials)}>{item}</OptionButton>
            ))}
          </div>
          <FieldLabel>제작 메모</FieldLabel>
          <TextArea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="원하는 콘셉트, 피하고 싶은 방향, 팀에게 전달하고 싶은 내용을 적어주세요." />
          <NavRow nextDisabled={!valid[5]} onNext={next} onBack={back} />
        </StepWrap>
      )}

      {screen === 6 && (
        <StepWrap step={6} total={TOTAL} title="예산 & 제작 정책" desc="예산감과 제작 정책 확인 여부를 알려주세요.">
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
            <input type="checkbox" checked={policyChecked} onChange={(e) => setPolicyChecked(e.target.checked)} className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer" style={{ accentColor: '#E2B6F7' }} />
            <span className="text-sm leading-normal text-[#d6d6df]">제작 과정과 수정 정책을 확인했습니다.</span>
          </label>
          <NavRow nextDisabled={!valid[6]} onNext={next} onBack={back} />
        </StepWrap>
      )}

      {screen === 7 && (
        <ContactStep
          step={7} total={TOTAL}
          email={email} setEmail={setEmail}
          discord={discord} setDiscord={setDiscord}
          xAccount={xAccount} setXAccount={setXAccount}
          sourceAnswer={sourceAnswer} setSourceAnswer={setSourceAnswer}
          agree={agree} setAgree={setAgree}
          submitting={submitting} submitError={submitError}
          valid={valid[7]}
          onSubmit={submit} onBack={back}
        />
      )}
    </>
  );
};
