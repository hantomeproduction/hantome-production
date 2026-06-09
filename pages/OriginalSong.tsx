import React, { useState } from 'react';
import { OriginalForm } from '../components/inquiry/OriginalForm';
import { CoverForm } from '../components/inquiry/CoverForm';
import { BgmForm } from '../components/inquiry/BgmForm';

type InquiryType = 'original' | 'cover' | 'bgm' | null;

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

const TYPE_CARDS: { type: InquiryType; title: string; subtitle: string; desc: string; emoji: string }[] = [
  {
    type: 'original',
    emoji: '🎵',
    title: '오리지널곡',
    subtitle: 'Original Song',
    desc: '데뷔곡, 기념일곡, 세계관 테마곡, 음원 발매용 신곡 제작',
  },
  {
    type: 'cover',
    emoji: '🎤',
    title: '커버곡',
    subtitle: 'Cover Song',
    desc: '원하는 곡을 버츄얼 크리에이터 스타일로 편곡·녹음·제작',
  },
  {
    type: 'bgm',
    emoji: '🔊',
    title: 'BGM · 효과음',
    subtitle: 'BGM / SFX',
    desc: '방송 시그니처 사운드, 알림음, 대기화면·루프 BGM 제작',
  },
];

export const OriginalSong: React.FC = () => {
  const [sourceParam] = useState(getSourceParam);
  const [inquiryType, setInquiryType] = useState<InquiryType>(null);

  const reset = () => { setInquiryType(null); window.scrollTo(0, 0); };

  return (
    <main
      className="min-h-screen px-4 py-10 text-[#ececf2]"
      style={{
        fontFamily: "'Paperozi', 'Apple SD Gothic Neo', sans-serif",
        background:
          'radial-gradient(circle at 32% 18%, rgba(153, 93, 255, 0.22), transparent 28%), radial-gradient(circle at 70% 76%, rgba(226, 182, 247, 0.14), transparent 30%), #050506',
      }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[760px] flex-col justify-center">

        {/* Header */}
        <div className="mb-[30px] flex items-center justify-between gap-4">
          <img
            src="/logo.png"
            alt="Hantome Production"
            className="h-[60px] w-[168px] object-contain object-left drop-shadow-[0_0_18px_rgba(226,182,247,0.18)] max-[720px]:h-12 max-[720px]:w-[134px]"
          />
          {sourceParam && (
            <div className="whitespace-nowrap rounded-full border border-[rgba(226,182,247,0.42)] bg-[rgba(226,182,247,0.08)] px-3 py-2 text-xs text-[#E2B6F7]">
              {sourceParam} 유입 링크
            </div>
          )}
        </div>

        {/* Progress bar — 타입 미선택 시 0% */}
        {inquiryType && (
          <div className="mb-[38px] h-[3px] overflow-hidden rounded-sm bg-[#19191f] max-[720px]:mb-[34px]">
            <div className="h-full rounded-sm bg-gradient-to-r from-[#E2B6F7] to-[#b987ff] transition-[width] duration-300" style={{ width: '14%' }} />
          </div>
        )}
        {!inquiryType && (
          <div className="mb-[38px] h-[3px] rounded-sm bg-[#19191f] max-[720px]:mb-[34px]" />
        )}

        {/* Type selection */}
        {!inquiryType && (
          <div>
            <div className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E2B6F7]">Production Inquiry</div>
            <h1 className="mb-4 text-[clamp(24px,5vw,36px)] font-bold leading-tight text-white">
              제작 상담 신청
            </h1>
            <p className="mb-8 text-sm leading-[1.82] text-[#8a8a94]">
              원하시는 제작 유형을 선택해 주세요.<br />
              선택하신 유형에 맞는 상담 양식으로 안내해 드립니다.
            </p>

            <div className="grid gap-4 max-[720px]:gap-3">
              {TYPE_CARDS.map(({ type, emoji, title, subtitle, desc }) => (
                <button
                  key={type!}
                  type="button"
                  onClick={() => { setInquiryType(type); window.scrollTo(0, 0); }}
                  className="group flex items-center gap-5 rounded-xl border-[1.5px] border-[#2b2b33] bg-[rgba(15,15,18,0.82)] p-5 text-left transition-all hover:border-[#E2B6F7] hover:bg-[rgba(226,182,247,0.06)] max-[720px]:gap-4 max-[720px]:p-4"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[rgba(226,182,247,0.2)] bg-[rgba(226,182,247,0.08)] text-2xl transition-all group-hover:border-[rgba(226,182,247,0.5)] group-hover:bg-[rgba(226,182,247,0.14)] max-[720px]:h-12 max-[720px]:w-12 max-[720px]:text-xl">
                    {emoji}
                  </span>
                  <span className="flex-1">
                    <span className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-white max-[720px]:text-base">{title}</span>
                      <span className="text-xs text-[#62626c]">{subtitle}</span>
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-[#8a8a94]">{desc}</span>
                  </span>
                  <span className="shrink-0 text-[#555562] transition-colors group-hover:text-[#E2B6F7]">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form render by type */}
        {inquiryType === 'original' && <OriginalForm sourceParam={sourceParam} onReset={reset} />}
        {inquiryType === 'cover' && <CoverForm sourceParam={sourceParam} onReset={reset} />}
        {inquiryType === 'bgm' && <BgmForm sourceParam={sourceParam} onReset={reset} />}

      </div>
    </main>
  );
};
