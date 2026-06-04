import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const DISMISS_KEY = 'hantome_event_popup_dismissed_until';

export const EventPopup: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let dismissedUntil = 0;
    try {
      dismissedUntil = Number(localStorage.getItem(DISMISS_KEY) || '0');
    } catch {
      dismissedUntil = 0;
    }
    if (Date.now() > dismissedUntil) {
      // 진입 직후 살짝 지연 노출 (첫 화면 인상 후)
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => setOpen(false);

  const dismissToday = () => {
    try {
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      localStorage.setItem(DISMISS_KEY, String(endOfDay.getTime()));
    } catch {
      /* localStorage 사용 불가 시 무시 */
    }
    setOpen(false);
  };

  const goEvent = () => {
    setOpen(false);
    navigate('/event');
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      style={{ fontFamily: "'Paperlogy', 'Apple SD Gothic Neo', sans-serif" }}
      onClick={close}
    >
      <div
        className="relative w-full max-w-[400px] bg-[#0f0f0f] border border-[#E2B6F7]/30 rounded-2xl p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="닫기"
          className="absolute top-4 right-4 text-[#666] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-[11px] font-bold text-[#E2B6F7] tracking-[0.2em] uppercase mb-3">EVENT</div>
        <h3 className="text-xl font-bold text-white leading-snug mb-3">
          오리지널 곡<br />무료 제작 이벤트
        </h3>
        <p className="text-sm text-[#aaa] leading-relaxed mb-6">
          팔로워 1,000명 이상 버츄얼 크리에이터라면<br />
          누구나 응모 가능! 당신의 오리지널 곡을<br />
          한토메가 무료로 제작해 드립니다. 🎵
        </p>

        <button
          onClick={goEvent}
          className="w-full py-[14px] rounded-lg border-none text-[#050505] cursor-pointer text-[15px] font-bold transition-[filter] hover:brightness-110 mb-3"
          style={{ background: 'linear-gradient(135deg, #E2B6F7, #c084fc)' }}
        >
          이벤트 참여하기 →
        </button>

        <button
          onClick={dismissToday}
          className="w-full text-xs text-[#555] hover:text-[#888] transition-colors py-1"
        >
          오늘 하루 그만보기
        </button>
      </div>
    </div>
  );
};

export default EventPopup;
