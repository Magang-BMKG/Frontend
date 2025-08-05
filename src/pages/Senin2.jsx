import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Senin2 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbxQluYpv4zfbGaZxrTid5tKQWdKeyw-Ke6w7G5gpMJ-cU0Frm1VyWPM_B_tQJZ1pyWqiQ/exec";
  const PAGE_TITLE = "Jadwal Senin 2";
  const BACK_PATH = "/jadwal/senin";

  return (
    <JadwalPemkala
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Senin2;