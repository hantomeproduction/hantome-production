import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { About } from '../components/About';
import { Work } from '../components/Work';
import { Services } from '../components/Services';
import { Contact } from '../components/Contact';
import { Marquee } from '../components/Marquee';
import { Footer } from '../components/Footer';
import { ScrollToTop } from '../components/ScrollToTop';

export const Home: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      // Clear state to prevent scroll on refresh? React Router state persists.
      // But it's fine for now.
    }
  }, [location]);

  return (
    <div className="antialiased text-white selection:bg-white selection:text-black bg-[#050505]">
      
      {/* 🦄 유니콘 스튜디오 뱃지 강제 숨기기 스타일 주입 */}
      <style>
        {`
          /* 유니콘 스튜디오와 관련된 모든 링크, div, id를 찾아내서 없애버림 */
          a[href*="unicorn.studio"], 
          div[class*="unicorn-studio"], 
          span[class*="unicorn-studio"],
          [id*="unicorn-studio"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
            z-index: -9999 !important;
            width: 0 !important;
            height: 0 !important;
            position: absolute !important;
            top: -9999px !important;
          }
        `}
      </style>

      <Navbar />
      <ScrollToTop />
      <main>
        <Hero />
        
        {/* Marquee 1: Slow speed (100s), Mixed variant, Blurred */}
        <Marquee 
            items={["Hantōme Production", "Define the Undefined", "Virtual Artist Management", "Est. 2026"]} 
            speed={100}
            variant="mixed"
            className="border-t border-white/10"
        />
        
        <Work />
        
        {/* Marquee 2: Slow speed (80s), Outline variant, Blurred */}
        {/* Added border-y to create separator lines between Work and About sections */}
        <Marquee 
            items={["Our Works", "Original Sound Track", "Music Video", "Creative Direction", "Visual Arts"]} 
            speed={80}
            direction="right"
            variant="outline"
            className="border-y border-white/10"
        />
        
        <About />
        
        {/* Marquee 3: Very Slow speed (120s), Solid variant, Blurred */}
        <Marquee 
            items={["Professional Services", "Sound Engineering", "Vocal Directing", "Session & Cover", "Mix & Master"]} 
            speed={120}
            variant="solid"
            className="border-b border-white/10"
        />
        
        <Services />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};