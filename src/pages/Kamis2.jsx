import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Kamis2 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbzgnMWDWc3EX7Fk20XsYjPllqi3U-5dHyp9M4EXsncoWwKRF0l9NI3C6dJkWEMxkGRcnQ/exec";
  const PAGE_TITLE = "Jadwal Kamis 2";
  const BACK_PATH = "/jadwal/kamis";

  return (
    <JadwalPemkala 
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Kamis2;