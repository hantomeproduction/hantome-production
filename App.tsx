import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Admin } from './pages/Admin';
import { Event } from './pages/Event';
import { OriginalSong } from './pages/OriginalSong';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/event" element={<Event />} />
        <Route path="/original-song" element={<OriginalSong />} />
        <Route path="/qksxnaud" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
