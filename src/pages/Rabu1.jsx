import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Rabu1 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbzg0N0Wh5oBiECGl3SiJt9111ZWR5NcFZ8YNhXpzH9FDI4j2odYzM2Kfhcq2VKIBZwhHg/exec";
  const PAGE_TITLE = "Jadwal Rabu 1";
  const BACK_PATH = "/jadwal/rabu";

  return (
    <JadwalPemkala 
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Rabu1;