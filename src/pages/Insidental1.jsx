import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Insidental1 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbxoDiKLQ3rnQXyM9VwgEL3LjVbZvpdvLl2tOFXFKFfHbePUa9OLB756DFzw_bDoxeG5qA/exec";
  const PAGE_TITLE = "Jadwal Insidental 1";
  const BACK_PATH = "/jadwal/insidental";

  return (
    <JadwalPemkala 
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Insidental1;