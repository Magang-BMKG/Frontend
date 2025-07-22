import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom"; 
import Header from "../component/Header";
import Sidebar from "../component/sidebar"; 
import Footer from "../component/Footer";
import Swal from 'sweetalert2';

const LogbookPagiPage = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const [logbookData, setLogbookData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPersonDateEntry, setSelectedPersonDateEntry] = useState(null);
  const [filterPeralatanDetail, setFilterPeralatanDetail] = useState("");

  // States untuk modal Tambah
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPeralatan, setNewPeralatan] = useState("");
  const [newKeterangan, setNewKeterangan] = useState("");

  // States untuk modal Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editedPeralatan, setEditedPeralatan] = useState("");
  const [editedKeterangan, setEditedKeterangan] = useState("");

  // GANTI DENGAN URL GOOGLE APPS SCRIPT API UNTUK SHEET 'LOGBOOK_PAGI_NORMALISASI' ANDA
  const LOGBOOK_API_URL =
    "https://script.google.com/macros/s/AKfycbz8cWrZ2JrXXS9amA9KCehWMWP3Hc8m5fn67qYhSJVD_OcGydPQNR0Fl3dL3PDiZVTBvg/exec";

  // Fungsi untuk mengambil data dari API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(LOGBOOK_API_URL);
      if (!response.ok) {
        throw new Error(
          `HTTP error! Status: ${response.status} - ${response.statusText}`
        );
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setLogbookData(data);
        const initialStatuses = {};
        data.forEach((item) => {
          const key = `${item.Peralatan}_${item["Penanggung Jawab"]}_${item.Tanggal}`;
          initialStatuses[key] = item.Keterangan;
        });
      } else {
        throw new Error(
          "Invalid data format received from API. Expected an array."
        );
      }
    } catch (err) {
      console.error("Error fetching logbook data:", err);
      setError(
        err.message ||
          "Gagal mengambil data logbook. Silakan periksa koneksi atau API."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fungsi untuk mengirim permintaan POST ke Apps Script
  const sendApiRequest = async (action, payload) => {
    try {
      const response = await fetch(LOGBOOK_API_URL, {
        redirect: "follow",
        method: "POST",
        body: JSON.stringify({ action, ...payload }),
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Operation failed on server.");
      }
      return result;
    } catch (err) {
      console.error("API request error:", err);
      throw err;
    }
  };

const handleBackToSummary = () => {
  // Clear filter first
  setFilterPeralatanDetail("");
  
  // Then clear selected entry
  setSelectedPersonDateEntry(null);
  
  // Finally navigate back
  handleBack();
};

const handleBackToLogbook = () => {
  console.log('Navigating back to /logbook'); // Debug log
  navigate("/logbook"); // Navigate to logbook page
};

  // Handler untuk Tambah Data
  const handleAddEntry = async () => {
    if (!newPeralatan || !newKeterangan || !selectedPersonDateEntry) {
      Swal.fire('Peringatan', 'Nama Peralatan dan Keterangan harus diisi.', 'warning');
      return;
    }
    try {
      await sendApiRequest("add", {
        Peralatan: newPeralatan,
        Keterangan: newKeterangan,
        "Penanggung Jawab": selectedPersonDateEntry.person,
        Tanggal: selectedPersonDateEntry.date,
      });
      Swal.fire('Berhasil!', 'Data berhasil ditambahkan/diperbarui!', 'success');
      setShowAddModal(false);
      setNewPeralatan("");
      setNewKeterangan("");
      fetchData();
    } catch (err) {
      Swal.fire('Gagal!', `Gagal menambahkan data: ${err.message}`, 'error');
    }
  };

  // Handler untuk Edit Data
  const handleEditClick = (item) => {
    setEditingItem(item);
    setEditedPeralatan(item.Peralatan);
    setEditedKeterangan(item.Keterangan);
    setShowEditModal(true);
  };

  const handleEditEntry = async () => {
    if (!editingItem || !editedPeralatan || !editedKeterangan) {
      Swal.fire('Peringatan', 'Nama Peralatan dan Keterangan harus diisi.', 'warning');
      return;
    }
    try {
      await sendApiRequest("edit", {
        originalPeralatan: editingItem.Peralatan,
        originalPenanggungJawab: editingItem["Penanggung Jawab"],
        originalTanggal: editingItem.Tanggal,
        Peralatan: editedPeralatan,
        Keterangan: editedKeterangan,
      });
      Swal.fire('Berhasil!', 'Data berhasil diubah!', 'success');
      setShowEditModal(false);
      setEditingItem(null);
      setEditedPeralatan("");
      setEditedKeterangan("");
      fetchData();
    } catch (err) {
      Swal.fire('Gagal!', `Gagal mengubah data: ${err.message}`, 'error');
    }
  };

  // Handler untuk Hapus Data
  const handleDeleteClick = (item) => {
  deleteEntry(item); // Tambahkan baris ini!
};

const deleteEntry = async (item) => {
  Swal.fire({
    title: 'Konfirmasi Hapus',
    text: `Anda yakin ingin menghapus entri untuk Peralatan: ${item.Peralatan} pada Tanggal: ${item.Tanggal}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await sendApiRequest("delete", {
          Peralatan: item.Peralatan,
          "Penanggung Jawab": item["Penanggung Jawab"],
          Tanggal: item.Tanggal,
        });
        Swal.fire('Berhasil!', 'Data berhasil dihapus!', 'success');
        fetchData();
      } catch (err) {
        Swal.fire('Gagal!', `Gagal menghapus data: ${err.message}`, 'error');
      }
    }
  });
};

  // Opsi status yang tersedia untuk dropdown
  const statusOptions = ["OK", "Rusak", "Perbaikan", "Tidak Beroperasi"];

  // Fungsi helper untuk mengurai tanggal D/M/YYYY menjadi format yang bisa dibandingkan
  const parseDateForSort = (dateStr) => {
    if (!dateStr) return 0;
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      return year * 10000 + month * 100 + day;
    }
    return 0;
  };

  // Mengambil daftar kombinasi unik (Penanggung Jawab, Tanggal)
  const uniquePersonDateCombinations = useMemo(() => {
    const combinations = new Set();
    logbookData.forEach((item) => {
      if (item["Penanggung Jawab"] && item.Tanggal) {
        combinations.add(
          JSON.stringify({
            person: item["Penanggung Jawab"],
            date: item.Tanggal,
          })
        );
      }
    });
    return Array.from(combinations)
      .map((str) => JSON.parse(str))
      .sort((a, b) => {
        const dateComparison =
          parseDateForSort(a.date) - parseDateForSort(b.date);
        if (dateComparison !== 0) {
          return dateComparison;
        }
        return a.person.localeCompare(b.person);
      });
  }, [logbookData]);

  // Data yang akan ditampilkan di tabel detail
  const detailTableData = useMemo(() => {
    if (!selectedPersonDateEntry) return [];

    let filtered = logbookData.filter(
      (item) =>
        item.Tanggal === selectedPersonDateEntry.date &&
        item["Penanggung Jawab"] === selectedPersonDateEntry.person
    );

    if (filterPeralatanDetail) {
      filtered = filtered.filter(
        (item) =>
          item.Peralatan &&
          item.Peralatan.toLowerCase().includes(
            filterPeralatanDetail.toLowerCase()
          )
      );
    }

    return filtered;
  }, [logbookData, selectedPersonDateEntry, filterPeralatanDetail]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Memuat logbook...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4">
        <div className="text-center max-w-lg mx-auto">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.598 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-red-700 mb-2">
            Terjadi Kesalahan!
          </h2>
          <p className="text-red-600 mb-4 text-sm md:text-base">{error}</p>
          <p className="text-red-500 text-xs md:text-sm">
            Pastikan URL Google Apps Script untuk logbook benar, sudah
            di-deploy, dan sheet 'LOGBOOK_PAGI_NORMALISASI' ada serta berisi
            data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Mobile Menu Button */}
      <div className="xl:hidden bg-white border-b border-gray-200 px-4 py-3">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <div
          className={`
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          xl:translate-x-0 xl:static absolute inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          w-64 flex-shrink-0
        `}
        >
          <Sidebar />
        </div>

        {/* Overlay untuk mobile/tablet ketika sidebar terbuka */}
        {isSidebarOpen && (
          <div
            className="xl:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 w-full min-w-0 p-4 md:p-6 xl:p-8 max-w-full">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={selectedPersonDateEntry ? handleBackToSummary : handleBackToLogbook}
              className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {selectedPersonDateEntry ? "Kembali ke Ringkasan Log Book" : "Kembali ke Log Book"}
            </button>

            <h2 className="text-center text-[15px] md:text-2xl xl:text-3xl font-semibold mb-6 md:mb-8">
              Log Book Pagi
            </h2>

            {uniquePersonDateCombinations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 text-sm md:text-base">
                  Tidak ada data logbook yang ditemukan.
                </p>
              </div>
            ) : selectedPersonDateEntry ? (
              // Tampilan Tabel Detail
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 md:p-6">
                  <h3 className="text-[13px] md:text-xl font-semibold text-gray-800 mb-4">
                    Detail Log Book untuk {selectedPersonDateEntry.person} pada{" "}
                    {selectedPersonDateEntry.date}
                  </h3>

                  {/* Input pencarian dan tombol tambah */}
                  <div className="mb-4 flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Cari peralatan..."
                      className="flex-1 p-2 md:p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                      value={filterPeralatanDetail}
                      onChange={(e) => setFilterPeralatanDetail(e.target.value)}
                    />
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="px-4 py-2 md:px-6 md:py-3 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition-colors text-sm md:text-base whitespace-nowrap"
                    >
                      Tambah
                    </button>
                  </div>

                  {/* Tabel dengan scroll horizontal */}
                  <div className="overflow-x-auto -mx-4 md:-mx-6">
                    <div className="inline-block min-w-full px-4 md:px-6">
                      <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 md:px-6 py-3 text-left text-[10px] sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Peralatan
                              </th>
                              <th className="px-3 md:px-6 py-3 text-left text-[10px] sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Keterangan
                              </th>
                              <th className="px-3 md:px-6 py-3 text-center text-[10px] sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Aksi
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {detailTableData.length === 0 ? (
                              <tr>
                                <td colSpan="3" className="px-3 md:px-6 py-4 text-center text-sm text-gray-500">
                                  Tidak ada Peralatan yang cocok dengan pencarian.
                                </td>
                              </tr>
                            ) : (
                              detailTableData.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-3 md:px-6 py-4 text-[10px] sm:text-sm font-medium text-gray-900">
                                    <div className="break-words max-w-xs md:max-w-sm">
                                      {item.Peralatan}
                                    </div>
                                  </td>
                                  <td className="px-3 md:px-6 py-4 text-[10px] sm:text-sm text-gray-500">
                                    <div className="break-words max-w-xs md:max-w-sm">
                                      {item.Keterangan}
                                    </div>
                                  </td>
                                  <td className="px-3 md:px-6 py-4 text-center">
                                    <div className="flex justify-center items-center space-x-2">
                                      <button
                                        onClick={() => handleEditClick(item)}
                                        className="text-blue-600 hover:text-blue-900 p-1"
                                        title="Edit Keterangan"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 md:w-5 md:h-5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14.25v4.5a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18.75v-10.5A2.25 2.25 0 015.25 6H10.5" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() => handleDeleteClick(item)}
                                        className="text-red-600 hover:text-red-900 p-1"
                                        title="Hapus Entri"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 md:w-5 md:h-5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.925a2.25 2.25 0 01-2.244-2.077L4.74 5.79m14.46-3.21a1.125 1.125 0 00-1.231-1.231h-2.182a1.125 1.125 0 00-1.231 1.231m-1.588 0H14.74M12 2.25h.007v.008H12V2.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                        </svg>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Tampilan Grid Kotak Ringkasan
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                {uniquePersonDateCombinations.map((combo, index) => (
                  <div
                    key={`${combo.person}-${combo.date}-${index}`}
                    className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-200 transform hover:-translate-y-1"
                    onClick={() => setSelectedPersonDateEntry(combo)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm md:text-base font-semibold text-gray-800 break-words flex-1 mr-2">
                        {combo.person}
                      </p>
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600">{combo.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Tambah Peralatan */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
              Tambah Peralatan Baru
            </h3>
            <div className="mb-4">
              <label
                htmlFor="newPeralatan"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nama Peralatan
              </label>
              <input
                type="text"
                id="newPeralatan"
                className="w-full p-2 md:p-3 border border-gray-300 rounded-md text-sm md:text-base"
                value={newPeralatan}
                onChange={(e) => setNewPeralatan(e.target.value)}
                placeholder="Misal: AWOS Bandara"
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="newKeterangan"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Keterangan/Status Awal
              </label>
              <select
                id="newKeterangan"
                className="w-full p-2 md:p-3 border border-gray-300 rounded-md text-sm md:text-base"
                value={newKeterangan}
                onChange={(e) => setNewKeterangan(e.target.value)}
              >
                <option value="">Pilih Status</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-black bg-red-400 rounded sm:rounded-md hover:bg-red-600 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAddEntry}
                className="px-4 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm bg-green-600 text-white rounded sm:rounded-md hover:bg-green-700 transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Keterangan */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-[13px] md:text-xl font-semibold text-gray-800 mb-4">
              Edit Entri Log Book
            </h3>
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-[13px] md:text-xl text-gray-600 mb-1">
                Penanggung Jawab:{" "}
                <span className="font-medium text-gray-800">
                  {editingItem["Penanggung Jawab"]}
                </span>
              </p>
              <p className="text-[13px] md:text-xl text-gray-600">
                Tanggal:{" "}
                <span className="font-medium text-gray-800">{editingItem.Tanggal}</span>
              </p>
            </div>
            <div className="mb-4">
              <label
                htmlFor="editedPeralatan"
                className="block text-[13px] md:text-xl font-medium text-gray-700 mb-2"
              >
                Nama Peralatan
              </label>
              <input
                type="text"
                id="editedPeralatan"
                className="w-full p-2 md:p-3 border border-gray-300 rounded-md text-[13px] md:text-xl"
                value={editedPeralatan}
                onChange={(e) => setEditedPeralatan(e.target.value)}
                placeholder="Misal: AWOS Bandara"
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="editedKeterangan"
                className="block text-[13px] md:text-xl font-medium text-gray-700 mb-2"
              >
                Keterangan Baru
              </label>
              <select
                id="editedKeterangan"
                className="w-full p-2 md:p-3 border border-gray-300 rounded-md text-[13px] md:text-xl"
                value={editedKeterangan}
                onChange={(e) => setEditedKeterangan(e.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-black bg-red-400 rounded sm:rounded-md hover:bg-red-600 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleEditEntry}
                className="px-4 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm bg-green-600 text-white rounded sm:rounded-md hover:bg-green-700 transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default LogbookPagiPage;
