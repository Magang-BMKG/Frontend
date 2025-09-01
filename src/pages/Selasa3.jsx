import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Selasa3 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycby7MCLlcN-_1N16gQe8DAYIovCsJYRgXka0CekVuxQaV5jKe8tgKAMzq4EM8ta01hsDdg/exec";
  const PAGE_TITLE = "Pemeliharaan Berkala Selasa 3";
  const BACK_PATH = "/jadwal/selasa";

  return (
    <JadwalPemkala 
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Selasa3;