import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Selasa2 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbwojyxSmi4671dXeF6Vlyf39BZn4eFjuPXG9pOrM1XhsvvSI7kel9v_wFmMNhAJBMiWuw/exec";
  const PAGE_TITLE = "Jadwal Selasa 2";
  const BACK_PATH = "/jadwal/selasa";

  return (
    <JadwalPemkala 
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Selasa2;