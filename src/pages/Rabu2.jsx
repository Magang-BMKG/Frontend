import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Rabu2 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbxivknyr3A_wCbb2HJHcRZzoMjOWMdfaGxsQidsmSPfixJwOGKqQclE66rDMfCOQOM4/exec";
  const PAGE_TITLE = "Jadwal Rabu 2";
  const BACK_PATH = "/jadwal/rabu";

  return (
    <JadwalPemkala 
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Rabu2;