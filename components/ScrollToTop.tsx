import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // ✨ 창(window)이 아니라 App.tsx에서 만든 스크롤 박스를 찾음
    const container = document.getElementById('main-scroll-container');
    if (!container) return;

    const toggleVisibility = () => {
      // 컨테이너가 스크롤된 거리가 화면 높이의 80%를 넘으면 버튼 표시
      if (container.scrollTop > window.innerHeight * 0.8) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    container.addEventListener('scroll', toggleVisibility);
    return () => container.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-40 p-4 rounded-full bg-black/50 border border-white/10 backdrop-blur-md text-white hover:bg-main-purple hover:text-black hover:border-main-purple transition-all duration-500 group ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-300" />
    </button>
  );
};