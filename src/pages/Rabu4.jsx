import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Rabu4 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbyIUN0WZmtaPTQzJ22Xp8PjABWA4GlDPpw4LS3twOu1D8Oz8mxU3R85RrW7On3nS19Q/exec";
  const PAGE_TITLE = "Jadwal Rabu 4";
  const BACK_PATH = "/jadwal/rabu";

  return (
    <JadwalPemkala 
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Rabu4;