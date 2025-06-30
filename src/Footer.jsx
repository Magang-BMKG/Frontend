import React from 'react';

function Footer() {
  return (
    <footer className="bg-[#003366] text-white py-8 px-4 sm:px-10 font-roboto shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">

        {/* Bagian Kontak Kami */}
        <div className="flex flex-col items-start md:w-1/2 lg:w-2/5">
          <h3 className="text-xl font-semibold mb-4 whitespace-nowrap">KONTAK KAMI</h3>
          
          {/* Alamat */}
          <div className="flex items-start gap-3 mb-4">
            {/* Lokasi Icon (Inline SVG) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 flex-shrink-0"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
            </svg>
            <p className="text-base font-normal">
              Jl. Marsma R. Iswahyudi No.3, Sepinggan, Kecamatan Balikpapan Selatan, Kota Balikpapan, Kalimantan Timur 76115
            </p>
          </div>

          {/* Telepon */}
          <div className="flex items-center gap-3">
            {/* Telepon Icon (Inline SVG) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 flex-shrink-0"
            >
              <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.12-.74-.03-1.01.24l-2.44 2.44c-3.17-1.57-5.83-4.23-7.4-7.4l2.44-2.44c.27-.27.36-.66.24-1.01C8.75 4.95 8.5 3.75 8.5 2.5c0-.55-.45-1-1-1H4.5c-.55 0-1 .45-1 1C3.5 12.04 11.96 20.5 21.5 20.5c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1z" />
            </svg>
            <p className="text-base font-normal">(0542) 764771</p>
          </div>
        </div>

        {/* Bagian Tentang */}
        <div className="flex flex-col items-start md:items-end text-left md:text-right md:w-1/2 lg:w-2/5">
          <h3 className="text-xl font-semibold mb-4 whitespace-nowrap">TENTANG</h3>
          <p className="text-base font-normal">
            Website resmi BMKG ini adalah sumber utama informasi akurat mengenai cuaca, iklim, dan gempabumi. Selain melayani publik, situs ini juga mendukung transparansi dengan menampilkan profil tim kami serta menunjang sistem manajemen operasional internal.
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
