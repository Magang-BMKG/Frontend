import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/landingpage';
import DaftarTeknisiPage from './pages/destopteknisi';
import DaftarInstrumenPage from './pages/instrumen';
import LogbookPage from './pages/logbook';
import LogbookPagiPage from "./pages/logbookPagi";
import Perka from './pages/perka';
import PerkaMekanik from './pages/perkaMekanik';
import PerkaCanggih from './pages/perkaCanggih';
import PerkaSederhana from './pages/perkaSederhana';
import Jadwal from './pages/jadwal';
import JadwalSeninPage from './pages/jadwalSeninPage';
import Senin1 from './pages/Senin1';
import Senin2 from './pages/Senin2';
import Senin3 from './pages/Senin3';
import JadwalSelasaPage from './pages/jadwalSelasaPage';
import Selasa1 from './pages/Selasa1';
import Selasa2 from './pages/Selasa2';
import Selasa3 from './pages/Selasa3';
import Selasa4 from './pages/Selasa4';
import JadwalRabuPage from './pages/jadwalRabuPage';
import Rabu1 from './pages/Rabu1';
import Rabu2 from './pages/Rabu2';
import Rabu3 from './pages/Rabu3';
import Rabu4 from './pages/Rabu4';
import JadwalKamisPage from './pages/jadwalKamisPage';
import Kamis1 from './pages/Kamis1';
import Kamis2 from './pages/Kamis2';
import Kamis3 from './pages/Kamis3';
import Kamis4 from './pages/Kamis4';
import JadwalInsidentalPage from './pages/jadwalInsidentalPage';
import Insidental1 from './pages/Insidental1';

// import Login from './component/login';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/destopteknisi" element={<DaftarTeknisiPage />} />
          <Route path="/instrumen" element={<DaftarInstrumenPage />} />
          <Route path="/logbook" element={<LogbookPage />} />
          <Route path="/logbookPagi" element={<LogbookPagiPage />} />
          <Route path="/perka" element={<Perka />} />
          <Route path="/perkaMekanik" element={<PerkaMekanik />} />
          <Route path="/perkaCanggih" element={<PerkaCanggih />} />
          <Route path="/perkaSederhana" element={<PerkaSederhana />} />
          <Route path="/jadwal" element={<Jadwal/>} />
          <Route path="/jadwal/senin" element={<JadwalSeninPage />} />
          <Route path="/jadwal/senin1" element={<Senin1 />} />
          <Route path="/jadwal/senin2" element={<Senin2 />} />
          <Route path="/jadwal/senin3" element={<Senin3 />} />
          <Route path="/jadwal/selasa" element={<JadwalSelasaPage />} />
          <Route path="/jadwal/selasa1" element={<Selasa1 />} />
          <Route path="/jadwal/selasa2" element={<Selasa2 />} />
          <Route path="/jadwal/selasa3" element={<Selasa3 />} />
          <Route path="/jadwal/selasa4" element={<Selasa4 />} />
          <Route path="/jadwal/rabu" element={<JadwalRabuPage />} />
          <Route path="/jadwal/rabu1" element={<Rabu1 />} />
          <Route path="/jadwal/rabu2" element={<Rabu2 />} />
          <Route path="/jadwal/rabu3" element={<Rabu3 />} />
          <Route path="/jadwal/rabu4" element={<Rabu4 />} />
          <Route path="/jadwal/kamis" element={<JadwalKamisPage />} />
          <Route path="/jadwal/kamis1" element={<Kamis1 />} />
          <Route path="/jadwal/kamis2" element={<Kamis2 />} />
          <Route path="/jadwal/kamis3" element={<Kamis3 />} />
          <Route path="/jadwal/kamis4" element={<Kamis4 />} />
          <Route path="/jadwal/insidental" element={<JadwalInsidentalPage />} />
          <Route path="/jadwal/insidental1" element={<Insidental1 />} />
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="*" element={<div>404 - Halaman tidak ditemukan</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
