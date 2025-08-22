import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Rabu3 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbyZ-NLNgT-zqNBVC32_W9d1TWJgmn8kS7kimxWcXLtG2ktM53ZHP0eqVp8NNm12Erfq/exec";
  const PAGE_TITLE = "Jadwal Rabu 3";
  const BACK_PATH = "/jadwal/rabu";

  return (
    <JadwalPemkala 
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Rabu3;