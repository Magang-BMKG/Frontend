import React, { useState, useEffect, useMemo } from 'react';
import Header from './Header'; // Sesuaikan path dengan struktur folder Anda
import Sidebar from './Sidebar'; // Sesuaikan path dengan struktur folder Anda
import Footer from './Footer'; // Sesuaikan path dengan struktur folder Anda

const DaftarInstrumenPage = () => {
  const [instrumenData, setInstrumenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInstrumen, setSelectedInstrumen] = useState(null);
  const [selectedKodeCategory, setSelectedKodeCategory] = useState('');
  const [kodeCategoryOptions, setKodeCategoryOptions] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // URL GOOGLE APPS SCRIPT API UNTUK SHEET 'INSTRUMEN' ANDA
  const INSTRUMEN_API_URL = "https://script.google.com/macros/s/AKfycbxNef3rBTV5D_i5XYgeYrh5WtMehkx0dxc_V-I1GVy_g2eoo0gjz9PxLT0aA5m8i2RSIg/exec";

  // Fungsi helper untuk mendapatkan kategori filter dari data instrumen
  const getFilterCategory = (instrumen) => {
    const kode = instrumen.Kode;
    const noPeralatan = instrumen.NoPeralatan;

    if (noPeralatan && noPeralatan.includes("AWOS")) return "AWOS";
    if (noPeralatan && (noPeralatan.includes("PC Display") || noPeralatan.includes("PC OBS") || noPeralatan.includes("PC AFTN") || noPeralatan.includes("PC FCT") || noPeralatan.includes("PC National Digital Forcasting") || noPeralatan.includes("PC Maritim"))) return "PC";
    
    if (kode) {
      const parts = kode.split('_');
      return parts[0];
    }
    return 'Lain-lain';
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
          
          const categories = new Set();
          data.forEach(instrumen => {
            const category = getFilterCategory(instrumen);
            if (category) {
              categories.add(category);
            }
          });
          setKodeCategoryOptions(Array.from(categories).sort());
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

  const handleCategorySelectChange = (event) => {
    setSelectedKodeCategory(event.target.value);
    setSelectedInstrumen(null);
  };

  const filteredInstrumenData = useMemo(() => {
    if (!selectedKodeCategory) {
      return instrumenData;
    }
    return instrumenData.filter(instrumen => 
      getFilterCategory(instrumen) === selectedKodeCategory
    );
  }, [instrumenData, selectedKodeCategory]);

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

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <h2 className="text-center text-[18px] sm:text-2xl font-semibold mb-6 sm:mb-8">
            Daftar Peralatan Instrumen
          </h2>

           {/* Dropdown untuk memilih kategori instrumen */}
          <div className="mb-4 sm:mb-6 md:mb-8 flex justify-center px-2 sm:px-0">
            <div className="w-full max-w-sm sm:max-w-md">
              <div className="flex flex-col items-center gap-3 sm:gap-4  p-3 sm:p-4 md:p-6 shadow-md rounded-lg">
                <label className="font-medium text-[12px] sm:text-base md:text-lg text-gray-700 text-center leading-relaxed">
                  Filter Berdasarkan Kategori Kode:
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 p-2.5 sm:p-3 text-[10px] sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                <div className="flex-1">
                  <h3 className="text-[10px] sm:text-xl lg:text-2xl font-semibold text-black mb-4 text-center lg:text-left">
                    {selectedInstrumen.NoPeralatan} ({selectedInstrumen.Kode})
                  </h3>
                  <div className="grid grid-cols-1 gap-3 text-gray-700 text-[10px] sm:text-base">
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
                    className="mt-6 w-full sm:w-auto px-6 py-3 bg-[#0066CC] text-white font-semibold rounded-lg shadow-md hover:bg-[#0066CC]/50 
                    transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-[10px] sm:text-base"
                  >
                    ← Kembali ke Daftar Instrumen
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Tabel/Card daftar semua instrumen (atau yang difilter)
            <div className="flex justify-center px-2 sm:px-0">
              {/* Desktop Table View */}
              <div className="hidden md:block w-full max-w-6xl bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#0066CC] text-white">
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Kode</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Peralatan</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Posisi</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredInstrumenData.length === 0 ? (
                        <tr>
                          <td className="px-4 py-8 text-center text-gray-500 text-base" colSpan="4">
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
                            <td className="px-4 py-3 text-left text-sm text-gray-600 break-all">{instrumen.Kode}</td>
                            <td className="px-4 py-3 text-left text-sm text-gray-900 break-words">{instrumen.Peralatan}</td> 
                            <td className="px-4 py-3 text-left text-sm text-gray-600 break-words">{instrumen.Posisi}</td>
                            <td className="px-4 py-3 text-left text-sm text-gray-600 break-words max-w-xs truncate" title={instrumen.Keterangan}>{instrumen.Keterangan}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden w-full max-w-sm">
                {filteredInstrumenData.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-500 text-sm">Data instrumen tidak tersedia</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredInstrumenData.map((instrumen, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg shadow-md p-3 cursor-pointer hover:shadow-lg transition-shadow duration-200 border border-gray-100"
                        onClick={() => setSelectedInstrumen(instrumen)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-gray-900 text-sm leading-tight break-words flex-1 mr-2">
                              {instrumen.Peralatan}
                            </h3>
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex">
                              <span className="font-medium min-w-[50px]">Kode:</span>
                              <span className="break-all">{instrumen.Kode}</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium min-w-[50px]">Posisi:</span>
                              <span className="break-words">{instrumen.Posisi}</span>
                            </div>
                            {instrumen.Keterangan && (
                              <div className="flex">
                                <span className="font-medium min-w-[50px]">Ket:</span>
                                <span className="break-words line-clamp-2">{instrumen.Keterangan}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DaftarInstrumenPage;