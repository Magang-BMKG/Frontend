import React, { useState, useEffect } from 'react';
import Header from "./header";
import Sidebar from "./sidebar";
import Footer from "./footer";

const DaftarTeknisiPage = () => {
  const [pegawaiData, setPegawaiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPegawai, setSelectedPegawai] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // URL GOOGLE APPS SCRIPT
  const GOOGLE_SHEETS_API_URL =
    "https://script.google.com/macros/s/AKfycbyh_29hV_oZowU-BgPIcsQ8bEn3l1YZALYwnPWMsSKjpVFEjcUcQCRRGwPN_A4y2PAAwg/exec";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(GOOGLE_SHEETS_API_URL);

        if (!response.ok) {
          throw new Error(
            `HTTP error! Status: ${response.status} - ${response.statusText}`
          );
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setPegawaiData(data);
        } else {
          throw new Error(
            "Invalid data format received from API. Expected an array."
          );
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err.message ||
            "Gagal mengambil data. Silakan periksa koneksi atau API."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fungsi untuk menangani perubahan pada dropdown
  const handleSelectChange = (event) => {
    const selectedNIP = event.target.value;
    if (selectedNIP === "") {
      setSelectedPegawai(null);
    } else {
      const foundPegawai = pegawaiData.find(
        (pegawai) => pegawai.NIP === selectedNIP
      );
      setSelectedPegawai(foundPegawai);
    }
  };

  // Toggle sidebar untuk mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Mobile Menu Button */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-2">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 relative">
        {/* Sidebar - Hidden on mobile, overlay when open */}
        <div className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static absolute inset-y-0 left-0 z-50 
          transform transition-transform duration-300 ease-in-out
        `}>
          <Sidebar />
        </div>

        {/* Overlay untuk mobile ketika sidebar terbuka */}
        {isSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 bg-opacity-50 z-40"
            onClick={toggleSidebar}
          ></div>
        )}

        <main className="flex-1 p-4 sm:p-6 overflow-x-auto">
          <h2 className="text-center text-xl sm:text-2xl font-semibold mb-6 sm:mb-8">
            Daftar Teknisi
          </h2>
          
          {/* Dropdown untuk memilih teknisi - Centered */}
          <div className="mb-6 sm:mb-8 flex justify-center">
            <div className="w-full max-w-md">
              <div className="flex flex-col items-center gap-3 sm:gap-4 bg-white p-4 sm:p-6 shadow-m">
                <label className="font-medium text-sm sm:text-lg text-gray-700 text-center">
                  Pilih Teknisi
                </label>
                <select 
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  onChange={handleSelectChange}
                  value={selectedPegawai ? selectedPegawai.NIP : ""}
                >
                  <option value="">-- Pilih teknisi yang ingin dilihat --</option>
                  {pegawaiData.map((pegawai) => (
                    <option key={pegawai.NIP} value={pegawai.NIP}>
                      {pegawai.NAMA}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Kondisional rendering berdasarkan state */}
          {loading ? (
            // Loading state
            <div className="flex items-center justify-center min-h-[300px] bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg text-gray-700">Memuat data...</p>
              </div>
            </div>
          ) : error ? (
            // Error state
            <div className="flex flex-col items-center justify-center min-h-[300px] bg-red-50 p-4 rounded-lg shadow-lg border border-red-200">
              <div className="text-center max-w-md">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.598 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-red-700 mb-2">
                  Terjadi Kesalahan!
                </h2>
                <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
                <p className="text-red-500 text-xs sm:text-sm">
                  Pastikan URL Google Apps Script Anda benar, sudah di-deploy, dan
                  sheet 'TEKNISI' ada serta berisi data.
                </p>
              </div>
            </div>
          ) : selectedPegawai ? (
            // Detail pegawai yang dipilih
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 shadow-md mb-8">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Bagian Foto */}
                <div className="flex-1 flex items-center justify-center bg-gray-200 rounded-lg p-4">
                  {selectedPegawai.FotoURL ? (
                    <img
                      src={selectedPegawai.FotoURL}
                      alt={selectedPegawai.NAMA}
                      className="max-w-full h-auto rounded-lg max-h-80"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-64 bg-gray-300 rounded-lg">
                      <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Bagian Detail */}
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-black mb-4 text-center lg:text-left">
                    {selectedPegawai.NAMA}
                  </h3>
                  <div className="grid grid-cols-1 gap-3 text-gray-700 text-sm sm:text-base">
                    <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                      <span className="font-medium text-black">NIP:</span> 
                      <span className="ml-2">{selectedPegawai.NIP}</span>
                    </div>
                    <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                      <span className="font-medium text-black">Pangkat / Gol.:</span> 
                      <span className="ml-2">{selectedPegawai["PANGKAT / GOL"]}</span>
                    </div>
                    <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                      <span className="font-medium text-black">Fungsional:</span> 
                      <span className="ml-2">{selectedPegawai.FUNGSIONAL}</span>
                    </div>
                    <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                      <span className="font-medium text-black">Pendidikan Terakhir:</span> 
                      <span className="ml-2">{selectedPegawai["PENDIDIKAN TERAKHIR"]}</span>
                    </div>
                    <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                      <span className="font-medium text-black">Diklat/Workshop/Temu Teknisi:</span> 
                      <span className="ml-2">{selectedPegawai["DIKLAT/WORKSHOP/TEMU TEKNISI"]}</span>
                    </div>
                    <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                      <span className="font-medium text-black">Tugas:</span> 
                      <span className="ml-2">{selectedPegawai.TUGAS}</span>
                    </div>
                    <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                      <span className="font-medium text-black">Keterangan:</span> 
                      <span className="ml-2">{selectedPegawai.KETERANGAN}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPegawai(null)}
                    className="mt-6 w-full sm:w-auto px-6 py-3 bg-[#0066CC] text-white font-semibold rounded-lg shadow-md hover:bg-[#0066CC]/50 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm sm:text-base"
                  >
                    ← Kembali ke Daftar Teknisi
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Tabel daftar semua teknisi
            <div className="flex justify-center">
              <div className="w-full max-w-4xl bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[300px]">
                    <thead>
                      <tr className="bg-[#0066CC] text-white">
                        <th className="px-4 py-3 text-center text-sm sm:text-base font-semibold">Nama Teknisi</th>
                        <th className="px-4 py-3 text-center text-sm sm:text-base font-semibold">NIP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pegawaiData.length === 0 ? (
                        <tr>
                          <td className="px-4 py-8 text-center text-gray-500 text-sm sm:text-base" colSpan="2">
                            <div className="flex flex-col items-center">
                              <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                              </svg>
                              Data tidak tersedia
                            </div>
                          </td>
                        </tr>
                      ) : (
                        pegawaiData.map((pegawai, index) => (
                          <tr 
                            key={index} 
                            className="hover:bg-blue-50 transition-colors cursor-pointer"
                            onClick={() => setSelectedPegawai(pegawai)}
                          >
                            <td className="px-4 py-3 text-left text-sm sm:text-base text-gray-900">
                              {pegawai.NAMA}
                            </td>
                            <td className="px-4 py-3 text-center text-sm sm:text-base text-gray-600">
                              {pegawai.NIP}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DaftarTeknisiPage;