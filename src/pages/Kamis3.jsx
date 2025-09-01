import React from 'react';
import JadwalPemkala from './jadwalPemkala';

const Kamis3 = () => {
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbzk2nwwbX6DPJtiq3QQuuvIS-Lvo8DZag1KuNx1wyWFEBmydfeiyhriLDy3EOMbBBxT/exec";
  const PAGE_TITLE = "Pemeliharaan Berkala Kamis 3";
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