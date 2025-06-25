import React, { useState, useEffect } from "react";
import user from "../assets/user.png"; // Gambar default untuk pegawai
import Header from "./Header";
import Footer from "./Footer";

function App() {
  const [pegawaiData, setPegawaiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPegawai, setSelectedPegawai] = useState(null); // State untuk pegawai yang dipilih

  // URL GOOGLE APPS SCRIPT Anda
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
  }, []); // Dependensi kosong agar useEffect hanya berjalan sekali saat mount

  // Fungsi untuk menangani perubahan pada dropdown
  const handleSelectChange = (event) => {
    const selectedNIP = event.target.value;
    if (selectedNIP === "") {
      setSelectedPegawai(null); // Reset jika "Pilih Nama Pegawai" dipilih
    } else {
      // Cari pegawai berdasarkan NIP yang unik
      const foundPegawai = pegawaiData.find(
        (pegawai) => pegawai.NIP === selectedNIP
      );
      setSelectedPegawai(foundPegawai);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-roboto">
      <Header />
      <div className="p-4 sm:p-6 md:p-8">
        {/* Tailwind CSS sekarang diasumsikan diimpor melalui build process Anda, bukan CDN */}

        <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Profil Teknisi
          </h1>

          {/* Dropdown untuk memilih nama pegawai */}
          <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <label
              htmlFor="select-pegawai"
              className="text-lg font-medium text-gray-700"
            >
              Pilih Teknisi:
            </label>
            <select
              id="select-pegawai"
              onChange={handleSelectChange}
              value={selectedPegawai ? selectedPegawai.NIP : ""} // Set nilai dropdown
              className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-auto text-base text-gray-900"
            >
              <option value="">-- Tampilkan Semua Teknisi --</option>
              {pegawaiData.map((pegawai) => (
                <option key={pegawai.NIP} value={pegawai.NIP}>
                  {pegawai.NAMA}
                </option>
              ))}
            </select>
          </div>

          {/* Kondisional rendering: Tampilkan detail pegawai atau seluruh tabel */}
          {loading ? (
            // Tampilan loading saat data sedang diambil
            <div className="flex items-center justify-center min-h-[300px] bg-gray-50 rounded-lg">
              <p className="text-lg text-gray-700">Memuat data...</p>
            </div>
          ) : error ? (
            // Tampilan error jika ada masalah saat mengambil data
            <div className="flex flex-col items-center justify-center min-h-[300px] bg-red-100 p-4 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-red-700 mb-2">
                Terjadi Kesalahan!
              </h2>
              <p className="text-red-600 mb-4 text-center">{error}</p>
              <p className="text-red-500 text-sm text-center">
                Pastikan URL Google Apps Script Anda benar, sudah di-deploy, dan
                sheet 'TEKNISI' ada serta berisi data.
              </p>
            </div>
          ) : selectedPegawai ? (
            // Tampilan Detail Pegawai yang Dipilih: Detail di kiri, tempat untuk gambar di kanan
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-md mb-8 flex flex-col md:flex-row gap-6">
              {/* Bagian Kanan: Tempat untuk Gambar */}
              <div className="flex-1 flex items-center justify-center bg-gray-200 rounded-lg p-4">
                {selectedPegawai.FotoURL ? (
                  <img
                    src={selectedPegawai.FotoURL}
                    alt={selectedPegawai.NAMA}
                    className="max-w-full h-auto rounded-lg" // Mengubah max-w-[262px] menjadi max-w-full untuk responsivitas yang lebih baik
                    onError={(e) => {
                      // Penanganan error jika gambar tidak bisa dimuat
                      e.target.onerror = null; // Menghindari loop tak terbatas jika fallback juga gagal
                      e.target.src =
                        "https://placehold.co/262x262/E2E8F0/64748B?text=Tidak+Ada+Foto"; // Placeholder
                    }}
                  />
                ) : (
                  <img
                    src={user}
                    alt="Default User"
                    className="max-w-full h-auto rounded-lg"
                  />
                )}
              </div>
              {/* Bagian Kiri: Detail Pegawai */}
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-blue-800 mb-4 text-center md:text-left">
                  Nama Teknisi: {selectedPegawai.NAMA}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                  <div className="detail-item">
                    <span className="font-medium">NIP:</span>{" "}
                    {selectedPegawai.NIP}
                  </div>
                  {/* Pangkat / Gol. - Tambahkan col-span-full */}
                  <div className="detail-item col-span-full">
                    <span className="font-medium">Pangkat / Gol.:</span>{" "}
                    {selectedPegawai["PANGKAT / GOL"]}
                  </div>
                  <div className="detail-item">
                    <span className="font-medium">Fungsional:</span>{" "}
                    {selectedPegawai.FUNGSIONAL}
                  </div>
                  {/* Pendidikan Terakhir - Tambahkan col-span-full */}
                  <div className="detail-item col-span-full">
                    <span className="font-medium">Pendidikan Terakhir:</span>{" "}
                    {selectedPegawai["PENDIDIKAN TERAKHIR"]}
                  </div>
                  <div className="detail-item col-span-full">
                    <span className="font-medium">
                      Diklat/Workshop/Temu Teknisi:
                    </span>{" "}
                    {selectedPegawai["DIKLAT/WORKSHOP/TEMU TEKNISI"]}
                  </div>
                  <div className="detail-item">
                    <span className="font-medium">Tugas:</span>{" "}
                    {selectedPegawai.TUGAS}
                  </div>
                  {/* Keterangan Tambahan - Tambahkan col-span-full */}
                  <div className="detail-item col-span-full">
                    <span className="font-medium">Keterangan:</span>{" "}
                    {selectedPegawai.KETERANGAN}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPegawai(null)}
                  className="mt-6 w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Lihat Semua Pegawai
                </button>
              </div>
            </div>
          ) : // Tampilan Seluruh Tabel Pegawai
          pegawaiData.length === 0 ? (
            <p className="text-center text-gray-600 mt-4">
              Tidak ada data pegawai yang ditemukan.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Nama
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      NIP
                    </th>
                    {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pangkat / Gol.</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fungsional</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendidikan Terakhir</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diklat/Workshop/Temu Teknis</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tugas</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th> */}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pegawaiData.map((pegawai, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {pegawai.NAMA}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pegawai.NIP}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pegawai["PANGKAT / GOL"]}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pegawai.FUNGSIONAL}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pegawai["PENDIDIKAN TERAKHIR"]}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pegawai["DIKLAT/WORKSHOP/TEMU TEKNISI"]}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pegawai.TUGAS}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pegawai.KETERANGAN}</td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
