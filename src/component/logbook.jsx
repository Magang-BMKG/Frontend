import React, { useState, useEffect, useMemo } from "react";
import Header from "./Header";
import Sidebar from "./sidebar";
import Footer from "./Footer";
import Swal from 'sweetalert2'; // Swal akan diakses secara global setelah CDN dimuat

const LogbookPage = () => {
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
  const [editingItem, setEditingItem] = useState(null); // Item yang sedang diedit (original values)
  const [editedPeralatan, setEditedPeralatan] = useState(""); // Nilai Peralatan yang akan diubah
  const [editedKeterangan, setEditedKeterangan] = useState(""); // Keterangan yang akan diubah

  // States untuk konfirmasi Hapus (state ini tidak lagi digunakan secara langsung karena Swal.fire menangani konfirmasi)
  // const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // const [deletingItem, setDeletingItem] = useState(null); // Item yang akan dihapus

  // GANTI DENGAN URL GOOGLE APPS SCRIPT API UNTUK SHEET 'LOGBOOK_PAGI_NORMALISASI' ANDA
  const LOGBOOK_API_URL =
    "https://script.google.com/macros/s/AKfycbz8cWrZ2JrXXS9amA9KCehWMWP3Hc8m5fn67qYhSJVD_OcGydPQNR0Fl3dL3PDiZVTBvg/exec"; // Ganti dengan URL Anda

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
        // Initial statuses are not directly used for editing, but kept for context
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

  // --- Handler untuk Tambah Data ---
  const handleAddEntry = async () => {
    if (!newPeralatan || !newKeterangan || !selectedPersonDateEntry) {
      Swal.fire('Peringatan', 'Nama Peralatan dan Keterangan harus diisi.', 'warning');
      return;
    }
    try {
      await sendApiRequest("add", {
        Peralatan: newPeralatan,
        Keterangan: newKeterangan,
        "Penanggung Jawab": selectedPersonDateEntry.person, // Pastikan key sesuai dengan header sheet
        Tanggal: selectedPersonDateEntry.date, // Pastikan key sesuai dengan header sheet
      });
      Swal.fire('Berhasil!', 'Data berhasil ditambahkan/diperbarui!', 'success');
      setShowAddModal(false);
      setNewPeralatan("");
      setNewKeterangan("");
      fetchData(); // Muat ulang data setelah perubahan
    } catch (err) {
      Swal.fire('Gagal!', `Gagal menambahkan data: ${err.message}`, 'error');
    }
  };

  // --- Handler untuk Edit Data ---
  const handleEditClick = (item) => {
    setEditingItem(item); // Simpan item asli untuk identifikasi
    setEditedPeralatan(item.Peralatan); // Inisialisasi nilai edit Peralatan
    setEditedKeterangan(item.Keterangan); // Inisialisasi nilai edit Keterangan
    setShowEditModal(true);
  };

  const handleEditEntry = async () => {
    if (!editingItem || !editedPeralatan || !editedKeterangan) {
      Swal.fire('Peringatan', 'Nama Peralatan dan Keterangan harus diisi.', 'warning');
      return;
    }
    try {
      // Kirim nilai asli untuk identifikasi baris, dan nilai baru untuk update
      await sendApiRequest("edit", {
        originalPeralatan: editingItem.Peralatan,
        originalPenanggungJawab: editingItem["Penanggung Jawab"],
        originalTanggal: editingItem.Tanggal,
        Peralatan: editedPeralatan, // Nilai Peralatan yang baru
        Keterangan: editedKeterangan, // Nilai Keterangan yang baru
      });
      Swal.fire('Berhasil!', 'Data berhasil diubah!', 'success');
      setShowEditModal(false);
      setEditingItem(null);
      setEditedPeralatan("");
      setEditedKeterangan("");
      fetchData(); // Muat ulang data setelah perubahan
    } catch (err) {
      Swal.fire('Gagal!', `Gagal mengubah data: ${err.message}`, 'error');
    }
  };

  // --- Handler untuk Hapus Data ---
  const handleDeleteClick = (item) => {
    // Gunakan 'item' secara langsung di sini untuk menghindari masalah closure/state
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
            Peralatan: item.Peralatan, // Menggunakan 'item' langsung
            "Penanggung Jawab": item["Penanggung Jawab"], // Menggunakan 'item' langsung
            Tanggal: item.Tanggal, // Menggunakan 'item' langsung
          });
          Swal.fire('Berhasil!', 'Data berhasil dihapus!', 'success');
          // Tidak perlu setDeletingItem(null) lagi karena tidak digunakan
          fetchData(); // Muat ulang data setelah perubahan
        } catch (err) {
          Swal.fire('Gagal!', `Gagal menghapus data: ${err.message}`, 'error');
        }
      }
    });
  };

  // Opsi status yang tersedia untuk dropdown (untuk detail tabel)
  const statusOptions = ["OK", "Rusak", "Perbaikan", "Tidak Beroperasi"];

  // Fungsi helper untuk mengurai tanggal D/M/YYYY menjadi format yang bisa dibandingkan (YYYYMMDD)
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

  // Mengambil daftar kombinasi unik (Penanggung Jawab, Tanggal) untuk tampilan ringkasan
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

  // Data yang akan ditampilkan di tabel detail (sekarang dengan filter pencarian)
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
      <div className="flex items-center justify-center min-h-[300px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Memuat logbook...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-red-50 p-4 rounded-lg shadow-lg border border-red-200">
        <div className="text-center max-w-md">
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
          <h2 className="text-xl sm:text-2xl font-bold text-red-700 mb-2">
            Terjadi Kesalahan!
          </h2>
          <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
          <p className="text-red-500 text-xs sm:text-sm">
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
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-2">
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
        {/* Sidebar - Hidden on mobile, overlay when open */}
        <div
          className={`
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static absolute inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
        `}
        >
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
          <h2 className="text-center text-xl sm:text-2xl font-semibold mb-6 sm:mb-8">
            Log Book Pagi
          </h2>

          {uniquePersonDateCombinations.length === 0 ? (
            <p className="text-center text-gray-600 mt-4">
              Tidak ada data logbook yang ditemukan.
            </p>
          ) : selectedPersonDateEntry ? (
            // Tampilan Tabel Detail
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Detail Log Book untuk {selectedPersonDateEntry.person} pada{" "}
                {selectedPersonDateEntry.date}
              </h3>

              {/* Input pencarian peralatan */}
              <div className="mb-4 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Cari peralatan..."
                  className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={filterPeralatanDetail}
                  onChange={(e) => setFilterPeralatanDetail(e.target.value)}
                />
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition-colors"
                >
                  Tambah
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Peralatan
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Keterangan
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center"
                      >
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {detailTableData.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                        >
                          Tidak ada Peralatan yang cocok dengan pencarian.
                        </td>
                      </tr>
                    ) : (
                      detailTableData.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.Peralatan}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.Keterangan}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                              <div className="flex justify-center items-center space-x-2">
                                {/* Ikon Edit */}
                                <button
                                  onClick={() => handleEditClick(item)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Edit Keterangan"
                                >
                                  {/* FiEdit2 Icon */}
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14.25v4.5a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18.75v-10.5A2.25 2.25 0 015.25 6H10.5" />
                                  </svg>
                                </button>
                                {/* Ikon Hapus */}
                                <button
                                  onClick={() => handleDeleteClick(item)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Hapus Entri"
                                >
                                  {/* FiTrash2 Icon */}
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.925a2.25 2.25 0 01-2.244-2.077L4.74 5.79m14.46-3.21a1.125 1.125 0 00-1.231-1.231h-2.182a1.125 1.125 0 00-1.231 1.231m-1.588 0H14.74M12 2.25h.007v.008H12V2.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => {
                  setSelectedPersonDateEntry(null);
                  setFilterPeralatanDetail(""); // Reset filter saat kembali
                }}
                className="mt-6 w-full sm:w-auto px-6 py-3 bg-[#0066CC] text-white font-semibold rounded-lg shadow-md hover:bg-[#0066CC]/50 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm sm:text-base"
              >
                ← Kembali ke Ringkasan Log Book
              </button>
            </div>
          ) : (
            // Tampilan Grid Kotak Ringkasan
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uniquePersonDateCombinations.map((combo, index) => (
                <div
                  key={`${combo.person}-${combo.date}-${index}`} // Menambahkan index untuk memastikan key unik
                  className="bg-white rounded-lg shadow-md p-4 border border-gray-200 min-w-[250px] cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  onClick={() => setSelectedPersonDateEntry(combo)}
                >
                  <div className="flex justify-between items-center">
                    <p className="text-base font-semibold text-gray-800">
                      {combo.person}
                    </p>
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      ></path>
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{combo.date}</p>
                </div>
              ))}
            </div>
          )}

          {/* Modal Tambah Peralatan */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Tambah Peralatan Baru
                </h3>
                <div className="mb-4">
                  <label
                    htmlFor="newPeralatan"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nama Peralatan
                  </label>
                  <input
                    type="text"
                    id="newPeralatan"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={newPeralatan}
                    onChange={(e) => setNewPeralatan(e.target.value)}
                    placeholder="Misal: AWOS Bandara"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="newKeterangan"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Keterangan/Status Awal
                  </label>
                  <select
                    id="newKeterangan"
                    className="w-full p-2 border border-gray-300 rounded-md"
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
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleAddEntry}
                    className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition-colors"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Edit Keterangan */}
          {showEditModal && editingItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Edit Entri Log Book
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Penanggung Jawab:{" "}
                  <span className="font-medium">
                    {editingItem["Penanggung Jawab"]}
                  </span>
                  , Tanggal:{" "}
                  <span className="font-medium">{editingItem.Tanggal}</span>
                </p>
                <div className="mb-4">
                  <label
                    htmlFor="editedPeralatan"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nama Peralatan
                  </label>
                  <input
                    type="text"
                    id="editedPeralatan"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={editedPeralatan}
                    onChange={(e) => setEditedPeralatan(e.target.value)}
                    placeholder="Misal: AWOS Bandara"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="editedKeterangan"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Keterangan Baru
                  </label>
                  <select
                    id="editedKeterangan"
                    className="w-full p-2 border border-gray-300 rounded-md"
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
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleEditEntry}
                    className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Konfirmasi Hapus */}
          {/* State showDeleteConfirm dan deletingItem tidak lagi digunakan secara langsung karena Swal.fire menangani konfirmasi */}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LogbookPage;