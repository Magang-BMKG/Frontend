import React, { useState, useEffect, useMemo } from "react";

const LogbookPagiPage = () => {
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
  const [editingItem, setEditingItem] = useState(null); // Item yang sedang diedit
  const [editedKeterangan, setEditedKeterangan] = useState(""); // Keterangan yang akan diubah

  // States untuk konfirmasi Hapus
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null); // Item yang akan dihapus

  // GANTI DENGAN URL GOOGLE APPS SCRIPT API UNTUK SHEET 'LOGBOOK_PAGI_NORMALISASI' ANDA
  const LOGBOOK_API_URL =
    "https://script.google.com/macros/s/AKfycbzo6opiz-VjtkBGlfKPWkSP4KjjIx5duvNprzc7z6F2H5kM781F4Y-M62n0aOW7eJjMOQ/exec";

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
        throw new Error(`API request failed with status: ${response.status}`);
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
      alert("Nama Peralatan dan Keterangan harus diisi."); // Menggunakan alert sementara
      return;
    }
    try {
      await sendApiRequest("add", {
        Peralatan: newPeralatan,
        Keterangan: newKeterangan,
        PenanggungJawab: selectedPersonDateEntry.person,
        Tanggal: selectedPersonDateEntry.date,
      });
      alert("Data berhasil ditambahkan/diperbarui!");
      setShowAddModal(false);
      setNewPeralatan("");
      setNewKeterangan("");
      fetchData(); // Muat ulang data setelah perubahan
    } catch (err) {
      alert(`Gagal menambahkan data: ${err.message}`);
    }
  };

  // --- Handler untuk Edit Data ---
  const handleEditClick = (item) => {
    setEditingItem(item);
    setEditedKeterangan(item.Keterangan); // Set nilai awal keterangan
    setShowEditModal(true);
  };

  const handleEditEntry = async () => {
    if (!editingItem || !editedKeterangan) {
      alert("Keterangan harus diisi.");
      return;
    }
    try {
      await sendApiRequest("edit", {
        Peralatan: editingItem.Peralatan,
        PenanggungJawab: editingItem["Penanggung Jawab"],
        Tanggal: editingItem.Tanggal,
        newKeterangan: editedKeterangan,
      });
      alert("Data berhasil diubah!");
      setShowEditModal(false);
      setEditingItem(null);
      setEditedKeterangan("");
      fetchData(); // Muat ulang data setelah perubahan
    } catch (err) {
      alert(`Gagal mengubah data: ${err.message}`);
    }
  };

  // --- Handler untuk Hapus Data ---
  const handleDeleteClick = (item) => {
    setDeletingItem(item);
    setShowDeleteConfirm(true);
  };

  const handleDeleteEntry = async () => {
    if (!deletingItem) return;
    try {
      await sendApiRequest("delete", {
        Peralatan: deletingItem.Peralatan,
        PenanggungJawab: deletingItem["Penanggung Jawab"],
        Tanggal: deletingItem.Tanggal,
      });
      alert("Data berhasil dihapus!");
      setShowDeleteConfirm(false);
      setDeletingItem(null);
      fetchData(); // Muat ulang data setelah perubahan
    } catch (err) {
      alert(`Gagal menghapus data: ${err.message}`);
    }
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
    <div className="p-4 sm:p-6 lg:p-8">
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
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.828-2.828z" />
                              </svg>
                            </button>
                            {/* Ikon Hapus */}
                            <button
                              onClick={() => handleDeleteClick(item)}
                              className="text-red-600 hover:text-red-900"
                              title="Hapus Entri"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm-1 3a1 1 0 011-1h4a1 1 0 110 2H7a1 1 0 01-1-1zm-1 3a1 1 0 011-1h4a1 1 0 110 2H7a1 1 0 01-1-1z"
                                  clipRule="evenodd"
                                />
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
              Edit Keterangan Peralatan
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Peralatan:{" "}
              <span className="font-medium">{editingItem.Peralatan}</span>
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Penanggung Jawab:{" "}
              <span className="font-medium">
                {editingItem["Penanggung Jawab"]}
              </span>
              , Tanggal:{" "}
              <span className="font-medium">{editingItem.Tanggal}</span>
            </p>
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
      {showDeleteConfirm && deletingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-red-700 mb-4">
              Konfirmasi Hapus
            </h3>
            <p className="text-gray-700 mb-4">
              Anda yakin ingin menghapus entri ini?
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Peralatan:{" "}
              <span className="font-medium">{deletingItem.Peralatan}</span>
              <br />
              Penanggung Jawab:{" "}
              <span className="font-medium">
                {deletingItem["Penanggung Jawab"]}
              </span>
              <br />
              Tanggal:{" "}
              <span className="font-medium">{deletingItem.Tanggal}</span>
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-md hover:bg-gray-400 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteEntry}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogbookPagiPage;
