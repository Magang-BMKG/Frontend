import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Insidental1 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbwC7vzGxPU_zOSFzAlhuvQzneJiCp4gtwf7wW7X-Nk7-gdRIhdBTWQ7vKJW6ZQOWvedkA/exec";
  const PAGE_TITLE = "Pemeliharaan Berkala Insidental 1";
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