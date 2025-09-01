import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Senin2 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbyy6zg9U5QfNl82W8P8lxFUCKZBSZUyejOwTV1EYxG0-MxR8XXuCec6Pou5o2HQa3H7rw/exec";
  const PAGE_TITLE = "Pemeliharaan Berkala Senin 2";
  const BACK_PATH = "/jadwal/senin";

  return (
    <JadwalPemkala
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Senin2;