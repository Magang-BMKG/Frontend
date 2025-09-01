import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Rabu4 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbzE0hrhD-SlsmJ2YLg3yjtMEi36rlPhZcrfrNZaBuxcbEopcaTvOvMJA91RkniADjcnHw/exec";
  const PAGE_TITLE = "Pemeliharaan Berkala Rabu 4";
  const BACK_PATH = "/jadwal/rabu";

  return (
    <JadwalPemkala 
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Rabu4;