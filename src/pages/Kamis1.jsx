import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Kamis1 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbwG_ReuK7BuMQS7oJnR0pkcxrxLqra0jien_ukCmKo2EOdbI2Bp_Jrg3XTheAd4bl9Q2g/exec";
  const PAGE_TITLE = "Jadwal Kamis 1";
  const BACK_PATH = "/jadwal/kamis";

  return (
    <JadwalPemkala 
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Kamis1;