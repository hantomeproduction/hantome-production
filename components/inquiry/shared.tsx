import React from 'react';

// ── Primitive UI ──────────────────────────────────────────────

export const OptionButton: React.FC<{
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

export const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-2 text-xs font-bold tracking-[0.1em] text-[#E2B6F7]">{children}</div>
);

export const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className="mb-[18px] w-full rounded-lg border-[1.5px] border-[#303039] bg-[#101014] px-[15px] py-[13px] text-[15px] text-[#ececf2] outline-none transition-colors placeholder:text-[#51515b] focus:border-[#E2B6F7]"
  />
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className="mb-[18px] min-h-28 w-full resize-y rounded-lg border-[1.5px] border-[#303039] bg-[#101014] px-[15px] py-[13px] text-[15px] leading-relaxed text-[#ececf2] outline-none transition-colors placeholder:text-[#51515b] focus:border-[#E2B6F7]"
  />
);

export const StepWrap: React.FC<{
  step: number;
  total: number;
  title: string;
  desc: React.ReactNode;
  children: React.ReactNode;
}> = ({ step, total, title, desc, children }) => (
  <div>
    <div className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E2B6F7]">Step {step} / {total}</div>
    <h1 className="mb-4 text-[clamp(24px,5vw,36px)] font-bold leading-tight text-white">{title}</h1>
    <p className="mb-8 text-sm leading-[1.82] text-[#8a8a94]">{desc}</p>
    {children}
  </div>
);

export const NavRow: React.FC<{
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

export const PackageCard: React.FC<{
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
      {bullets.map((b) => <li key={b}>{b}</li>)}
    </ul>
    <div className="mt-auto whitespace-nowrap border-t border-[rgba(226,182,247,0.18)] pt-3 text-[12.5px] font-bold leading-snug text-[#E2B6F7] max-[720px]:whitespace-normal">
      추천: {recommend}
    </div>
  </button>
);

// ── Common Steps ──────────────────────────────────────────────

const PLATFORMS = ['씨미', '치지직', '숲(SOOP)', '유튜브', 'X(트위터)', '기타'];
const SOURCES = ['씨미', 'X(트위터)', '지인 소개', '유튜브/커뮤니티', '기타'];

export const BasicInfoStep: React.FC<{
  total: number;
  creatorName: string;
  setCreatorName: (v: string) => void;
  platforms: string[];
  setPlatforms: (v: string[]) => void;
  channelUrl: string;
  setChannelUrl: (v: string) => void;
  valid: boolean;
  onNext: () => void;
  onBack: () => void;
}> = ({ total, creatorName, setCreatorName, platforms, setPlatforms, channelUrl, setChannelUrl, valid, onNext, onBack }) => {
  const toggle = (val: string) =>
    setPlatforms(platforms.includes(val) ? platforms.filter((p) => p !== val) : [...platforms, val]);
  return (
    <StepWrap step={1} total={total} title="기본 정보" desc="활동명, 플랫폼, 채널 링크를 알려주세요.">
      <FieldLabel>버츄얼 크리에이터 활동명</FieldLabel>
      <TextInput value={creatorName} onChange={(e) => setCreatorName(e.target.value)} placeholder="활동명을 입력해 주세요" />

      <FieldLabel>주 활동 플랫폼 <span className="font-normal text-[#62626c]">(복수 선택 가능)</span></FieldLabel>
      <div className="mb-5 flex flex-wrap gap-2.5">
        {PLATFORMS.map((p) => (
          <OptionButton key={p} active={platforms.includes(p)} onClick={() => toggle(p)}>{p}</OptionButton>
        ))}
      </div>

      <FieldLabel>대표 채널 링크</FieldLabel>
      <TextInput type="url" value={channelUrl} onChange={(e) => setChannelUrl(e.target.value)} placeholder="https://" />

      <NavRow nextDisabled={!valid} onNext={onNext} onBack={onBack} />
    </StepWrap>
  );
};

export const ContactStep: React.FC<{
  step: number;
  total: number;
  email: string;
  setEmail: (v: string) => void;
  discord: string;
  setDiscord: (v: string) => void;
  xAccount: string;
  setXAccount: (v: string) => void;
  sourceAnswer: string;
  setSourceAnswer: (v: string) => void;
  agree: boolean;
  setAgree: (v: boolean) => void;
  submitting: boolean;
  submitError: string;
  valid: boolean;
  onSubmit: () => void;
  onBack: () => void;
}> = ({ step, total, email, setEmail, discord, setDiscord, xAccount, setXAccount, sourceAnswer, setSourceAnswer, agree, setAgree, submitting, submitError, valid, onSubmit, onBack }) => (
  <StepWrap step={step} total={total} title="연락처" desc="견적 안내와 제작 상담을 받을 이메일, 디스코드 계정을 입력해 주세요.">
    <FieldLabel>이메일 주소</FieldLabel>
    <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" />

    <FieldLabel>디스코드 아이디</FieldLabel>
    <TextInput value={discord} onChange={(e) => setDiscord(e.target.value)} placeholder="Discord ID 또는 username" />

    <FieldLabel>X(트위터) 계정 <span className="font-normal text-[#62626c]">(선택)</span></FieldLabel>
    <TextInput value={xAccount} onChange={(e) => setXAccount(e.target.value)} placeholder="@계정명" />

    <FieldLabel>이 신청을 알게 된 경로</FieldLabel>
    <div className="mb-5 flex flex-wrap gap-2.5">
      {SOURCES.map((s) => (
        <OptionButton key={s} active={sourceAnswer === s} onClick={() => setSourceAnswer(s)}>{s}</OptionButton>
      ))}
    </div>

    <label className="mb-[18px] flex cursor-pointer items-start gap-3">
      <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer" style={{ accentColor: '#E2B6F7' }} />
      <span className="text-sm leading-normal text-[#d6d6df]">입력한 이메일과 디스코드로 한토메 프로덕션의 제작 상담 안내를 받는 것에 동의합니다.</span>
    </label>

    {submitError && <div className="mb-3 text-[13px] text-red-300">{submitError}</div>}

    <NavRow nextDisabled={!valid || submitting} nextLabel={submitting ? '제출 중...' : '상담 신청 완료 →'} onNext={onSubmit} onBack={onBack} />
  </StepWrap>
);

// ── Result Screen ─────────────────────────────────────────────

export const ResultScreen: React.FC<{ rows: [string, string][] }> = ({ rows }) => (
  <div>
    <div className="pb-8 pt-7 text-center">
      <div className="mx-auto mb-[18px] grid h-[58px] w-[58px] place-items-center rounded-full border border-[rgba(226,182,247,0.45)] bg-[rgba(226,182,247,0.12)] text-3xl text-[#E2B6F7]">✓</div>
      <div className="mb-2 text-2xl font-bold text-white">상담 신청이 접수됐습니다</div>
      <div className="text-sm leading-relaxed text-[#8a8a94]">
        작성 내용 확인 후 영업일 기준 1~3일 이내 연락드립니다.<br />
        선택하신 방향과 내용을 바탕으로 제작 범위와 견적을 안내드릴게요.
      </div>
    </div>
    <div className="mb-5 rounded-lg border border-[#2b2b33] bg-[rgba(15,15,18,0.88)] p-[18px]">
      <h3 className="mb-3.5 text-[13px] font-bold uppercase tracking-[0.12em] text-[#E2B6F7]">접수 요약</h3>
      <div className="grid gap-2.5 text-[13px] leading-relaxed text-[#c7c7d0]">
        {rows.map(([label, value]) => (
          <div key={label}><strong className="mr-1.5 text-white">{label}</strong>{value || '-'}</div>
        ))}
      </div>
    </div>
  </div>
);
