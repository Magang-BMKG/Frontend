import React from 'react';
import { IoLocationOutline } from 'react-icons/io5';
import { FiPhone } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white p-4 md:p-8 text-center w-full">
      <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-2 gap-8 md:gap-20">
          {/* Kontak Kami */}
          <div id="kontak-section" className="text-left">
            <h3 className="text-[10px] md:text-xl font-bold mb-4 md:mb-6">KONTAK KAMI</h3>
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-start space-x-3">
                <IoLocationOutline className="w-4 h-4 md:w-5 md:h-5 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[7px] md:text-sm">
                    Jl. Marsma R. Iswahyudi No.3, Sepinggan, Kecamatan Balikpapan Selatan, 
                    Kota Balikpapan, Kalimantan Timur 76115
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FiPhone className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                <span className="text-[8px] md:text-sm">(0542) 764771</span>
              </div>
            </div>
          </div>

          {/* Tentang */}
          <div id="tentang-section" className="text-end">
            <h3 className="text-[10px] md:text-xl font-bold mb-4 md:mb-6">TENTANG</h3>
            <p className="text-[8px] md:text-sm leading-relaxed">
              Website resmi BMKG ini adalah sumber utama informasi akurat mengenai cuaca, 
              iklim dan gempabumi. Selain melayani publik, situs ini juga mendukung 
              transparansi dengan menampilkan profil tim kami serta menyajikan sistem 
              manajemen operasional internal.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
