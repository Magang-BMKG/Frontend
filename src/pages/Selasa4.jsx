import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Selasa4 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbwtgCJbkqPpNONTTnA3DeoA0VRoNh5ITZnD7KDe2bMNJGdqxGopwDzvBFdcSRzKxWhe7Q/exec";
  const PAGE_TITLE = "Pemeliharaan Berkala Selasa 4";
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