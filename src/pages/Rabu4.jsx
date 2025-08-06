import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Rabu4 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbweaDSGjaUAWyjXTKwp8Fz9u_oRBPZh1oB64AF1o0UGFfFBWWVZAmXyXgebTvq8e6ZZeQ/exec";
  const PAGE_TITLE = "Jadwal Rabu 4";
  const BACK_PATH = "/jadwal/rabu";

  return (
    <JadwalPemkala 
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Rabu4;