import React, { useState, useEffect } from 'react';
import Header from "./Header";
import Sidebar from "./sidebar"; 
import Footer from "./Footer";
import { BsFillPersonPlusFill } from "react-icons/bs";
import { FiEdit2 } from "react-icons/fi";
import { FiTrash2 } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { FiCheck } from "react-icons/fi";
import Swal from 'sweetalert2';

const DaftarTeknisiPage = () => {
  const [pegawaiData, setPegawaiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPegawai, setSelectedPegawai] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [newTechnician, setNewTechnician] = useState({
    nama: '',
    nip: '',
    pangkat: '',
    fungsional: '',
    pendidikanTerakhir: '',
    diklatWorkshop: '',
    tugas: '',
    keterangan: '',
    foto: null // File object for upload
  });

  // URL GOOGLE APPS SCRIPT
  // PASTIKAN INI ADALAH URL DEPLOYMENT APLIKASI WEB ANDA YANG BENAR DAN TERBARU
  const GOOGLE_SHEETS_API_URL =
    "https://script.google.com/macros/s/AKfycbxQyvGtri0z1XUNFaSlgJbOfaQncCDa-x3gWaapBIys5bW050m155F8ECVjvSyvDQ3NLQ/exec"; // Ganti dengan URL Anda

  // Fungsi untuk mengambil data dari API (GET)
  const fetchData = async () => {
    setLoading(true);
    setError(null);
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
          "Gagal mengambil data. Silakan periksa koneksi atau URL API."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fungsi untuk mengirim permintaan POST ke Apps Script
  const sendTeknisiApiRequest = async (action, payload) => {
    try {
      const response = await fetch(GOOGLE_SHEETS_API_URL, {
        redirect: "follow",
        method: "POST",
        // Penting: Kirim body sebagai stringified JSON
        body: JSON.stringify({ action, ...payload }),
        headers: {
          // Content-Type ini penting agar Apps Script dapat mengurai JSON
          "Content-Type": "text/plain;charset=utf-8",
        },
      });

      if (!response.ok) {
        // Coba baca respons error dari server jika ada
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

  // Fungsi untuk menangani perubahan pada dropdown
  const handleSelectChange = (event) => {
    const selectedNIP = event.target.value;
    if (selectedNIP === "") {
      setSelectedPegawai(null);
      setIsEditMode(false);
    } else {
      const foundPegawai = pegawaiData.find(
        (pegawai) => pegawai.NIP === selectedNIP
      );
      setSelectedPegawai(foundPegawai);
      setIsEditMode(false);
    }
  };

  // Toggle sidebar untuk mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle add technician modal
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setNewTechnician({
      nama: '',
      nip: '',
      pangkat: '',
      fungsional: '',
      pendidikanTerakhir: '',
      diklatWorkshop: '',
      tugas: '',
      keterangan: '',
      foto: null
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTechnician(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    // Untuk saat ini, kita hanya akan menyimpan nama file atau URL placeholder
    // Upload file sebenarnya membutuhkan integrasi Google Drive API di Apps Script
    setNewTechnician(prev => ({
      ...prev,
      foto: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: 'Konfirmasi Tambah Teknisi',
      text: 'Apakah data teknisi yang akan ditambahkan sudah sesuai?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Tambahkan',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        // Map newTechnician state to Google Sheet headers
        const payload = {
          "NAMA": newTechnician.nama,
          "NIP": newTechnician.nip,
          "PANGKAT / GOL": newTechnician.pangkat,
          "FUNGSIONAL": newTechnician.fungsional,
          "PENDIDIKAN TERAKHIR": newTechnician.pendidikanTerakhir,
          "DIKLAT/WORKSHOP/TEMU TEKNISI": newTechnician.diklatWorkshop,
          "TUGAS": newTechnician.tugas,
          "KETERANGAN": newTechnician.keterangan,
          // Untuk foto, kirim URL placeholder atau string kosong untuk saat ini
          // Implementasi upload foto ke Google Drive akan lebih kompleks
          "FotoURL": newTechnician.foto ? `placeholder_url_${newTechnician.foto.name}` : ''
        };

        await sendTeknisiApiRequest("add", payload);

        await Swal.fire({
          title: 'Berhasil!',
          text: 'Data teknisi berhasil ditambahkan.',
          icon: 'success',
          confirmButtonText: 'OK'
        });

        handleCloseAddModal();
        fetchData(); // Muat ulang data setelah penambahan
      } catch (error) {
        console.error('Error adding technician:', error);
        await Swal.fire({
          title: 'Error!',
          text: `Gagal menambahkan data teknisi: ${error.message}`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  // Handle edit mode
  const handleEdit = (pegawai) => {
    setIsEditMode(true);
    setEditData({
      nama: pegawai.NAMA,
      nip: pegawai.NIP,
      pangkat: pegawai["PANGKAT / GOL"],
      fungsional: pegawai.FUNGSIONAL,
      pendidikanTerakhir: pegawai["PENDIDIKAN TERAKHIR"],
      diklatWorkshop: pegawai["DIKLAT/WORKSHOP/TEMU TEKNISI"],
      tugas: pegawai.TUGAS,
      keterangan: pegawai.KETERANGAN,
      fotoURL: pegawai.FotoURL
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    setEditData(prev => ({
      ...prev,
      foto: file
    }));
  };

  const handleSaveEdit = async () => {
    const result = await Swal.fire({
      title: 'Konfirmasi Perubahan',
      text: 'Apakah data yang telah diubah sudah sesuai?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Simpan',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        // Map editData state to Google Sheet headers
        const payload = {
          // NIP digunakan sebagai identifier untuk menemukan baris yang akan diedit
          "NIP_IDENTIFIER": editData.nip, // Kirim NIP asli sebagai identifier
          "NAMA": editData.nama,
          "NIP": editData.nip, // NIP baru jika diubah
          "PANGKAT / GOL": editData.pangkat,
          "FUNGSIONAL": editData.fungsional,
          "PENDIDIKAN TERAKHIR": editData.pendidikanTerakhir,
          "DIKLAT/WORKSHOP/TEMU TEKNISI": editData.diklatWorkshop,
          "TUGAS": editData.tugas,
          "KETERANGAN": editData.keterangan,
          "FotoURL": editData.foto ? `placeholder_url_${editData.foto.name}` : editData.fotoURL || '' // Update or keep existing
        };

        await sendTeknisiApiRequest("edit", payload);

        setIsEditMode(false);

        await Swal.fire({
          title: 'Berhasil!',
          text: 'Data teknisi berhasil diperbarui.',
          icon: 'success',
          confirmButtonText: 'OK'
        });

        fetchData(); // Muat ulang data setelah perubahan
      } catch (error) {
        console.error('Error updating technician:', error);
        await Swal.fire({
          title: 'Error!',
          text: `Gagal memperbarui data teknisi: ${error.message}`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditData({});
  };

  const handleDelete = async (nip) => {
    const technicianToDelete = pegawaiData.find(pegawai => pegawai.NIP === nip);
    const technicianName = technicianToDelete ? technicianToDelete.NAMA : 'teknisi ini';

    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: `Apakah Anda yakin ingin menghapus teknisi ${technicianName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await sendTeknisiApiRequest("delete", { "NIP_IDENTIFIER": nip }); // Kirim NIP sebagai identifier

        await Swal.fire({
          title: 'Berhasil!',
          text: `Data teknisi ${technicianName} berhasil dihapus.`,
          icon: 'success',
          confirmButtonText: 'OK'
        });

        fetchData(); // Muat ulang data setelah penghapusan
        setSelectedPegawai(null); // Clear selection if the deleted one was selected
      } catch (error) {
        console.error('Error deleting technician:', error);
        await Swal.fire({
          title: 'Error!',
          text: `Gagal menghapus data teknisi: ${error.message}`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
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
          <h2 className="text-center text-[18px] sm:text-2xl font-semibold mb-6 sm:mb-8">
            Daftar Teknisi
          </h2>

          {/* Dropdown untuk memilih teknisi - Centered */}
          <div className="mb-4 sm:mb-8 flex justify-center">
            <div className="w-full max-w-full sm:max-w-2x1 lg:max-w-4xl">
              <div className="flex flex-row items-center gap-2 sm:gap-8 md:gap-6 bg-white p-4 sm:p-6 rounded-lg">
                {/* Label */}
                <label className="font-medium text-[10px] sm:text-base lg:text-lg text-gray-600 whitespace-nowrap flex-shrink-0">
                  Pilih Teknisi
                </label>
                
                {/* Select */}
                <select
                  className="flex-1 min-w-0 rounded-lg border border-gray-300 p-2 sm:p-3 text-[10px] sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                
                {/* Add Button */}
                <button
                  className="flex-shrink-0 hover:bg-gray-100 p-2 md:p-0 rounded-lg transition-colors md:ml-2"
                  onClick={handleOpenAddModal}
                >
                  <BsFillPersonPlusFill className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600" />
                </button>
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 shadow-md mb-8 max-w-2xl lg:max-w-5xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                {/* Bagian Foto */}
                <div className="flex-1 lg:flex-none lg:w-88 xl:w-88 flex items-center justify-center rounded-lg p-3 lg:p-4">
                  {selectedPegawai.FotoURL ? (
                    <img
                      src={selectedPegawai.FotoURL}
                      alt={selectedPegawai.NAMA}
                      className="max-w-full h-auto rounded-lg max-h-50 lg:max-h-50"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-48 lg:h-66 bg-gray-300 rounded-lg">
                      <svg className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Bagian Detail */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <h3 className="text-[14px] sm:text-xl lg:text-lg xl:text-xl font-semibold text-black text-center lg:text-left">
                      {selectedPegawai.NAMA}
                    </h3>
                    <div className="flex items-center gap-0 sm:gap-1">
                      {isEditMode ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            className="p-1.5 sm:p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors"
                            title="Simpan"
                          >
                            <FiCheck className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-full transition-colors"
                            title="Batal"
                          >
                            <IoClose className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(selectedPegawai)}
                            className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(selectedPegawai.NIP)}
                            className="p-1.5 sm:p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                            title="Hapus"
                          >
                            <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Form fields - editable when in edit mode */}
                  <div className="grid grid-cols-1 gap-2 lg:gap-3 text-gray-700 text-[11px] sm:text-base lg:text-sm">
                    <div className="bg-white p-2 lg:p-3 rounded border-l-4 border-blue-500">
                      <span className="font-medium text-black">NIP:</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          name="nip"
                          value={editData.nip || ''}
                          onChange={handleEditInputChange}
                          className="ml-2 px-2 py-1 border border-gray-300 rounded text-[11px] sm:text-base lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="ml-2">{selectedPegawai.NIP}</span>
                      )}
                    </div>

                    <div className="bg-white p-2 lg:p-3 rounded border-l-4 border-blue-500">
                      <span className="font-medium text-black">Nama:</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          name="nama"
                          value={editData.nama || ''}
                          onChange={handleEditInputChange}
                          className="ml-2 px-2 py-1 border border-gray-300 rounded text-[11px] sm:text-base lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="ml-2">{selectedPegawai.NAMA}</span>
                      )}
                    </div>

                    <div className="bg-white p-2 lg:p-3 rounded border-l-4 border-blue-500">
                      <span className="font-medium text-black">Pangkat / Gol.:</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          name="pangkat"
                          value={editData.pangkat || ''}
                          onChange={handleEditInputChange}
                          className="ml-2 px-2 py-1 border border-gray-300 rounded text-[11px] sm:text-base lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="ml-2">{selectedPegawai["PANGKAT / GOL"]}</span>
                      )}
                    </div>

                    <div className="bg-white p-2 lg:p-3 rounded border-l-4 border-blue-500">
                      <span className="font-medium text-black">Fungsional:</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          name="fungsional"
                          value={editData.fungsional || ''}
                          onChange={handleEditInputChange}
                          className="ml-2 px-2 py-1 border border-gray-300 rounded text-[11px] sm:text-base lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="ml-2">{selectedPegawai.FUNGSIONAL}</span>
                      )}
                    </div>

                    <div className="bg-white p-2 lg:p-3 rounded border-l-4 border-blue-500">
                      <span className="font-medium text-black">Pendidikan Terakhir:</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          name="pendidikanTerakhir"
                          value={editData.pendidikanTerakhir || ''}
                          onChange={handleEditInputChange}
                          className="ml-2 px-2 py-1 border border-gray-300 rounded text-[11px] sm:text-base lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="ml-2">{selectedPegawai["PENDIDIKAN TERAKHIR"]}</span>
                      )}
                    </div>

                    <div className="bg-white p-2 lg:p-3 rounded border-l-4 border-blue-500">
                      <span className="font-medium text-black">Diklat/Workshop/Temu Teknisi:</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          name="diklatWorkshop"
                          value={editData.diklatWorkshop || ''}
                          onChange={handleEditInputChange}
                          className="ml-2 px-2 py-1 border border-gray-300 rounded text-[11px] sm:text-base lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="ml-2">{selectedPegawai["DIKLAT/WORKSHOP/TEMU TEKNISI"]}</span>
                      )}
                    </div>

                    <div className="bg-white p-2 lg:p-3 rounded border-l-4 border-blue-500">
                      <span className="font-medium text-black">Tugas:</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          name="tugas"
                          value={editData.tugas || ''}
                          onChange={handleEditInputChange}
                          className="ml-2 px-2 py-1 border border-gray-300 rounded text-[11px] sm:text-base lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="ml-2">{selectedPegawai.TUGAS}</span>
                      )}
                    </div>

                    <div className="bg-white p-2 lg:p-3 rounded border-l-4 border-blue-500">
                      <span className="font-medium text-black">Keterangan:</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          name="keterangan"
                          value={editData.keterangan || ''}
                          onChange={handleEditInputChange}
                          className="ml-2 px-2 py-1 border border-gray-300 rounded text-[11px] sm:text-base lg:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="ml-2">{selectedPegawai.KETERANGAN}</span>
                      )}
                    </div>

                    {/* Photo upload field - only show in edit mode */}
                    {isEditMode && (
                      <div className="bg-white p-2 lg:p-3 rounded border-l-4 border-blue-500">
                        <span className="font-medium text-black">Foto:</span>
                        <div className="ml-2 flex items-center space-x-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleEditFileChange}
                            className="hidden"
                            id="edit-foto-upload"
                          />
                          <label
                            htmlFor="edit-foto-upload"
                            className="px-2 py-1 bg-gray-100 text-black rounded border border-gray-300 hover:bg-gray-200 cursor-pointer transition-colors text-[11px] sm:text-base lg:text-sm"
                          >
                            Pilih File
                          </label>
                          <span className="text-[10px] sm:text-sm text-black">
                            {editData.foto ? editData.foto.name : (editData.fotoURL ? 'Existing Photo' : 'No file chosen')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {!isEditMode && (
                    <button
                      onClick={() => setSelectedPegawai(null)}
                      className="mt-4 lg:mt-6 w-full sm:w-auto px-4 lg:px-6 py-2 lg:py-3 bg-[#0066CC] text-white font-semibold rounded-lg shadow-md hover:bg-[#0066CC]/50 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-[10px] sm:text-base lg:text-sm"
                    >
                      ← Kembali ke Daftar Teknisi
                    </button>
                  )}
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
                        <th className="px-4 py-3 text-center text-[10px] sm:text-base font-semibold">Nama Teknisi</th>
                        <th className="px-4 py-3 text-center text-[10px] sm:text-base font-semibold">NIP</th>
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
                            <td className="px-4 py-3 text-left text-[10px] sm:text-base text-gray-900">
                              {pegawai.NAMA}
                            </td>
                            <td className="px-4 py-3 text-center text-[10px] sm:text-base text-gray-600">
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

      {/* Add Technician Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-200 max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-[15px] sm:text-xl font-semibold text-black w-full text-center">
                Tambah Teknisi
              </h3>
              <button
                onClick={handleCloseAddModal}
                className="text-black hover:text-black transition-colors"
              >
                <IoClose className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="flex items-center space-x-4">
                <label className="w-1/3 text-[13px] sm:text-sm font-medium text-black text-left">
                  Nama :
                </label>
                <input
                  type="text"
                  name="nama"
                  value={newTechnician.nama}
                  onChange={handleInputChange}
                  className="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="w-1/3 text-[13px] sm:text-sm font-medium text-black text-left">
                  NIP :
                </label>
                <input
                  type="text"
                  name="nip"
                  value={newTechnician.nip}
                  onChange={handleInputChange}
                  className="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="w-1/3 text-[13px] sm:text-sm font-medium text-black text-left">
                  Pangkat :
                </label>
                <input
                  type="text"
                  name="pangkat"
                  value={newTechnician.pangkat}
                  onChange={handleInputChange}
                  className="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="w-1/3 text-[13px] sm:text-sm font-medium text-black text-left">
                  Fungsional :
                </label>
                <input
                  type="text"
                  name="fungsional"
                  value={newTechnician.fungsional}
                  onChange={handleInputChange}
                  className="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="w-1/3 text-[13px] sm:text-sm font-medium text-black text-left">
                  Pendidikan Terakhir :
                </label>
                <input
                  type="text"
                  name="pendidikanTerakhir"
                  value={newTechnician.pendidikanTerakhir}
                  onChange={handleInputChange}
                  className="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="w-1/3 text-[12px] sm:text-sm font-medium text-black text-left">
                  Diklat/Workshop
                  /Temu Teknisi :
                </label>
                <input
                  type="text"
                  name="diklatWorkshop"
                  value={newTechnician.diklatWorkshop}
                  onChange={handleInputChange}
                  className="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="w-1/3 text-[13px] sm:text-sm font-medium text-black text-left">
                  Tugas :
                </label>
                <input
                  type="text"
                  name="tugas"
                  value={newTechnician.tugas}
                  onChange={handleInputChange}
                  className="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="w-1/3 text-[13px] sm:text-sm font-medium text-black text-left">
                  Keterangan :
                </label>
                <input
                  type="text"
                  name="keterangan"
                  value={newTechnician.keterangan}
                  onChange={handleInputChange}
                  className="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="w-1/3 text-[13px] sm:text-sm font-medium text-black text-left">
                  Profil
                </label>
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="foto-upload"
                  />
                  <label
                    htmlFor="foto-upload"
                    className="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-gray-100 text-black rounded-md border border-gray-300 hover:bg-gray-200 cursor-pointer transition-colors text-xs sm:text-sm"
                  >
                    Pilih File
                  </label>
                  <span className="text-[10px] sm:text-sm text-black">
                    {newTechnician.foto ? newTechnician.foto.name : 'No file chosen'}
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-black bg-red-400 rounded sm:rounded-md hover:bg-red-600 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm bg-green-600 text-white rounded sm:rounded-md hover:bg-green-700 transition-colors"
                >
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default DaftarTeknisiPage;