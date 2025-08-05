import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Senin3 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbzQ6HHu3dUj6KeRptkBFu25q8ZEIGYRWAEJ2ZSqFlSccDWY2eosdPpnL_hjaKvRNKfruA/exec";
  const PAGE_TITLE = "Jadwal Senin 3";
  const BACK_PATH = "/jadwal/senin";

  return (
    <JadwalPemkala 
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Senin3;