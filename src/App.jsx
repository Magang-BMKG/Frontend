import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './component/landingpage';
import DaftarTeknisiPage from './component/destopteknisi';
// import Login from './component/login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/destopteknisi" element={<DaftarTeknisiPage />} />
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="*" element={<div>404 - Halaman tidak ditemukan</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
