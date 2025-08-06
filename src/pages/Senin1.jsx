import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Senin1 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbxNFSviYIxFsNMqO71Le5dgyTrF4c6-fQDwp-UkukNaLkE4D2BrZjuT9QRTy2Kk0bM_7w/exec";
  const PAGE_TITLE = "Jadwal Senin 1";
  const BACK_PATH = "/jadwal/senin";

  return (
    <JadwalPemkala 
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Senin1;