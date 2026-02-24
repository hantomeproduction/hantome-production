import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { About } from '../components/About';
import { Work } from '../components/Work';
import { Services } from '../components/Services';
import { Contact } from '../components/Contact';
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
    }
  }, [location]);

  return (
    <div className="antialiased text-white selection:bg-white selection:text-black bg-[#050505] h-[100dvh] w-full overflow-hidden">
      <style>
        {`
          a[href*="unicorn.studio"], div[class*="unicorn-studio"], 
          span[class*="unicorn-studio"], [id*="unicorn-studio"] {
            display: none !important; visibility: hidden !important; opacity: 0 !important;
            pointer-events: none !important; z-index: -9999 !important;
            width: 0 !important; height: 0 !important; position: absolute !important; top: -9999px !important;
          }
          .snap-container { -ms-overflow-style: none; scrollbar-width: none; }
          .snap-container::-webkit-scrollbar { display: none; }
        `}
      </style>

      <Navbar />
      <ScrollToTop />
      
      <main className="snap-container h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth relative z-10">
        <Hero />
        <Work />
        <About />
        <Services />
        <Contact />
        {/* ✨ 푸터(Footer)는 여기서 지우고 Contact 안으로 넣었어! */}
      </main>
    </div>
  );
};