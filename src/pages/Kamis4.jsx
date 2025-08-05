import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Kamis4 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbwBqYUoc5PIIjP3larPixR3S1CR6pu-CJPhu6TJDlk4Df91QfFAD4K3bsz1OZAmZllVOw/exec";
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