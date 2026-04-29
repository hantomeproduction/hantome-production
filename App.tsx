import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Work } from './components/Work';
import { About } from './components/About';
import { Services } from './components/Services';
import { Contact } from './components/Contact';
import { ScrollToTop } from './components/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      {/* ✨ 유일한 스크롤 주체: h-[100dvh]로 높이를 딱 맞추고 snap을 건다 */}
      <div 
        id="main-scroll-container" 
        className="h-[100dvh] w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory bg-[#050505] text-white"
      >
        <Navbar />
        <Hero />
        <Work />
        <About />
        <Services />
        <Contact />
        <ScrollToTop />
      </div>
    </BrowserRouter>
  );
}

export default App;