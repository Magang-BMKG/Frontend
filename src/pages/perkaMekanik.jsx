// pages/PerkaMekanik.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../component/Header";
import Sidebar from "../component/sidebar";
import Footer from "../component/Footer";
import Swal from "sweetalert2";
import { useAuth } from '../context/AuthContext';

const PerkaMekanik = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const [namaAlatList, setNamaAlatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNamaAlat, setSelectedNamaAlat] = useState(null);
  const [detailData, setDetailData] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);

  // State untuk modal tambah detail
  const [showAddDetailModal, setShowAddDetailModal] = useState(false);
  const [newDetail, setNewDetail] = useState({
    'Komponen Alat': '',
    'Penggantian komponen berkala': '',
    'Pemeliharaan berkala': '',
    'Waktu': '',
    'Penyedianan suku cadang': ''
  });

  // State untuk modal edit detail
  const [showEditDetailModal, setShowEditDetailModal] = useState(false);
  const [editingDetail, setEditingDetail] = useState(null);
  const [editedDetail, setEditedDetail] = useState({
    'Komponen Alat': '',
    'Penggantian komponen berkala': '',
    'Pemeliharaan berkala': '',
    'Waktu': '',
    'Penyedianan suku cadang': ''
  });

  // State untuk modal tambah Nama Alat baru
  const [showAddNamaAlatModal, setShowAddNamaAlatModal] = useState(false);
  const [newNamaAlatForm, setNewNamaAlatForm] = useState({
    'Nama Alat': ''
  });

  // State untuk edit Nama Alat
  const [showEditNamaAlatModal, setShowEditNamaAlatModal] = useState(false);
  const [editingNamaAlat, setEditingNamaAlat] = useState('');
  const [originalNamaAlatForEdit, setOriginalNamaAlatForEdit] = useState('');

  // State untuk menu kebab (titik tiga)
  const [openKebabMenuId, setOpenKebabMenuId] = useState(null);

  const { userRole, logout } = useAuth();
  useEffect(() => {
    if (!userRole || (userRole !== "admin" && userRole !== "user")) {
      navigate('/');
    }
  }, [userRole, navigate]);

  // URL GOOGLE APPS SCRIPT API UNTUK SHEET 'PERKA' ANDA
  const PERKA_API_URL = "https://script.google.com/macros/s/AKfycbwVMXcJwMKNmIGQRmsnlgA0vwSTQTZqNZ2_lPal9LQIQRsODtJiwMyRYV-4TJoEM_5w1g/exec";

  // Fungsi untuk mengambil daftar unik Nama Alat (GET request)
  const fetchNamaAlatList = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(PERKA_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setNamaAlatList(data);
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Invalid data format received from API. Expected an array of names.");
      }
    } catch (err) {
      console.error("Error fetching Nama Alat list:", err);
      setError(err.message || "Gagal mengambil daftar Nama Alat. Silakan periksa koneksi atau API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === "admin" || userRole === "user") {
      fetchNamaAlatList();
    }
  }, [userRole]);

  // Fungsi untuk mengirim permintaan POST ke Apps Script
  const sendPerkaApiRequest = async (action, payload) => {
    try {
      const response = await fetch(PERKA_API_URL, {
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

  // Fungsi untuk mengambil detail berdasarkan Nama Alat (POST request)
  const fetchDetailsByNamaAlat = async (namaAlat) => {
    setLoadingDetails(true);
    setErrorDetails(null);
    try {
      const result = await sendPerkaApiRequest("getDetails", { namaAlat: namaAlat });
      if (result.success && Array.isArray(result.data)) {
        setDetailData(result.data);
      } else {
        throw new Error(result.message || "Gagal mengambil detail data.");
      }
    } catch (err) {
      console.error("Error fetching details:", err);
      setErrorDetails(err.message || "Gagal mengambil detail data. Silakan coba lagi.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleNamaAlatClick = (namaAlat) => {
    setSelectedNamaAlat(namaAlat);
    fetchDetailsByNamaAlat(namaAlat);
  };

  const handleBackToList = () => {
    setSelectedNamaAlat(null);
    setDetailData([]);
    setErrorDetails(null);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleBack = () => {
    navigate("/perka");
  };

  // --- Handlers untuk Tambah Detail ---
  const handleOpenAddDetailModal = () => {
    setNewDetail({
      'Komponen Alat': '',
      'Penggantian komponen berkala': '',
      'Pemeliharaan berkala': '',
      'Waktu': '',
      'Penyedianan suku cadang': ''
    });
    setShowAddDetailModal(true);
  };

  const handleCloseAddDetailModal = () => {
    setShowAddDetailModal(false);
  };

  const handleNewDetailInputChange = (e) => {
    const { name, value } = e.target;
    setNewDetail(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDetailSubmit = async () => {
    if (!newDetail['Komponen Alat']) {
      Swal.fire('Peringatan', 'Komponen Alat harus diisi.', 'warning');
      return;
    }
    try {
      await sendPerkaApiRequest("addDetail", {
        'Nama Alat': selectedNamaAlat,
        ...newDetail
      });
      Swal.fire('Berhasil!', 'Detail berhasil ditambahkan!', 'success');
      handleCloseAddDetailModal();
      fetchDetailsByNamaAlat(selectedNamaAlat);
    } catch (err) {
      Swal.fire('Gagal!', `Gagal menambahkan detail: ${err.message}`, 'error');
    }
  };

  // --- Handlers untuk Edit Detail ---
  const handleEditDetailClick = (detail) => {
    setEditingDetail(detail);
    setEditedDetail({ ...detail });
    setShowEditDetailModal(true);
  };

  const handleCloseEditDetailModal = () => {
    setShowEditDetailModal(false);
    setEditingDetail(null);
    setEditedDetail({
      'Komponen Alat': '',
      'Penggantian komponen berkala': '',
      'Pemeliharaan berkala': '',
      'Waktu': '',
      'Penyedianan suku cadang': ''
    });
  };

  const handleEditedDetailInputChange = (e) => {
    const { name, value } = e.target;
    setEditedDetail(prev => ({ ...prev, [name]: value }));
  };

  const handleEditDetailSubmit = async () => {
    if (!editedDetail['Komponen Alat']) {
      Swal.fire('Peringatan', 'Komponen Alat harus diisi.', 'warning');
      return;
    }
    Swal.fire({
      title: 'Konfirmasi Edit',
      text: 'Apakah Anda yakin ingin menyimpan perubahan pada detail ini?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Simpan',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await sendPerkaApiRequest("editDetail", {
            originalNamaAlat: editingDetail['Nama Alat'],
            originalKomponenAlat: editingDetail['Komponen Alat'],
            ...editedDetail
          });
          Swal.fire('Berhasil!', 'Detail berhasil diperbarui!', 'success');
          handleCloseEditDetailModal();
          fetchDetailsByNamaAlat(selectedNamaAlat);
        } catch (err) {
          Swal.fire('Gagal!', `Gagal memperbarui detail: ${err.message}`, 'error');
        }
      }
    });
  };

  // --- Handlers untuk Hapus Detail ---
  const handleDeleteDetail = (detail) => {
    Swal.fire({
      title: 'Konfirmasi Hapus',
      text: `Anda yakin ingin menghapus Komponen Alat: ${detail['Komponen Alat']} dari ${detail['Nama Alat']}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await sendPerkaApiRequest("deleteDetail", {
            namaAlat: detail['Nama Alat'],
            komponenAlat: detail['Komponen Alat']
          });
          Swal.fire('Berhasil!', 'Detail berhasil dihapus!', 'success');
          fetchDetailsByNamaAlat(selectedNamaAlat);
        } catch (err) {
          Swal.fire('Gagal!', `Gagal menghapus detail: ${err.message}`, 'error');
        }
      }
    });
  };

  // --- Handlers untuk Tambah Nama Alat Baru ---
  const handleOpenAddNamaAlatModal = () => {
    setNewNamaAlatForm({ 'Nama Alat': '' });
    setShowAddNamaAlatModal(true);
  };

  const handleCloseAddNamaAlatModal = () => {
    setShowAddNamaAlatModal(false);
    setNewNamaAlatForm({ 'Nama Alat': '' });
  };

  const handleNewNamaAlatInputChange = (e) => {
    const { name, value } = e.target;
    setNewNamaAlatForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNamaAlatSubmit = async () => {
    if (!newNamaAlatForm['Nama Alat']) {
      Swal.fire('Peringatan', 'Nama Alat harus diisi.', 'warning');
      return;
    }
    try {
      await sendPerkaApiRequest("addNamaAlat", {
        'Nama Alat': newNamaAlatForm['Nama Alat']
      });
      Swal.fire('Berhasil!', 'Nama Alat berhasil ditambahkan!', 'success');
      handleCloseAddNamaAlatModal();
      fetchNamaAlatList();
    } catch (err) {
      Swal.fire('Gagal!', `Gagal menambahkan Nama Alat: ${err.message}`, 'error');
    }
  };

  // --- Handlers untuk Edit Nama Alat ---
  const handleEditNamaAlatClick = (namaAlat) => {
    setOriginalNamaAlatForEdit(namaAlat);
    setEditingNamaAlat(namaAlat);
    setShowEditNamaAlatModal(true);
    setOpenKebabMenuId(null);
  };

  const handleCloseEditNamaAlatModal = () => {
    setShowEditNamaAlatModal(false);
    setEditingNamaAlat('');
    setOriginalNamaAlatForEdit('');
  };

  const handleEditingNamaAlatChange = (e) => {
    setEditingNamaAlat(e.target.value);
  };

  const handleSaveNamaAlatEdit = async () => {
    if (!editingNamaAlat) {
      Swal.fire('Peringatan', 'Nama Alat tidak boleh kosong.', 'warning');
      return;
    }
    Swal.fire({
      title: 'Konfirmasi Edit Nama Alat',
      text: `Apakah Anda yakin ingin mengubah "${originalNamaAlatForEdit}" menjadi "${editingNamaAlat}"? Ini akan memperbarui semua detail yang terkait.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Simpan',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await sendPerkaApiRequest("editNamaAlat", {
            originalNamaAlat: originalNamaAlatForEdit,
            newNamaAlat: editingNamaAlat
          });
          Swal.fire('Berhasil!', 'Nama Alat berhasil diperbarui!', 'success');
          handleCloseEditNamaAlatModal();
          fetchNamaAlatList();
          if (selectedNamaAlat === originalNamaAlatForEdit) {
            setSelectedNamaAlat(editingNamaAlat);
            fetchDetailsByNamaAlat(editingNamaAlat);
          }
        } catch (err) {
          Swal.fire('Gagal!', `Gagal memperbarui Nama Alat: ${err.message}`, 'error');
        }
      }
    });
  };

  // --- Handlers untuk Hapus Nama Alat ---
  const handleDeleteNamaAlatClick = (namaAlat) => {
    setOpenKebabMenuId(null);
    Swal.fire({
      title: 'Konfirmasi Hapus Nama Alat',
      text: `Apakah Anda yakin ingin menghapus Nama Alat: "${namaAlat}"? Ini akan menghapus SEMUA detail yang terkait dengan alat ini.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await sendPerkaApiRequest("deleteNamaAlat", { namaAlat: namaAlat });
          Swal.fire('Berhasil!', `Nama Alat "${namaAlat}" dan semua detailnya berhasil dihapus!`, 'success');
          fetchNamaAlatList();
          if (selectedNamaAlat === namaAlat) {
            setSelectedNamaAlat(null);
            setDetailData([]);
          }
        } catch (err) {
          Swal.fire('Gagal!', `Gagal menghapus Nama Alat: ${err.message}`, 'error');
        }
      }
    });
  };

  // --- Kebab Menu Handlers ---
  const handleOpenKebabMenu = (namaAlat) => {
    setOpenKebabMenuId(namaAlat);
  };

  const handleCloseKebabMenu = () => {
    setOpenKebabMenuId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base lg:text-lg text-gray-700">Memuat daftar alat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-red-50 p-4 rounded-lg shadow-lg border border-red-200">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <svg className="mx-auto h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.598 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-red-700 mb-2">Terjadi Kesalahan!</h2>
          <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
          <p className="text-red-500 text-xs sm:text-sm">Pastikan URL Google Apps Script untuk PERKA benar, sudah di-deploy, dan sheet 'PERKA' ada serta berisi data.</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-sm sm:text-base lg:text-lg text-gray-700">Memeriksa autentikasi...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Mobile Menu Button */}
      <div className={`xl:hidden bg-white border-b border-gray-200 px-3 py-2 sm:px-4 sm:py-3 ${isSidebarOpen ? 'hidden' : 'block'}`}>
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
            w-56 sm:w-64 flex-shrink-0
          `}
        >
          <button
            onClick={toggleSidebar}
            className="xl:hidden absolute top-0 right-24 z-10 flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors bg-white shadow-sm"
            >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <Sidebar toggleSidebar={toggleSidebar} />
        </div>

        {/* Overlay untuk mobile */}
        {isSidebarOpen && (
          <div
            className="xl:hidden fixed inset-0 bg-black/50 z-40"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 w-full min-w-0 p-4 md:p-6 xl:p-8 max-w-7xl mx-auto lg:mx-40 lg:ml-18 xl:ml-2 bg-grey-300">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="mb-4 sm:mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors text-xs sm:text-sm md:text-base"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Perka
            </button>
            
            {/* Title */}
            <h1 className="text-center text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800 mb-2 sm:mb-4 md:mb-6 lg:mb-8">
              Perka Mekanik
            </h1>

            {/* User Role Display */}
            {userRole && (
              <div className="text-center text-xs sm:text-sm md:text-base lg:text-lg mb-4 sm:mb-6 text-gray-600">
                Anda login sebagai: <span className="font-bold uppercase">{userRole}</span>
              </div>
            )}

            {/* Add Button */}
            <div className="flex justify-end items-center mb-4 sm:mb-6">
              {!selectedNamaAlat && userRole === "admin" && (
                <button
                  onClick={handleOpenAddNamaAlatModal}
                  className="px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2 lg:px-5 lg:py-3
                            bg-blue-600 text-white font-medium 
                            rounded-md shadow-md hover:bg-blue-700 
                            transition-colors flex items-center space-x-1 sm:space-x-2
                            text-xs sm:text-sm md:text-base"
                >
                  <svg 
                    width="14" 
                    height="14" 
                    viewBox="0 0 48 48" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="text-white sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6"
                  >
                    <path 
                      d="M28 4H12C10.9391 4 9.92172 4.42143 9.17157 5.17157C8.42143 5.92172 8 6.93913 8 8V40C8 41.0609 8.42143 42.0783 9.17157 42.8284C9.92172 43.5786 10.9391 44 12 44H36C37.0609 44 38.0783 43.5786 38.8284 42.8284C39.5786 42.0783 40 41.0609 40 40V16M28 4L40 16M28 4V16H40M24 36V24M18 30H30" 
                      stroke="currentColor" 
                      strokeWidth="4" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="hidden sm:inline">Tambah Alat</span>
                  <span className="inline sm:hidden">+</span>
                </button>
              )}
            </div>

            {selectedNamaAlat ? (
              // Detail View
              <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6 mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-0">
                  <h3 className="text-[12px] sm:text-lg md:text-xl font-semibold text-gray-800">
                    Detail untuk: {selectedNamaAlat}
                  </h3>
                  {userRole === "admin" && (
                    <button
                      onClick={handleOpenAddDetailModal}
                      className="w-28 sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition-colors text-[12px] sm:text-base lg:text-[18px]"
                    >
                      Tambah Detail
                    </button>
                  )}
                </div>

                {loadingDetails ? (
                  <div className="flex items-center justify-center min-h-[150px]">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
                    <p className="ml-4 text-gray-700 text-sm sm:text-base">Memuat detail...</p>
                  </div>
                ) : errorDetails ? (
                  <div className="text-red-500 text-center p-4 border border-red-200 rounded-md text-sm sm:text-base">
                    {errorDetails}
                  </div>
                ) : detailData.length === 0 ? (
                  <p className="text-center text-gray-600 text-sm sm:text-base">Tidak ada detail yang ditemukan untuk alat ini.</p>
                ) : (
                  // Table - Responsive with horizontal scroll on mobile
                  <div className="overflow-x-auto -mx-3 sm:-mx-4 md:mx-0">
                    <div className="inline-block min-w-full px-3 sm:px-4 md:px-0">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-base lg:text-[18px] font-medium text-gray-500 uppercase tracking-wider">
                              Waktu
                            </th>
                            <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[9px] sm:text-base lg:text-[18px] font-medium text-gray-500 uppercase tracking-wider">
                              Penyediaan Suku Cadang
                            </th>
                            {userRole === "admin" && (
                              <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-base lg:text-[18px] font-medium text-gray-500 uppercase tracking-wider">
                                Aksi
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {detailData.map((detail, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-[10px] sm:text-base lg:text-[18px] font-medium text-gray-900 min-w-[120px]">
                                {detail['Komponen Alat']}
                              </td>
                              <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-[10px] sm:text-base lg:text-[18px] text-gray-500 min-w-[120px]">
                                {detail['Penggantian komponen berkala']}
                              </td>
                              <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-[10px] sm:text-base lg:text-[18px] text-gray-500 min-w-[120px]">
                                {detail['Pemeliharaan berkala']}
                              </td>
                              <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-[10px] lg:text-[18px] sm:text-sm text-gray-500 min-w-[80px]">
                                {detail['Waktu']}
                              </td>
                              <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-[10px] sm:text-base lg:text-[18px] text-gray-500 min-w-[120px]">
                                {detail['Penyedianan suku cadang']}
                              </td>
                              {userRole === "admin" && (
                                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-[10px] sm:text-base lg:text-[18px] text-center min-w-[100px]">
                                  <div className="flex justify-center items-center space-x-1 sm:space-x-2">
                                    <button
                                      onClick={() => handleEditDetailClick(detail)}
                                      className="text-blue-600 hover:text-blue-900 p-1"
                                      title="Edit Detail"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14.25v4.5a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18.75v-10.5A2.25 2.25 0 015.25 6H10.5" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteDetail(detail)}
                                      className="text-red-600 hover:text-red-900 p-1"
                                      title="Hapus Detail"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.925a2.25 2.25 0 01-2.244-2.077L4.74 5.79m14.46-3.21a1.125 1.125 0 00-1.231-1.231h-2.182a1.125 1.125 0 00-1.231 1.231m-1.588 0H14.74M12 2.25h.007v.008H12V2.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                      </svg>
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Back to List Button */}
                <button
                  onClick={handleBackToList}
                  className="mt-4 sm:mt-6 w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-[#0066CC] text-white font-semibold rounded-lg shadow-md hover:bg-[#0066CC]/80 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-[10px] sm:text-base lg:text-[18px]"
                >
                  ← Kembali ke Daftar Alat
                </button>
              </div>
            ) : (
              // Grid View - Responsive card layout
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                {namaAlatList.length === 0 ? (
                  <p className="col-span-full text-center text-gray-600 mt-4 text-sm sm:text-base">Tidak ada data 'Nama Alat' yang ditemukan.</p>
                ) : (
                  namaAlatList.map((namaAlat) => (
                    <div
                      key={namaAlat}
                      className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-5 border border-gray-200 
                                cursor-pointer hover:shadow-lg transition-all duration-200 
                                flex flex-col items-center justify-center text-center relative
                                min-h-[100px] sm:min-h-[120px] md:min-h-[140px]
                                hover:scale-[1.02] hover:-translate-y-1"
                      onClick={() => handleNamaAlatClick(namaAlat)}
                    >
                      <p className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-800 mb-2 
                                   break-words hyphens-auto leading-tight px-1">
                        {namaAlat}
                      </p>

                      {/* Kebab Menu Button */}
                      {userRole === "admin" && (
                        <button
                          className="absolute top-1 sm:top-2 right-1 sm:right-2 p-1 rounded-full hover:bg-gray-100 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenKebabMenu(namaAlat);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                          </svg>
                        </button>
                      )}

                      {/* Kebab Menu Dropdown */}
                      {openKebabMenuId === namaAlat && (
                        <div
                          className="absolute top-6 sm:top-8 right-1 sm:right-2 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-[80px] sm:min-w-[100px]"
                          onMouseLeave={handleCloseKebabMenu}
                        >
                          <button
                            className="block w-full text-left px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditNamaAlatClick(namaAlat);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="block w-full text-left px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNamaAlatClick(namaAlat);
                            }}
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Tambah Detail */}
      {showAddDetailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-xs sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-[16px] sm:text-base lg:text-[18px] font-semibold text-gray-800 mb-4">
              Tambah Detail untuk {selectedNamaAlat}
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {Object.keys(newDetail).map(key => (
                <div key={key}>
                  <label htmlFor={`new-${key}`} className="block text-[12px] sm:text-base lg:text-[18px] font-medium text-gray-700 mb-1">
                    {key}
                  </label>
                  <input
                    type="text"
                    id={`new-${key}`}
                    name={key}
                    value={newDetail[key]}
                    onChange={handleNewDetailInputChange}
                    className="w-full p-2 sm:p-3 text-[10px] lg:text-[18px] border border-gray-300 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required={key === 'Komponen Alat'}
                  />
                </div>
              ))}
            </div>
            <div className="flex flex-row justify-end space-x-2 mt-6">
              <button
                onClick={handleCloseAddDetailModal}
                className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-md hover:bg-gray-400 transition-colors text-sm sm:text-base"
              >
                Batal
              </button>
              <button
                onClick={handleAddDetailSubmit}
                className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition-colors text-sm sm:text-base"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Detail */}
      {showEditDetailModal && editingDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-xs sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-[18px] sm:text-base lg:text-[18px] font-semibold text-gray-800 mb-4">
              Edit Detail untuk {selectedNamaAlat}
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {Object.keys(editedDetail).map(key => (
                <div key={key}>
                  <label htmlFor={`edit-${key}`} className="block text-[12px] sm:text-base lg:text-[18px] font-medium text-gray-700 mb-1">
                    {key}
                  </label>
                  <input
                    type="text"
                    id={`edit-${key}`}
                    name={key}
                    value={editedDetail[key]}
                    onChange={handleEditedDetailInputChange}
                    className="w-full p-2 sm:p-3 text-[12px] lg:text-[18px] border border-gray-300 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required={key === 'Komponen Alat'}
                  />
                </div>
              ))}
            </div>
            <div className="flex flex-row justify-end space-x-2 mt-6">
              <button
                onClick={handleCloseEditDetailModal}
                className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-md hover:bg-gray-400 transition-colors text-[10px] sm:text-base lg:text-[18px]"
              >
                Batal
              </button>
              <button
                onClick={handleEditDetailSubmit}
                className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors text-[10px] sm:text-base lg:text-[18px]"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Nama Alat Baru */}
      {showAddNamaAlatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-xs sm:max-w-md">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Tambah Nama Alat Baru</h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="newNamaAlat" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Nama Alat
                </label>
                <input
                  type="text"
                  id="newNamaAlat"
                  name="Nama Alat"
                  value={newNamaAlatForm['Nama Alat']}
                  onChange={handleNewNamaAlatInputChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-6">
              <button
                onClick={handleCloseAddNamaAlatModal}
                className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-md hover:bg-gray-400 transition-colors text-sm sm:text-base"
              >
                Batal
              </button>
              <button
                onClick={handleAddNamaAlatSubmit}
                className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition-colors text-sm sm:text-base"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Nama Alat */}
      {showEditNamaAlatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-xs sm:max-w-md">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Edit Nama Alat</h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="editingNamaAlat" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Nama Alat
                </label>
                <input
                  type="text"
                  id="editingNamaAlat"
                  name="Nama Alat"
                  value={editingNamaAlat}
                  onChange={handleEditingNamaAlatChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-6">
              <button
                onClick={handleCloseEditNamaAlatModal}
                className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-md hover:bg-gray-400 transition-colors text-sm sm:text-base"
              >
                Batal
              </button>
              <button
                onClick={handleSaveNamaAlatEdit}
                className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors text-sm sm:text-base"
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

export default PerkaMekanik;  