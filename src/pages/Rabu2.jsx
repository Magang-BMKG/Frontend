import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Rabu2 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbwpwSjIIeEh0H0icEVy6rBFHDD3vFClYE8vOygFixyFzjrkBRQdKmwLG5VFNStkojmfCQ/exec";
  const PAGE_TITLE = "Pemeliharaan Berkala Rabu 2";
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