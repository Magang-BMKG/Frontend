import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Rabu1 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbz8pirEAERXNQjwOAu7K6mIYa0FnfF1Dflx7TnPCKRjw_fzQ9gwEjJB7p8DWGN1KzHz1w/exec";
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