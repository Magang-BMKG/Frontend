import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Insidental2 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbxMBwO1tvdGS2BIKR_bQMNi6Cmux0fYgRsmaJoD3VRQKzLcG3Tzlfm3QFskwrfThDopiw/exec";
  const PAGE_TITLE = "Jadwal Insidental 2";
  const BACK_PATH = "/jadwal/insidental";

  return (
    <JadwalPemkala 
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Insidental2;