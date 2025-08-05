import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Kamis3 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbzg873lTS_UQ5wLEEn4CjMxAs5MnDAYxYnzXTKe33heyT1sFIwlqfoIuXSzYmzfFALqeg/exec";
  const PAGE_TITLE = "Jadwal Kamis 3";
  const BACK_PATH = "/jadwal/kamis";

  return (
    <JadwalPemkala 
      api_url={JADWAL_API_URL} 
      page_title={PAGE_TITLE} 
      back_path={BACK_PATH}
    />
  );
};

export default Kamis3;