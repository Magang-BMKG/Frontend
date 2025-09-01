import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Kamis1 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbyKP5MWZ88uQZ6VkDtl0-HuTVVBi8OrtpOoo0qgaRZVva5TVZXFTGhZoRTQ6cDPsPRnjA/exec";
  const PAGE_TITLE = "Pemeliharaan Berkala Kamis 1";
  const BACK_PATH = "/jadwal/kamis";

  return (
    <JadwalPemkala 
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Kamis1;