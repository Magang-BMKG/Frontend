import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Selasa1 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbyGcuYaa4z8KrGWWjwWHcg6QIrQMmPJk_kWaw7Y6H1ZV3Mj70xkAtmAzjNlv2ibxr4/exec";
  const PAGE_TITLE = "Jadwal Selasa 1";
  const BACK_PATH = "/jadwal/selasa";

  return (
    <JadwalPemkala 
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Selasa1;