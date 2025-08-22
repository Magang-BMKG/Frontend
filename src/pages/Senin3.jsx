import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Senin3 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbz4lJ8U2g5yRlpwa5dWzHG-j51ca4ZYvIYv3E91JXQM5iQPK7lFZae04XxmlBsUA2vk/exec";
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