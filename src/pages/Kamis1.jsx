import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Kamis1 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbye63zUWArQXlU38hok1xk5zJt-3ws03GH7Vrl1g2fq4BsyAD4iHCq5Fs76DJ9GBKUX/exec";
  const PAGE_TITLE = "Jadwal Kamis 1";
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