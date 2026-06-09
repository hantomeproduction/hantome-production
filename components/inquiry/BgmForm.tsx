import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  OptionButton,
  FieldLabel,
  TextInput,
  TextArea,
  StepWrap,
  NavRow,
  BasicInfoStep,
  ContactStep,
  ResultScreen,
} from './shared';

// ── 3대분류 × 세부항목 ──────────────────────────────────────────

type BgmCategory = '효과음' | '시그니처 사운드' | 'BGM';

const CATEGORY_ITEMS: Record<BgmCategory, { label: string; price: string }[]> = {
  '효과음': [
    { label: '전환 효과음', price: '3만 원~' },
    { label: '채팅·도네 효과음', price: '3만 원~' },
    { label: '짧은 SE', price: '3만 원~' },
  ],
  '시그니처 사운드': [
    { label: '인트로·아웃트로', price: '7만 원~' },
    { label: '도네이션 알림음', price: '7만 원~' },
    { label: '구독·팔로우 알림음', price: '7만 원~' },
  ],
  'BGM': [
    { label: '대기화면 BGM', price: '15만 원~' },
    { label: '방송 루프 BGM', price: '15만 원~' },
  ],
};

const CATEGORIES: BgmCategory[] = ['효과음', '시그니처 사운드', 'BGM'];
const TONES = ['귀여운', '아늑한', '시크한', '사이버', '레트로', '웅장한'];
const USE_CASES = ['치지직', '숲(SOOP)', '유튜브', '영상 편집용'];
const SCALE_OPTIONS = [
  { label: '단품', desc: '필요한 항목만 개별 제작' },
  { label: '패키지 (50만 원~)', desc: '효과음 세트 + 시그니처 사운드 3종 + BGM 3종(인·아웃트로 + 저챗 BGM)' },
];
const BUDGETS = ['30만 원 이하', '30 ~ 80만 원', '80만 원 이상', '상담 후 결정'];

const TOTAL = 6;

export const BgmForm: React.FC<{ sourceParam: string; onReset: () => void }> = ({ sourceParam, onReset }) => {
  const [screen, setScreen] = useState(1);
  const [creatorName, setCreatorName] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(sourceParam === '씨미' ? ['씨미'] : []);
  const [channelUrl, setChannelUrl] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [scale, setScale] = useState('');
  const [tones, setTones] = useState<string[]>([]);
  const [channelColor, setChannelColor] = useState('');
  const [useCases, setUseCases] = useState<string[]>([]);
  const [references, setReferences] = useState('');
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

  const valid: Record<number, boolean> = {
    1: creatorName.trim().length > 0 && platforms.length > 0 && channelUrl.trim().length > 0,
    2: selectedItems.length > 0 && scale !== '',
    3: tones.length > 0,
    4: useCases.length > 0,
    5: budget !== '' && policyChecked,
    6: email.trim().length > 0 && discord.trim().length > 0 && sourceAnswer !== '' && agree,
  };

  const next = () => { setScreen((s) => s + 1); window.scrollTo(0, 0); };
  const back = () => { setScreen((s) => s - 1); window.scrollTo(0, 0); };

  const toggleArray = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const submit = async () => {
    setSubmitting(true); setSubmitError('');
    try {
      await addDoc(collection(db, 'production_inquiries'), {
        inquiryType: 'bgm',
        sourceParam,
        creatorName: creatorName.trim(),
        platforms,
        channelUrl: channelUrl.trim(),
        selectedItems,
        scale,
        tones,
        channelColor: channelColor.trim(),
        useCases,
        references: references.trim(),
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
        ['필요 항목', selectedItems.join(', ')],
        ['규모', scale],
        ['분위기·톤', tones.join(', ')],
        ['사용처', useCases.join(', ')],
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
        <StepWrap step={2} total={TOTAL} title="필요한 사운드" desc="필요한 항목을 모두 선택해 주세요. 각 항목 옆 금액은 개당 시작가입니다.">
          {CATEGORIES.map((cat) => (
            <div key={cat} className="mb-6">
              <FieldLabel>{cat}</FieldLabel>
              <div className="flex flex-wrap gap-2.5">
                {CATEGORY_ITEMS[cat].map(({ label, price }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleArray(selectedItems, label, setSelectedItems)}
                    className={[
                      'flex items-center gap-2 rounded-full border-[1.5px] px-4 py-2.5 text-sm transition-colors',
                      selectedItems.includes(label)
                        ? 'border-[#E2B6F7] bg-[rgba(226,182,247,0.15)] text-[#E2B6F7] font-bold'
                        : 'border-[#303039] bg-[#101014] text-[#b8b8c2] hover:border-[#E2B6F7] hover:text-white',
                    ].join(' ')}
                  >
                    {label}
                    <span className={['text-[11px]', selectedItems.includes(label) ? 'text-[#b987ff]' : 'text-[#555562]'].join(' ')}>{price}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <FieldLabel>제작 규모</FieldLabel>
          <div className="mb-5 grid gap-3">
            {SCALE_OPTIONS.map(({ label, desc }) => (
              <button
                key={label}
                type="button"
                onClick={() => setScale(label)}
                className={[
                  'rounded-lg border-[1.5px] p-4 text-left transition-colors',
                  scale === label
                    ? 'border-[#E2B6F7] bg-[rgba(226,182,247,0.14)]'
                    : 'border-[#303039] bg-[rgba(16,16,20,0.88)] hover:border-[#E2B6F7]',
                ].join(' ')}
              >
                <div className="mb-1 font-bold text-white">{label}</div>
                <div className="text-[13px] text-[#8a8a94]">{desc}</div>
                {label.includes('패키지') && (
                  <div className="mt-2 text-[12px] text-[#676772]">추가 항목이 필요한 경우 견적 상담 시 별도 안내드립니다.</div>
                )}
              </button>
            ))}
          </div>
          <NavRow nextDisabled={!valid[2]} onNext={next} onBack={back} />
        </StepWrap>
      )}

      {screen === 3 && (
        <StepWrap step={3} total={TOTAL} title="분위기 & 채널" desc="채널 분위기와 세계관을 알려주세요.">
          <FieldLabel>분위기·톤 <span className="font-normal text-[#62626c]">(복수 선택 가능)</span></FieldLabel>
          <div className="mb-5 flex flex-wrap gap-2.5">
            {TONES.map((t) => (
              <OptionButton key={t} active={tones.includes(t)} onClick={() => toggleArray(tones, t, setTones)}>{t}</OptionButton>
            ))}
          </div>

          <FieldLabel>채널 컬러 또는 세계관 한 줄 설명 <span className="font-normal text-[#62626c]">(선택)</span></FieldLabel>
          <TextInput value={channelColor} onChange={(e) => setChannelColor(e.target.value)} placeholder="예: 핑크+퍼플 기반 아이돌 컨셉, 복고 게임 감성" />

          <NavRow nextDisabled={!valid[3]} onNext={next} onBack={back} />
        </StepWrap>
      )}

      {screen === 4 && (
        <StepWrap step={4} total={TOTAL} title="사용처 & 레퍼런스" desc="어디서 사용할 예정인지와 참고 사운드를 알려주세요.">
          <FieldLabel>주 사용처 <span className="font-normal text-[#62626c]">(복수 선택 가능)</span></FieldLabel>
          <div className="mb-5 flex flex-wrap gap-2.5">
            {USE_CASES.map((item) => (
              <OptionButton key={item} active={useCases.includes(item)} onClick={() => toggleArray(useCases, item, setUseCases)}>{item}</OptionButton>
            ))}
          </div>

          <FieldLabel>레퍼런스 링크 <span className="font-normal text-[#62626c]">(선택)</span></FieldLabel>
          <TextArea value={references} onChange={(e) => setReferences(e.target.value)} placeholder="비슷한 느낌의 방송 클립, 유튜브 사운드 링크, 곡 제목 등을 적어주세요." />

          <FieldLabel>제작 메모 <span className="font-normal text-[#62626c]">(선택)</span></FieldLabel>
          <TextArea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="특별히 원하는 방향, 피하고 싶은 표현, 팀에게 전달할 내용을 자유롭게 적어주세요." />
          <NavRow nextDisabled={!valid[4]} onNext={next} onBack={back} />
        </StepWrap>
      )}

      {screen === 5 && (
        <StepWrap step={5} total={TOTAL} title="예산 & 제작 정책" desc="예산감과 제작 정책 확인 여부를 알려주세요.">
          <FieldLabel>예상 예산</FieldLabel>
          <div className="mb-5 flex flex-wrap gap-2.5">
            {BUDGETS.map((item) => (
              <OptionButton key={item} active={budget === item} onClick={() => setBudget(item)}>{item}</OptionButton>
            ))}
          </div>

          <details open className="mb-4 overflow-hidden rounded-lg border border-[#2b2b33] bg-[rgba(15,15,18,0.82)]">
            <summary className="cursor-pointer px-4 py-3.5 text-[13px] font-bold text-[#E2B6F7]">제작 과정 및 정책 자세히 보기</summary>
            <div className="border-t border-[#23232a] p-4 text-[13px] leading-[1.75] text-[#c7c7d0]">
              <p className="mb-[18px]">제작 전 제작진과 방향성 확인 후 작업을 시작합니다.<br />필요 항목, 분위기, 사용 환경을 토대로 방향을 확정합니다.</p>
              <p className="mb-[18px]">제작 진행 후에는 항목별 최대 2회까지 수정이 가능합니다.<br />수정 1회는 한 번에 전달받은 피드백 묶음 기준입니다.</p>
              <p>패키지 외 추가 항목이 필요한 경우, 항목별 추가 견적을 별도 안내드립니다.</p>
            </div>
          </details>

          <label className="mb-[18px] flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={policyChecked} onChange={(e) => setPolicyChecked(e.target.checked)} className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer" style={{ accentColor: '#E2B6F7' }} />
            <span className="text-sm leading-normal text-[#d6d6df]">제작 과정과 정책을 확인했습니다.</span>
          </label>
          <NavRow nextDisabled={!valid[5]} onNext={next} onBack={back} />
        </StepWrap>
      )}

      {screen === 6 && (
        <ContactStep
          step={6} total={TOTAL}
          email={email} setEmail={setEmail}
          discord={discord} setDiscord={setDiscord}
          xAccount={xAccount} setXAccount={setXAccount}
          sourceAnswer={sourceAnswer} setSourceAnswer={setSourceAnswer}
          agree={agree} setAgree={setAgree}
          submitting={submitting} submitError={submitError}
          valid={valid[6]}
          onSubmit={submit} onBack={back}
        />
      )}
    </>
  );
};
