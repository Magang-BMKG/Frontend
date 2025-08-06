import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Selasa3 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbxr7tvfYe30YYmJUqt4cOq6ZFprYcDi8t2TvdD-oOKg1xPGKOXmhgQKFHUWWD2xMbKt/exec";
  const PAGE_TITLE = "Jadwal Selasa 3";
  const BACK_PATH = "/jadwal/selasa";

  return (
    <JadwalPemkala 
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Selasa3;