import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Selasa4 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbwqYlBZDG9NqTx8VPRbf7kmZDugVrQ0274bafVmwQ3R4JpD9i8zmyA-juiTj1X2e_u0/exec";
  const PAGE_TITLE = "Jadwal Selasa 4";
  const BACK_PATH = "/jadwal/selasa";

  return (
    <JadwalPemkala 
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Selasa4;