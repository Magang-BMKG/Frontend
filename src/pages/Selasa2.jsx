import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Selasa2 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbwH-Ak918K-Ecnn6zkhb1zA0mtKnaAeLuUFKHHbMsECCe135uLaeEvcjnurnUnl2UBt/exec";
  const PAGE_TITLE = "Jadwal Selasa 2";
  const BACK_PATH = "/jadwal/selasa";

  return (
    <JadwalPemkala 
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Selasa2;