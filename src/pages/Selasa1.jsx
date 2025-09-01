import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Selasa1 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbxA-VdwTplcTopm6JYGdaiJll7iUknI_2yGm8ANYM9TgWSbkx9NH94fz_oeAVU4Wp7aTw/exec";
  const PAGE_TITLE = "Pemeliharaan Berkala Selasa 1";
  const BACK_PATH = "/jadwal/selasa";

  return (
    <JadwalPemkala 
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Selasa1;