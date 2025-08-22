import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Kamis3 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbxQXbt-BxHkjj549_9Ftw3NOs-subA1ramX37Ybzko_ZMOBBdWUeyBBnnIuTjujOw/exec";
  const PAGE_TITLE = "Jadwal Kamis 3";
  const BACK_PATH = "/jadwal/kamis";

  return (
    <JadwalPemkala 
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Kamis3;