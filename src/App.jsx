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
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="*" element={<div>404 - Halaman tidak ditemukan</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
