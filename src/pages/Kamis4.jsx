import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Kamis4 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbzfnTZR1c_kArVBligUWwBfsf8iLvz5f0cT0Ky7XCvMTgLUNix_pSPYT2spUym56Jg2/exec";
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