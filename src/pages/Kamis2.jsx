import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Kamis2 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbxNYocY69Z0n9fAbRp9W0Y0v5BvYdlLQe6UPsHCUf8kYkwRPJTDNJN6e3TzsGXKUULr/exec";
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