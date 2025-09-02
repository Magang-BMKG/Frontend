import React, { useState, useEffect } from 'react';

const App = () => {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx8WTol0Tc6hNWYjV-xRzvUYqdcgpJaJr5dc2_KP8OW7eEnseJuaeOHDahji-kjHRZudw/exec';

  // State untuk data dan UI
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    Nama: '',
    Tanggal: '',
    Peralatan: '',
    Status: '',
    Keterangan: '',
  });
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // State untuk mengontrol visibilitas modal

  // Fungsi untuk mengambil data dari Google Sheet
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'GET',
        mode: 'cors',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.records) {
        setRecords(data.records);
      } else {
        setRecords([]);
      }
    } catch (err) {
      setError('Gagal mengambil data. Pastikan URL skrip sudah benar dan deployment sudah diizinkan.');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Mengambil data saat komponen pertama kali dimuat
  useEffect(() => {
    fetchData();
  }, []);

  // Menangani perubahan input form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: value,
    }));
  };

  // Menangani pengiriman form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Validasi sederhana
    const requiredFields = ['Nama', 'Tanggal', 'Peralatan', 'Status', 'Keterangan'];
    const isFormValid = requiredFields.every(field => form[field].trim() !== '');

    if (!isFormValid) {
      setMessage('Semua kolom wajib diisi.');
      return;
    }
    
    // Periksa format tanggal
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(form.Tanggal)) {
      setMessage('Format Tanggal tidak valid. Gunakan format DD/MM/YYYY.');
      return;
    }

    try {
      const response = await fetch(SCRIPT_URL, {
        redirect: 'follow',
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setMessage('Data berhasil ditambahkan!');
        setForm({
          Nama: '',
          Tanggal: '',
          Peralatan: '',
          Status: '',
          Keterangan: '',
        });
        fetchData(); // Muat ulang data setelah berhasil dikirim
        setIsModalOpen(false); // Tutup modal setelah sukses
      } else {
        setMessage(`Error: ${result.message}`);
      }
    } catch (err) {
      setMessage('Gagal mengirim data. Periksa koneksi atau URL skrip.');
      console.error('Submit error:', err);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setMessage('');
    setForm({
      Nama: '',
      Tanggal: '',
      Peralatan: '',
      Status: '',
      Keterangan: '',
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans p-4 md:p-8 flex flex-col items-center">
      {/* Konfigurasi Tailwind CSS - JANGAN DIUBAH */}
      <script src="https://cdn.tailwindcss.com"></script>

      {/* Bagian utama aplikasi */}
      <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Data Laporan</h1>
        
        {/* Tombol untuk membuka pop-up */}
        <div className="flex justify-end mb-6">
          <button
            onClick={openModal}
            className="bg-green-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-700 transition duration-200 shadow-lg flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Buat Laporan
          </button>
        </div>

        <hr className="my-8 border-gray-300" />
        
        {/* Tampilan Data */}       
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {isLoading ? (
          <div className="flex justify-center items-center">
            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-600">Memuat data...</span>
          </div>
        ) : records.length > 0 ? (
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nama</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Peralatan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Keterangan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{record.Nama}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{record.Tanggal}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{record.Peralatan}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${record.Status === 'Berfungsi Normal' || record.Status === 'OK' ? 'bg-green-100 text-green-800' :
                          record.Status === 'Rusak' || record.Status === 'Tidak Beroperasi' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'}`}>
                        {record.Status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">{record.Keterangan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-8">Tidak ada data yang ditemukan. Mulailah dengan menambahkan data di atas.</p>
        )}
      </div>

      {/* Modal Pop-up untuk formulir */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Buat Laporan Baru</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-800 transition duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Formulir Input di dalam modal */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label htmlFor="Nama" className="text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input
                    type="text"
                    id="Nama"
                    name="Nama"
                    value={form.Nama}
                    onChange={handleFormChange}
                    placeholder="Masukkan nama Anda"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="Tanggal" className="text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                  <input
                    type="text"
                    id="Tanggal"
                    name="Tanggal"
                    value={form.Tanggal}
                    onChange={handleFormChange}
                    placeholder="DD/MM/YYYY"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="Peralatan" className="text-sm font-medium text-gray-700 mb-1">Peralatan</label>
                  <input
                    type="text"
                    id="Peralatan"
                    name="Peralatan"
                    value={form.Peralatan}
                    onChange={handleFormChange}
                    placeholder="Misalnya: Radar, Komputer"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="Status" className="text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    id="Status"
                    name="Status"
                    value={form.Status}
                    onChange={handleFormChange}
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    required
                  >
                    <option value="">-- Pilih Status --</option>
                    <option value="OK">OK</option>
                    <option value="Rusak">Rusak</option>
                    <option value="Perbaikan">Perbaikan</option>
                    <option value="Tidak Beroperasi">Tidak Beroperasi</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col">
                <label htmlFor="Keterangan" className="text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                <textarea
                  id="Keterangan"
                  name="Keterangan"
                  value={form.Keterangan}
                  onChange={handleFormChange}
                  placeholder="Masukkan keterangan tambahan di sini..."
                  rows="3"
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  required
                ></textarea>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full md:w-1/2 bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition duration-200 shadow-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full md:w-1/2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 shadow-lg"
                >
                  Kirim Laporan
                </button>
              </div>
              
              {message && (
                <p className="mt-4 text-center font-medium" style={{ color: message.startsWith('Error') ? 'red' : 'green' }}>
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
