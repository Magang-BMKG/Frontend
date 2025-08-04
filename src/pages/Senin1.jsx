import React, { useState, useEffect } from 'react';
import Header from "../component/Header";
import Sidebar from "../component/sidebar";
import Footer from "../component/Footer";
import { AiTwotoneFileAdd } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";
import { FiTrash2 } from "react-icons/fi";
import { MdSave, MdCancel } from "react-icons/md";
import Swal from 'sweetalert2';

// Import ikon baru untuk duplikasi
import { IoMdRefresh } from "react-icons/io";

const Senin1 = () => {
  const [jadwalData, setJadwalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(new Set());

  // Edit state - untuk inline editing
  const [editingRows, setEditingRows] = useState(new Set());
  const [editData, setEditData] = useState({});

  // Checklist state - Local state management
  const [localChecklistState, setLocalChecklistState] = useState(new Map());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form state untuk add modal
  const [formData, setFormData] = useState({
    Lokasi: '',
    Keterangan: ''
  });

  // State untuk pop-up konfirmasi checklist
  const [isChecklistConfirmModalOpen, setIsChecklistConfirmModalOpen] = useState(false);
  const [currentChecklistItemToUpdate, setCurrentChecklistItemToUpdate] = useState(null); // Menyimpan item yang akan diupdate
  const [checklistFormDetails, setChecklistFormDetails] = useState({
    'Penanggung Jawab': '',
    'Tanggal Selesai': '',
    Komentar: ''
  });

  // URL GOOGLE APPS SCRIPT API UNTUK SHEET 'JADWAL_SENIN'
  const JADWAL_API_URL = "https://script.google.com/macros/s/AKfycbxNFSviYIxFsNMqO71Le5dgyTrF4c6-fQDwp-UkukNaLkE4D2BrZjuT9QRTy2Kk0bM_7w/exec"; // Pastikan ini URL yang benar

  // Fungsi untuk mengambil data dari API (GET)
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(JADWAL_API_URL);

      if (!response.ok) {
        throw new Error(
          `HTTP error! Status: ${response.status} - ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result && Array.isArray(result.data)) {
        setJadwalData(result.data);
        const initialChecklistState = new Map();
        result.data.forEach(item => {
          initialChecklistState.set(item.id, {
            isCompleted: item.Status,
            'Penanggung Jawab': item['Penanggung Jawab'] || '',
            'Tanggal Selesai': item['Tanggal Selesai'] || '',
            Komentar: item.Komentar || ''
          });
        });
        setLocalChecklistState(initialChecklistState);
        setHasUnsavedChanges(false);
      } else {
        throw new Error(
          "Format data tidak valid. Seharusnya objek dengan properti 'data' berbentuk array."
        );
      }
    } catch (err) {
      console.error("Error fetching jadwal data:", err);
      setError(
        err.message ||
        "Gagal mengambil data jadwal. Silakan periksa koneksi atau API."
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
      const response = await fetch(JADWAL_API_URL, {
        redirect: "follow",
        method: "POST",
        body: JSON.stringify({ action, ...payload }),
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Permintaan API gagal dengan status: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Operasi gagal di server.");
      }
      return result;
    } catch (err) {
      console.error("Error permintaan API:", err);
      throw err;
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setFormData({
      Lokasi: '',
      Keterangan: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Delete functions
  const handleDeleteJadwal = () => {
    setIsDeleteMode(true);
    setSelectedForDelete(new Set());
    setEditingRows(new Set()); // Exit edit mode
  };

  const handleCancelDelete = () => {
    setIsDeleteMode(false);
    setSelectedForDelete(new Set());
  };

  const handleCheckboxChange = (jadwalId) => {
    setSelectedForDelete(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jadwalId)) {
        newSet.delete(jadwalId);
      } else {
        newSet.add(jadwalId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedForDelete.size === jadwalData.length) {
      setSelectedForDelete(new Set());
    } else {
      const allIds = new Set(jadwalData.map(jadwal => jadwal.id));
      setSelectedForDelete(allIds);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedForDelete.size === 0) {
      await Swal.fire({
        title: 'Peringatan!',
        text: 'Pilih minimal satu jadwal untuk dihapus.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: `Apakah Anda yakin ingin menghapus ${selectedForDelete.size} jadwal yang dipilih?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        setIsSubmitting(true);

        const deletePromises = Array.from(selectedForDelete).map(id =>
          sendApiRequest("delete", { id: id })
        );
        await Promise.all(deletePromises);

        await Swal.fire({
          title: 'Berhasil!',
          text: `${selectedForDelete.size} jadwal berhasil dihapus.`,
          icon: 'success',
          confirmButtonText: 'OK'
        });

        setIsDeleteMode(false);
        setSelectedForDelete(new Set());
        fetchData();
      } catch (error) {
        console.error('Error menghapus jadwal:', error);
        await Swal.fire({
          title: 'Error!',
          text: `Gagal menghapus jadwal: ${error.message}. Silakan coba lagi.`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Inline Edit functions
  const handleStartEdit = (jadwalId, jadwal) => {
    if (isDeleteMode) return; // Cannot edit in delete mode
    setEditingRows(prev => new Set([...prev, jadwalId]));
    setEditData(prev => ({
      ...prev,
      [jadwalId]: { ...jadwal }
    }));
  };

  const handleCancelEdit = (jadwalId) => {
    setEditingRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(jadwalId);
      return newSet;
    });
    setEditData(prev => {
      const newData = { ...prev };
      delete newData[jadwalId];
      return newData;
    });
  };

  const handleEditChange = (jadwalId, field, value) => {
    setEditData(prev => ({
      ...prev,
      [jadwalId]: {
        ...prev[jadwalId],
        [field]: value
      }
    }));
  };

  const handleSaveEdit = async (jadwalId) => {
    const editedData = editData[jadwalId];

    if (!editedData.Lokasi || !editedData.Keterangan) {
      await Swal.fire('Peringatan!', 'Lokasi dan Keterangan tidak boleh kosong.', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      await sendApiRequest("edit", {
        id: jadwalId,
        Lokasi: editedData.Lokasi,
        Keterangan: editedData.Keterangan,
      });

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Data jadwal berhasil diperbarui.',
        icon: 'success',
        confirmButtonText: 'OK'
      });

      handleCancelEdit(jadwalId);
      fetchData();
    } catch (error) {
      console.error('Error memperbarui jadwal:', error);
      await Swal.fire({
        title: 'Error!',
        text: `Gagal memperbarui data jadwal: ${error.message}. Silakan coba lagi.`,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Checklist functions - Local state management with pop-up for 'complete' action
  const handleChecklistToggle = (jadwalId) => {
    if (isDeleteMode || editingRows.has(jadwalId)) return;

    const currentStatus = localChecklistState.get(jadwalId)?.isCompleted || false;

    if (currentStatus) {
      Swal.fire({
        title: 'Batalkan Checklist',
        text: 'Apakah Anda yakin ingin membatalkan tugas ini? Status akan kembali menjadi "Belum Selesai" dan data penyelesaian akan dihapus.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Batalkan',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          setLocalChecklistState(prev => {
            const newState = new Map(prev);
            newState.set(jadwalId, {
              isCompleted: false,
              'Penanggung Jawab': '',
              'Tanggal Selesai': '',
              Komentar: ''
            });
            return newState;
          });
          setHasUnsavedChanges(true);
        }
      });
    } else {
      const originalJadwal = jadwalData.find(item => item.id === jadwalId);
      setCurrentChecklistItemToUpdate(originalJadwal);
      setChecklistFormDetails({
        'Penanggung Jawab': originalJadwal['Penanggung Jawab'] || '',
        'Tanggal Selesai': originalJadwal['Tanggal Selesai'] || new Date().toISOString().slice(0, 10),
        Komentar: originalJadwal.Komentar || ''
      });
      setIsChecklistConfirmModalOpen(true);
    }
  };

  const handleCloseChecklistConfirmModal = () => {
    setIsChecklistConfirmModalOpen(false);
    setCurrentChecklistItemToUpdate(null);
    setChecklistFormDetails({
      'Penanggung Jawab': '',
      'Tanggal Selesai': '',
      Komentar: ''
    });
  };

  const handleChecklistFormDetailsChange = (e) => {
    const { name, value } = e.target;
    setChecklistFormDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitChecklistConfirm = async (e) => {
    e.preventDefault();

    const { id: jadwalId } = currentChecklistItemToUpdate;
    const { 'Penanggung Jawab': PenanggungJawab, 'Tanggal Selesai': TanggalSelesai, Komentar } = checklistFormDetails;

    if (!PenanggungJawab || !TanggalSelesai) {
      await Swal.fire('Peringatan!', 'Nama penanggung jawab dan tanggal tidak boleh kosong.', 'warning');
      return;
    }

    setLocalChecklistState(prev => {
      const newState = new Map(prev);
      newState.set(jadwalId, {
        isCompleted: true,
        'Penanggung Jawab': PenanggungJawab,
        'Tanggal Selesai': TanggalSelesai,
        Komentar: Komentar
      });
      return newState;
    });
    setHasUnsavedChanges(true);
    handleCloseChecklistConfirmModal();
  };

  // Fungsi untuk simpan semua perubahan checklist dari state lokal ke server
  const handleSaveAllChecklists = async () => {
    try {
      setIsSubmitting(true);

      const updates = [];
      jadwalData.forEach(originalItem => {
        const localState = localChecklistState.get(originalItem.id);
        if (localState) {
          const hasStatusChanged = localState.isCompleted !== originalItem.Status;
          const hasDetailsChanged = (localState['Penanggung Jawab'] !== originalItem['Penanggung Jawab'] ||
                                     localState['Tanggal Selesai'] !== originalItem['Tanggal Selesai'] ||
                                     localState.Komentar !== originalItem.Komentar);

          if (hasStatusChanged || hasDetailsChanged) {
            updates.push({
              id: originalItem.id,
              Status: localState.isCompleted,
              'Penanggung Jawab': localState['Penanggung Jawab'],
              'Tanggal Selesai': localState['Tanggal Selesai'],
              Komentar: localState.Komentar
            });
          }
        }
      });

      if (updates.length === 0) {
        await Swal.fire({
          title: 'Tidak ada perubahan!',
          text: 'Tidak ada perubahan checklist yang perlu disimpan.',
          icon: 'info',
          confirmButtonText: 'OK'
        });
        return;
      }

      await sendApiRequest("bulkUpdateChecklists", { updates: updates });

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Status checklist berhasil disimpan.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });

      setHasUnsavedChanges(false);
      fetchData();
    } catch (error) {
      console.error('Error menyimpan checklist:', error);
      await Swal.fire({
        title: 'Error!',
        text: `Gagal menyimpan checklist: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi untuk mereset semua checklist yang ada menjadi "Belum Selesai"
  const handleManualReset = async () => {
    const result = await Swal.fire({
      title: 'Reset Semua Tugas',
      text: 'Apakah Anda yakin ingin mereset semua tugas? Semua akan kembali menjadi belum selesai.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Reset',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        setIsSubmitting(true);
        await sendApiRequest("resetAllChecklists", {});
        await Swal.fire({
          title: 'Tugas Berhasil Direset!',
          text: 'Semua tugas telah direset menjadi belum selesai.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        fetchData();
      } catch (error) {
        console.error('Error mereset checklist:', error);
        await Swal.fire({
          title: 'Error!',
          text: `Gagal mereset checklist: ${error.message}. Silakan coba lagi.`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Fungsi BARU: Menduplikasi semua tugas yang ada
  const handleDuplicateAllTasks = async () => {
    const result = await Swal.fire({
      title: 'Mulai Tugas Baru',
      text: 'Ini akan membuat salinan semua tugas yang ada sebagai tugas baru dengan status "Belum Selesai". Lanjutkan?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Buat Tugas Baru',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        setIsSubmitting(true);
        const tasksToDuplicate = jadwalData.map(task => ({
          Lokasi: task.Lokasi,
          Keterangan: task.Keterangan
        }));

        if (tasksToDuplicate.length === 0) {
          await Swal.fire('Informasi', 'Tidak ada tugas yang tersedia untuk diduplikasi.', 'info');
          return;
        }

        await sendApiRequest("duplicateAll", { tasks: tasksToDuplicate });

        await Swal.fire({
          title: 'Berhasil!',
          text: `${tasksToDuplicate.length} tugas baru berhasil dibuat.`,
          icon: 'success',
          confirmButtonText: 'OK'
        });
        fetchData(); // Muat ulang data setelah duplikasi
      } catch (error) {
        console.error('Error menduplikasi tugas:', error);
        await Swal.fire({
          title: 'Error!',
          text: `Gagal menduplikasi tugas: ${error.message}. Silakan coba lagi.`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.Lokasi || !formData.Keterangan) {
      await Swal.fire('Peringatan!', 'Lokasi dan Keterangan harus diisi.', 'warning');
      return;
    }

    const result = await Swal.fire({
      title: 'Konfirmasi Tambah Jadwal',
      text: 'Apakah data jadwal yang akan ditambahkan sudah sesuai?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Tambahkan',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      setIsSubmitting(true);

      try {
        const payload = {
          action: "add",
          Lokasi: formData.Lokasi,
          Keterangan: formData.Keterangan,
          Status: false,
          'Penanggung Jawab': '',
          'Tanggal Selesai': '',
          Komentar: ''
        };

        await sendApiRequest("add", payload);

        await Swal.fire({
          title: 'Berhasil!',
          text: 'Data jadwal berhasil ditambahkan.',
          icon: 'success',
          confirmButtonText: 'OK'
        });

        handleCloseAddModal();
        fetchData();
      } catch (error) {
        console.error('Error menambahkan jadwal:', error);
        await Swal.fire({
          title: 'Error!',
          text: `Gagal menambahkan data jadwal: ${error.message}. Silakan coba lagi.`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Hitung statistik dari state lokal
  const completedCount = Array.from(localChecklistState.values()).filter(state => state.isCompleted).length;
  const uncompletedCount = Array.from(localChecklistState.values()).filter(state => !state.isCompleted).length;
  const progressPercentage = jadwalData.length > 0 ? Math.round((completedCount / jadwalData.length) * 100) : 0;

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
        {/* Sidebar */}
        <div className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static absolute inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
        `}>
          <Sidebar />
        </div>

        {/* Overlay untuk mobile */}
        {isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 bg-opacity-50 z-40"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <h2 className="text-center text-[18px] sm:text-2xl font-semibold mb-6 sm:mb-8">
            Jadwal Senin
          </h2>

          {/* Action Buttons */}
          <div className="mb-4 sm:mb-6 md:mb-2 mx-1 sm:mx-2 lg:mx-4 xl:mx-auto max-w-7xl">
            <div className="w-full">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 md:p-6 lg:p-8 rounded-lg mx-1 sm:mx-2 lg:mx-4 xl:mx-auto max-w-7xl">
                <label className="font-medium text-[10px] sm:text-base md:text-[15px] text-gray-700 text-center lg:text-center whitespace-nowrap lg:min-w-max">
                  Kelola Jadwal Senin:
                </label>

                <div className="flex flex-row items-center gap-3 sm:gap-4 w-full lg:flex-1 justify-center lg:justify-start">
                  {/* Add Button */}
                  <button
                    className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 hover:bg-gray-100 rounded-lg transition-colors group"
                    onClick={handleOpenAddModal}
                    title="Tambah Jadwal"
                    disabled={isDeleteMode || editingRows.size > 0 || isSubmitting}
                  >
                    <AiTwotoneFileAdd className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600 group-hover:text-blue-600" />
                  </button>

                  {/* Delete Button */}
                  <button
                    className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 hover:bg-red-100 rounded-lg transition-colors group"
                    onClick={handleDeleteJadwal}
                    title="Hapus Jadwal"
                    disabled={editingRows.size > 0 || isSubmitting}
                  >
                    <FiTrash2 className="w-4 h-4 sm:w-6 sm:h-6 text-red-500 group-hover:text-red-700" />
                  </button>

                  {/* Save Checklist Button */}
                  <button
                    className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg transition-colors group ${
                      hasUnsavedChanges
                        ? 'bg-green-100 hover:bg-green-200'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={handleSaveAllChecklists}
                    disabled={!hasUnsavedChanges || isSubmitting || isDeleteMode || editingRows.size > 0}
                    title="Simpan Perubahan Checklist"
                  >
                    <FaCheck className={`w-4 h-4 sm:w-6 sm:h-6 ${
                      hasUnsavedChanges
                        ? 'text-green-600 group-hover:text-green-700'
                        : 'text-gray-400'
                    }`} />
                  </button>

                  {/* Reset All Tasks Button */}
                  <button
                    className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 hover:bg-yellow-100 rounded-lg transition-colors group"
                    onClick={handleManualReset}
                    title="Reset Semua Tugas"
                    disabled={isSubmitting || isDeleteMode || editingRows.size > 0}
                  >
                    <svg className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600 group-hover:text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>

                  {/* New Button: Duplicate All Tasks */}
                  <button
                    className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 hover:bg-blue-100 rounded-lg transition-colors group"
                    onClick={handleDuplicateAllTasks}
                    title="Mulai Tugas Baru (Duplikasi Semua)"
                    disabled={isSubmitting || isDeleteMode || editingRows.size > 0}
                  >
                    <IoMdRefresh className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 group-hover:text-blue-700" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Delete Mode Controls */}
          {isDeleteMode && (
            <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-4 mx-1 sm:mx-2 lg:mx-4 xl:mx-auto max-w-4xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                  <span className="text-red-700 font-medium text-sm">Mode Hapus</span>
                  <span className="text-xs text-red-600 text-center sm:text-left">
                    {selectedForDelete.size} dari {jadwalData.length} jadwal dipilih
                  </span>
                </div>
                <div className="flex flex-row items-center gap-1 sm:gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleSelectAll}
                    className="flex-1 sm:flex-initial px-2 py-1.5 text-xs sm:text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    {selectedForDelete.size === jadwalData.length ? 'Batal Pilih' : 'Pilih Semua'}
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={selectedForDelete.size === 0 || isSubmitting}
                    className="flex-1 sm:flex-initial px-2 py-1.5 text-xs sm:text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Hapus...' : 'Hapus'}
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-initial px-2 py-1.5 text-xs sm:text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Unsaved Changes Notification */}
          {hasUnsavedChanges && !isDeleteMode && (
            <div className="mb-4 sm:mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 mx-1 sm:mx-2 lg:mx-4 xl:mx-auto max-w-4xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-yellow-700 font-medium text-sm">
                    Ada perubahan checklist yang belum disimpan
                  </span>
                </div>
                <button
                  onClick={handleSaveAllChecklists}
                  disabled={isSubmitting || editingRows.size > 0}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Sekarang'}
                </button>
              </div>
            </div>
          )}

          {/* Main Table/Cards */}
          <div className="flex justify-center px-2 sm:px-4 lg:px-6 xl:px-8">
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden w-full max-w-7xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="bg-[#0066CC] text-white">
                      {isDeleteMode && (
                        <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-white uppercase tracking-wider w-12">
                          <input
                            type="checkbox"
                            checked={selectedForDelete.size === jadwalData.length && jadwalData.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                      )}
                      <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider w-16">Status</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/4">Lokasi</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/2">Keterangan</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/6">Penanggung Jawab</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/6">Tanggal Selesai</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/6">Komentar</th>
                      <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={isDeleteMode ? 8 : 7} className="px-6 py-8 text-center text-sm text-gray-500">
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                            Memuat data jadwal...
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={isDeleteMode ? 8 : 7} className="px-6 py-8 text-center text-sm text-red-500">
                          Error: {error}
                        </td>
                      </tr>
                    ) : jadwalData.length === 0 ? (
                      <tr>
                        <td colSpan={isDeleteMode ? 8 : 7} className="px-6 py-8 text-center text-sm text-gray-500">
                          Data jadwal tidak tersedia
                        </td>
                      </tr>
                    ) : (
                      jadwalData.map((jadwal) => {
                        const jadwalId = jadwal.id;
                        const isEditing = editingRows.has(jadwalId);
                        const currentEditData = editData[jadwalId] || jadwal;
                        const localState = localChecklistState.get(jadwalId);
                        const isCompleted = localState?.isCompleted || false;

                        return (
                          <tr
                            key={jadwalId}
                            className={`hover:bg-gray-50 transition-colors duration-150 ${
                              isDeleteMode && selectedForDelete.has(jadwalId)
                                ? 'bg-red-50 border-red-200'
                                : isCompleted
                                  ? 'bg-green-50'
                                  : ''
                            }`}
                          >
                            {isDeleteMode && (
                              <td className="px-3 py-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedForDelete.has(jadwalId)}
                                  onChange={() => handleCheckboxChange(jadwalId)}
                                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                              </td>
                            )}

                            {/* Status Checklist Column */}
                            <td className="px-4 py-4 text-center">
                              <button
                                onClick={() => handleChecklistToggle(jadwalId)}
                                disabled={isDeleteMode || isEditing}
                                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                  isCompleted
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-gray-300 hover:border-green-400'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                title={isCompleted ? "Batalkan Selesai" : "Tandai Selesai"}
                              >
                                {isCompleted && <FaCheck className="w-3 h-3" />}
                              </button>
                            </td>

                            {/* Lokasi Column */}
                            <td className="px-4 py-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={currentEditData.Lokasi || ''}
                                  onChange={(e) => handleEditChange(jadwalId, 'Lokasi', e.target.value)}
                                  className="w-full p-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              ) : (
                                <span className={`text-sm break-words ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                  {jadwal.Lokasi}
                                </span>
                              )}
                            </td>

                            {/* Keterangan Column */}
                            <td className="px-4 py-4">
                              {isEditing ? (
                                <textarea
                                  value={currentEditData.Keterangan || ''}
                                  onChange={(e) => handleEditChange(jadwalId, 'Keterangan', e.target.value)}
                                  rows={3}
                                  className="w-full p-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                />
                              ) : (
                                <span className={`text-sm break-words ${isCompleted ? 'line-through text-gray-500' : 'text-gray-600'}`}>
                                  {jadwal.Keterangan}
                                </span>
                              )}
                            </td>

                            {/* Tampilkan Penanggung Jawab dari localState */}
                            <td className="px-4 py-4 text-sm text-gray-700">
                              {isCompleted ? (localState?.['Penanggung Jawab'] || '-') : '-'}
                            </td>

                            {/* Tampilkan Tanggal Selesai dari localState */}
                            <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                              {isCompleted ? (localState?.['Tanggal Selesai'] || '-') : '-'}
                            </td>

                            {/* Tampilkan Komentar dari localState */}
                            <td className="px-4 py-4 text-sm text-gray-600">
                              {isCompleted ? (localState?.Komentar || '-') : '-'}
                            </td>

                            {/* Action Column */}
                            <td className="px-4 py-4 text-center">
                              {isEditing ? (
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleSaveEdit(jadwalId)}
                                    disabled={isSubmitting}
                                    className="text-green-600 hover:text-green-800 disabled:opacity-50"
                                    title="Simpan"
                                  >
                                    <MdSave className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleCancelEdit(jadwalId)}
                                    disabled={isSubmitting}
                                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                    title="Batal"
                                  >
                                    <MdCancel className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleStartEdit(jadwalId, jadwal)}
                                  disabled={isDeleteMode || isCompleted || isChecklistConfirmModalOpen}
                                  className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Edit"
                                >
                                  <FiEdit2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="block lg:hidden w-full space-y-3">
              {loading ? (
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                    <p className="text-gray-500 text-sm">Memuat data jadwal...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                  <p className="text-red-500 text-sm">Error: {error}</p>
                </div>
              ) : jadwalData.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-500 text-sm">Data jadwal tidak tersedia</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {jadwalData.map((jadwal) => {
                    const jadwalId = jadwal.id;
                    const isEditing = editingRows.has(jadwalId);
                    const currentEditData = editData[jadwalId] || jadwal;
                    const localState = localChecklistState.get(jadwalId);
                    const isCompleted = localState?.isCompleted || false;

                    return (
                      <div
                        key={jadwalId}
                        className={`bg-white rounded-lg shadow-sm p-3 border border-gray-100 transition-all duration-200 ${
                          isDeleteMode && selectedForDelete.has(jadwalId)
                            ? 'bg-red-50 border-red-300 shadow-md'
                            : isCompleted
                              ? 'bg-green-50 border-green-200'
                              : ''
                        }`}
                      >
                        {/* Header with checkbox and status */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {/* Checklist Button */}
                            <button
                              onClick={() => handleChecklistToggle(jadwalId)}
                              disabled={isDeleteMode || isEditing}
                              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                isCompleted
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-gray-300 hover:border-green-400'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                              title={isCompleted ? "Batalkan Selesai" : "Tandai Selesai"}
                            >
                              {isCompleted && <FaCheck className="w-3 h-3" />}
                            </button>

                            {/* Status Text */}
                            <span className={`text-xs font-medium ${
                              isCompleted ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {isCompleted ? 'Selesai' : 'Belum Selesai'}
                            </span>
                          </div>

                          {/* Delete Mode Checkbox */}
                          {isDeleteMode && (
                            <input
                              type="checkbox"
                              checked={selectedForDelete.has(jadwalId)}
                              onChange={() => handleCheckboxChange(jadwalId)}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                          )}

                          {/* Edit Actions */}
                          {!isDeleteMode && (
                            <div className="flex items-center gap-2">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleSaveEdit(jadwalId)}
                                    disabled={isSubmitting}
                                    className="text-green-600 hover:text-green-800 disabled:opacity-50"
                                    title="Simpan"
                                  >
                                    <MdSave className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleCancelEdit(jadwalId)}
                                    disabled={isSubmitting}
                                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                    title="Batal"
                                  >
                                    <MdCancel className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleStartEdit(jadwalId, jadwal)}
                                  disabled={isCompleted || isChecklistConfirmModalOpen}
                                  className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Edit"
                                >
                                  <FiEdit2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                          {/* Lokasi */}
                          <div>
                            <span className="font-medium text-gray-800 text-sm">Lokasi:</span>
                            {isEditing ? (
                              <input
                                type="text"
                                value={currentEditData.Lokasi || ''}
                                onChange={(e) => handleEditChange(jadwalId, 'Lokasi', e.target.value)}
                                className="w-full mt-1 p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Masukkan lokasi"
                              />
                            ) : (
                              <p className={`text-sm mt-1 break-words ${
                                isCompleted ? 'line-through text-gray-500' : 'text-gray-700'
                              }`}>
                                {jadwal.Lokasi}
                              </p>
                            )}
                          </div>

                          {/* Keterangan */}
                          <div>
                            <span className="font-medium text-gray-800 text-sm">Keterangan:</span>
                            {isEditing ? (
                              <textarea
                                value={currentEditData.Keterangan || ''}
                                onChange={(e) => handleEditChange(jadwalId, 'Keterangan', e.target.value)}
                                rows={3}
                                className="w-full mt-1 p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                placeholder="Masukkan keterangan"
                              />
                            ) : (
                              <p className={`text-sm mt-1 break-words ${
                                isCompleted ? 'line-through text-gray-500' : 'text-gray-600'
                              }`}>
                                {jadwal.Keterangan}
                              </p>
                            )}
                          </div>

                          {/* Info Selesai (Mobile) */}
                          {isCompleted && localState && (
                            <div className="border-t border-gray-200 pt-2 mt-2">
                              <span className="font-medium text-gray-800 text-sm">Info Selesai:</span>
                              <div className="text-xs text-gray-600 mt-1 space-y-1">
                                {localState['Penanggung Jawab'] && <div><strong>Oleh:</strong> {localState['Penanggung Jawab']}</div>}
                                {localState['Tanggal Selesai'] && <div><strong>Tanggal:</strong> {localState['Tanggal Selesai']}</div>}
                                {localState.Komentar && <div><strong>Komentar:</strong> {localState.Komentar}</div>}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 bg-white rounded-lg shadow-md p-4 mx-1 sm:mx-2 lg:mx-4 xl:mx-auto max-w-4xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Ringkasan Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{jadwalData.length}</div>
                <div className="text-sm text-blue-700">Total Tugas</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                <div className="text-sm text-green-700">Selesai</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{uncompletedCount}</div>
                <div className="text-sm text-orange-700">Belum Selesai</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress Mingguan</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Schedule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-sm sm:text-lg md:text-xl font-semibold text-black w-full text-center">
                Tambah Jadwal Senin
              </h3>
              <button
                onClick={handleCloseAddModal}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-4 flex-shrink-0"
              >
                <IoClose className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Lokasi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="Lokasi"
                      value={formData.Lokasi}
                      onChange={handleInputChange}
                      placeholder="Masukkan lokasi (contoh: Server Radar Lantai 4)"
                      className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Keterangan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="Keterangan"
                      value={formData.Keterangan}
                      onChange={handleInputChange}
                      placeholder="Masukkan keterangan kegiatan (contoh: membersihkan ruang server radar dan instrumen)"
                      rows={4}
                      className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      required
                    />
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Catatan:</strong> Tugas yang ditambahkan akan otomatis memiliki status "Belum Selesai"
                      dan dapat dicentang ketika sudah dikerjakan.
                    </p>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseAddModal}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-black bg-red-400 rounded sm:rounded-md hover:bg-red-600 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm bg-green-600 text-white rounded sm:rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Menambah...' : 'Tambah'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Confirmation Modal (Single Item) */}
      {isChecklistConfirmModalOpen && currentChecklistItemToUpdate && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-sm sm:text-lg md:text-xl font-semibold text-black w-full text-center">
                Konfirmasi Penyelesaian Tugas
              </h3>
              <button
                onClick={handleCloseChecklistConfirmModal}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-4 flex-shrink-0"
              >
                <IoClose className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6">
              <form onSubmit={handleSubmitChecklistConfirm}>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">Tugas: <span className="font-normal">{currentChecklistItemToUpdate.Lokasi} - {currentChecklistItemToUpdate.Keterangan}</span></p>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Penanggung Jawab <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="Penanggung Jawab"
                      value={checklistFormDetails['Penanggung Jawab']}
                      onChange={handleChecklistFormDetailsChange}
                      placeholder="Nama lengkap penanggung jawab"
                      className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Tanggal Selesai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="Tanggal Selesai"
                      value={checklistFormDetails['Tanggal Selesai']}
                      onChange={handleChecklistFormDetailsChange}
                      className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Komentar Tambahan
                    </label>
                    <textarea
                      name="Komentar"
                      value={checklistFormDetails.Komentar}
                      onChange={handleChecklistFormDetailsChange}
                      placeholder="Tambahkan komentar atau detail tambahan (opsional)"
                      rows={3}
                      className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseChecklistConfirmModal}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-black bg-red-400 rounded sm:rounded-md hover:bg-red-600 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm bg-green-600 text-white rounded sm:rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Tandai Selesai'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Senin1;