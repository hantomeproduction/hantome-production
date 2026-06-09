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
  PackageCard,
  BasicInfoStep,
  ContactStep,
  ResultScreen,
} from './shared';

const PURPOSES = ['방송용', '유튜브 업로드', '음원 발매', '기념일·이벤트', '기타'];
const VISUAL_OPTIONS = ['음원만 필요', '모션 MV 필요', '일러스트·MV 상담 원함', '아직 모르겠음'];
const READY_OPTIONS = ['보컬 녹음 파일 있음', '가이드 녹음 있음', '캐릭터 설정 있음', '아트 소스 준비됨', '전부 오마카세로 맡기고 싶음'];
const BUDGETS = ['30 ~ 80만 원', '80 ~ 150만 원', '150만 원 이상', '상담 후 결정'];

const TOTAL = 6;

export const CoverForm: React.FC<{ sourceParam: string; onReset: () => void }> = ({ sourceParam, onReset }) => {
  const [screen, setScreen] = useState(1);
  const [creatorName, setCreatorName] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(sourceParam === '씨미' ? ['씨미'] : []);
  const [channelUrl, setChannelUrl] = useState('');
  const [coverSongs, setCoverSongs] = useState('');
  const [purpose, setPurpose] = useState('');
  const [purposeOther, setPurposeOther] = useState('');
  const [packageName, setPackageName] = useState('');
  const [visualScope, setVisualScope] = useState('');
  const [readyMaterials, setReadyMaterials] = useState<string[]>([]);
  const [customReferences, setCustomReferences] = useState('');
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

  const effectivePurpose = purpose === '기타' ? purposeOther.trim() : purpose;

  const valid: Record<number, boolean> = {
    1: creatorName.trim().length > 0 && platforms.length > 0 && channelUrl.trim().length > 0,
    2: coverSongs.trim().length > 0 && purpose !== '' && (purpose !== '기타' || purposeOther.trim().length > 0),
    3: packageName !== '' && visualScope !== '',
    4: readyMaterials.length > 0,
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
        inquiryType: 'cover',
        sourceParam,
        creatorName: creatorName.trim(),
        platforms,
        channelUrl: channelUrl.trim(),
        coverSongs: coverSongs.trim(),
        purpose: effectivePurpose,
        packageName,
        visualScope,
        readyMaterials,
        customReferences: customReferences.trim(),
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
        ['커버 원곡', coverSongs.split('\n').filter(Boolean).join(', ')],
        ['공개 목적', effectivePurpose],
        ['제작 포맷', `${packageName} / ${visualScope}`],
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
        <StepWrap step={2} total={TOTAL} title="커버 원곡" desc="커버하고 싶은 곡과 공개 목적을 알려주세요.">
          <FieldLabel>커버할 원곡 <span className="font-normal text-[#62626c]">(곡 제목·아티스트, 여러 곡이면 줄바꿈)</span></FieldLabel>
          <TextArea
            value={coverSongs}
            onChange={(e) => setCoverSongs(e.target.value)}
            placeholder={'예:\nAdo - うっせぇわ\nYOASOBI - アイドル https://youtu.be/...'}
          />

          <FieldLabel>공개 목적</FieldLabel>
          <div className="mb-5 flex flex-wrap gap-2.5">
            {PURPOSES.map((item) => (
              <OptionButton key={item} active={purpose === item} onClick={() => setPurpose(item)}>{item}</OptionButton>
            ))}
          </div>
          {purpose === '기타' && (
            <TextInput
              value={purposeOther}
              onChange={(e) => setPurposeOther(e.target.value)}
              placeholder="공개 목적을 직접 입력해 주세요"
            />
          )}
          <NavRow nextDisabled={!valid[2]} onNext={next} onBack={back} />
        </StepWrap>
      )}

      {screen === 3 && (
        <StepWrap step={3} total={TOTAL} title="제작 포맷 선택" desc="편곡·제작 범위를 선택해 주세요. 아래 금액은 시작가 기준이며 최종 견적은 사전 회의 후 확정됩니다.">
          <div className="mb-5 grid grid-cols-3 gap-3 max-[720px]:grid-cols-1">
            <PackageCard
              name="Basic"
              price="30만 원부터"
              selected={packageName === 'Basic'}
              onClick={() => setPackageName('Basic')}
              bullets={['MR 구해서 사용', '보컬 튜닝·믹싱', '기본 마스터링']}
              recommend="MR이 이미 있거나 직접 구할 수 있는 경우"
            />
            <PackageCard
              name="Standard"
              price="80만 원부터"
              selected={packageName === 'Standard'}
              onClick={() => setPackageName('Standard')}
              bullets={['인스트루멘탈 별도 제작', '보컬 디렉팅', '믹싱/마스터링']}
              recommend="퀄리티 있는 커버를 처음 제작하는 경우"
            />
            <PackageCard
              name="Premium"
              price="150만 원부터"
              selected={packageName === 'Premium'}
              onClick={() => setPackageName('Premium')}
              bullets={['새 편곡(어레인지) 제작', '풀 보컬 프로덕션', 'MV 기획 연계 가능']}
              recommend="나만의 색깔로 재해석하고 싶은 경우"
            />
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
        <StepWrap step={4} total={TOTAL} title="준비 상태" desc="현재 준비된 것을 모두 선택하고 전달할 내용을 적어주세요.">
          <FieldLabel>준비된 자료</FieldLabel>
          <div className="mb-5 flex flex-wrap gap-2.5">
            {READY_OPTIONS.map((item) => (
              <OptionButton key={item} active={readyMaterials.includes(item)} onClick={() => toggleArray(readyMaterials, item, setReadyMaterials)}>{item}</OptionButton>
            ))}
          </div>

          <FieldLabel>직접 참고곡 링크 <span className="font-normal text-[#62626c]">(선택)</span></FieldLabel>
          <TextArea value={customReferences} onChange={(e) => setCustomReferences(e.target.value)} placeholder="원하는 편곡 스타일과 가까운 커버곡을 링크 또는 제목으로 적어주세요." />

          <FieldLabel>제작 메모 <span className="font-normal text-[#62626c]">(선택)</span></FieldLabel>
          <TextArea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="원하는 방향, 피하고 싶은 표현, 팀에게 전달할 내용을 자유롭게 적어주세요." />
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
            <summary className="cursor-pointer px-4 py-3.5 text-[13px] font-bold text-[#E2B6F7]">제작 과정 및 저작권 정책 자세히 보기</summary>
            <div className="border-t border-[#23232a] p-4 text-[13px] leading-[1.75] text-[#c7c7d0]">
              <p className="mb-[18px]">제작 전 제작진과 음성 또는 대면 회의를 진행합니다.<br />회의에서는 편곡 방향, 보컬 방식, 공개 일정, 필요한 제작 범위를 확정합니다.</p>
              <p className="mb-[18px]">제작 진행 후에는 확정된 제작 범위 안에서 파트별 최대 2회까지 수정이 가능합니다.<br />수정 1회는 한 번에 전달받은 피드백 묶음 기준입니다.</p>
              <p className="mb-[18px]">커버곡의 원저작권·실연권 처리는 사전 협의를 통해 책임 소재를 확정합니다.<br />저작권 클리어링 관련 내용은 계약 전 반드시 공유해 주세요.</p>
              <p>보컬 녹음을 오프라인 스튜디오에서 진행할 경우, 스튜디오 대관·엔지니어 비용이 별도로 발생할 수 있습니다.</p>
            </div>
          </details>

          <label className="mb-[18px] flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={policyChecked} onChange={(e) => setPolicyChecked(e.target.checked)} className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer" style={{ accentColor: '#E2B6F7' }} />
            <span className="text-sm leading-normal text-[#d6d6df]">제작 과정, 수정 정책, 저작권 안내를 확인했습니다.</span>
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
