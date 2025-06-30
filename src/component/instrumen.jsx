import React, { useState, useEffect, useMemo } from 'react';

const DaftarInstrumenPage = () => {
  const [instrumenData, setInstrumenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInstrumen, setSelectedInstrumen] = useState(null);
  // State baru untuk menyimpan kategori kode yang dipilih dari dropdown
  const [selectedKodeCategory, setSelectedKodeCategory] = useState('');
  // State baru untuk menyimpan daftar kategori unik untuk dropdown
  const [kodeCategoryOptions, setKodeCategoryOptions] = useState([]);

  // URL GOOGLE APPS SCRIPT API UNTUK SHEET 'INSTRUMEN' ANDA
  const INSTRUMEN_API_URL = "https://script.google.com/macros/s/AKfycbxNef3rBTV5D_i5XYgeYrh5WtMehkx0dxc_V-I1GVy_g2eoo0gjz9PxLT0aA5m8i2RSIg/exec";

  // Fungsi helper untuk mendapatkan kategori filter dari data instrumen
  // Ini akan menentukan opsi yang muncul di dropdown filter
  const getFilterCategory = (instrumen) => {
    const kode = instrumen.Kode;
    const noPeralatan = instrumen.NoPeralatan; // Tetap gunakan NoPeralatan sebagai kunci data

    // Logika untuk mencocokkan kategori yang Anda inginkan
    if (noPeralatan && noPeralatan.includes("AWOS")) return "AWOS";
    if (noPeralatan && (noPeralatan.includes("PC Display") || noPeralatan.includes("PC OBS") || noPeralatan.includes("PC AFTN") || noPeralatan.includes("PC FCT") || noPeralatan.includes("PC National Digital Forcasting") || noPeralatan.includes("PC Maritim"))) return "PC";
    
    // Fallback: ambil bagian pertama dari Kode sebelum underscore, atau seluruh Kode
    if (kode) {
      const parts = kode.split('_');
      return parts[0];
    }
    return 'Lain-lain'; // Kategori default jika tidak ada Kode
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(INSTRUMEN_API_URL);

        if (!response.ok) {
          throw new Error(
            `HTTP error! Status: ${response.status} - ${response.statusText}`
          );
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setInstrumenData(data);
          
          // Setelah data diambil, ekstrak kategori unik untuk dropdown filter
          const categories = new Set();
          data.forEach(instrumen => {
            const category = getFilterCategory(instrumen);
            if (category) {
              categories.add(category);
            }
          });
          setKodeCategoryOptions(Array.from(categories).sort()); // Urutkan kategori
        } else {
          throw new Error(
            "Invalid data format received from API. Expected an array."
          );
        }
      } catch (err) {
        console.error("Error fetching instrumen data:", err);
        setError(
          err.message ||
            "Gagal mengambil data instrumen. Silakan periksa koneksi atau API."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fungsi untuk menangani perubahan pada dropdown filter kategori
  const handleCategorySelectChange = (event) => {
    setSelectedKodeCategory(event.target.value);
    setSelectedInstrumen(null); // Reset detail instrumen saat filter berubah
  };

  // Gunakan useMemo untuk memfilter data hanya ketika instrumenData atau selectedKodeCategory berubah
  const filteredInstrumenData = useMemo(() => {
    if (!selectedKodeCategory) {
      return instrumenData; // Tampilkan semua jika tidak ada filter
    }
    return instrumenData.filter(instrumen => 
      getFilterCategory(instrumen) === selectedKodeCategory
    );
  }, [instrumenData, selectedKodeCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Memuat data instrumen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
            Pastikan URL Google Apps Script untuk instrumen benar, sudah di-deploy, dan
            sheet 'INSTRUMEN' ada serta berisi data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-center text-xl sm:text-2xl font-semibold mb-6 sm:mb-8">
        Daftar Peralatan Instrumen
      </h2>

      {/* Dropdown untuk memilih kategori instrumen */}
      <div className="mb-6 sm:mb-8 flex justify-center">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center gap-3 sm:gap-4 bg-white p-4 sm:p-6 shadow-md rounded-lg">
            <label className="font-medium text-sm sm:text-lg text-gray-700 text-center">
              Filter Berdasarkan Kategori Kode:
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              onChange={handleCategorySelectChange}
              value={selectedKodeCategory}
            >
              <option value="">-- Tampilkan Semua Kategori --</option>
              {kodeCategoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedInstrumen ? (
        // Detail instrumen yang dipilih
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 shadow-md mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Bagian Foto (placeholder) - Dihilangkan sesuai permintaan sebelumnya */}
            
            {/* Bagian Detail */}
            <div className="flex-1">
              {/* Perbaikan di sini: menampilkan NoPeralatan (Kode) */}
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-black mb-4 text-center lg:text-left">
                {selectedInstrumen.NoPeralatan} ({selectedInstrumen.Kode})
              </h3>
              <div className="grid grid-cols-1 gap-3 text-gray-700 text-sm sm:text-base">
                <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                  <span className="font-medium text-black">Kode Alat:</span> 
                  <span className="ml-2">{selectedInstrumen.Kode}</span>
                </div>
                <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                  <span className="font-medium text-black">Jenis Alat:</span> 
                  <span className="ml-2">{selectedInstrumen["Jenis Alat"]}</span>
                </div>
                <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                  <span className="font-medium text-black">Produsen:</span> 
                  <span className="ml-2">{selectedInstrumen.Produsen}</span>
                </div>
                <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                  <span className="font-medium text-black">Merk:</span> 
                  <span className="ml-2">{selectedInstrumen.Merk}</span>
                </div>
                <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                  <span className="font-medium text-black">Type:</span> 
                  <span className="ml-2">{selectedInstrumen.Type}</span>
                </div>
                <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                  <span className="font-medium text-black">S/N:</span> 
                  <span className="ml-2">{selectedInstrumen["S/N"]}</span>
                </div>
                <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                  <span className="font-medium text-black">Sejak:</span> 
                  <span className="ml-2">{selectedInstrumen.Sejak}</span>
                </div>
                <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                  <span className="font-medium text-black">Kalibrasi Terakhir:</span> 
                  <span className="ml-2">{selectedInstrumen["Kalibrasi Terakhir"]}</span>
                </div>
                <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                  <span className="font-medium text-black">Posisi:</span> 
                  <span className="ml-2">{selectedInstrumen.Posisi}</span>
                </div>
                <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                  <span className="font-medium text-black">Keterangan:</span> 
                  <span className="ml-2">{selectedInstrumen.Keterangan}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedInstrumen(null)}
                className="mt-6 w-full sm:w-auto px-6 py-3 bg-[#0066CC] text-white font-semibold rounded-lg shadow-md hover:bg-[#0066CC]/50 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm sm:text-base"
              >
                ← Kembali ke Daftar Instrumen
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Tabel daftar semua instrumen (atau yang difilter)
        <div className="flex justify-center">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[300px]">
                <thead>
                  <tr className="bg-[#0066CC] text-white">
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Kode</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Peralatan</th> {/* Diubah dari NoPeralatan */}
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Posisi</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInstrumenData.length === 0 ? (
                    <tr>
                      <td className="px-4 py-8 text-center text-gray-500 text-sm sm:text-base" colSpan="7">
                        <div className="flex flex-col items-center">
                          <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          Data instrumen tidak tersedia
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInstrumenData.map((instrumen, index) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedInstrumen(instrumen)}
                      >
                        <td className="px-4 py-3 text-left text-sm sm:text-base text-gray-600">{instrumen.Kode}</td>
                        <td className="px-4 py-3 text-left text-sm sm:text-base text-gray-900">{instrumen.Peralatan}</td> 
                        <td className="px-4 py-3 text-left text-sm sm:text-base text-gray-600">{instrumen.Posisi}</td>
                        <td className="px-4 py-3 text-left text-sm sm:text-base text-gray-600">{instrumen.Keterangan}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarInstrumenPage;
