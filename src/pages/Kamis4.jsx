import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Kamis4 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbyQ_8NFk1WEuh9iPn3rP9SJPGK6cYMd9NlJ6UZaRKGpSQAnla41Jv9_FGkB0q_HSml3Xg/exec";
  const PAGE_TITLE = "Jadwal Kamis 4";
  const BACK_PATH = "/jadwal/kamis";

  return (
    <JadwalPemkala 
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Kamis4;