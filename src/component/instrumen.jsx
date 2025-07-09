  import React, { useState, useEffect, useMemo } from 'react';
  import Header from './Header'; 
  import Sidebar from './sidebar'; 
  import Footer from './Footer'; 
  import { AiTwotoneFileAdd } from "react-icons/ai";
  import { IoClose } from "react-icons/io5";
  import { FaCheck } from "react-icons/fa";
  import { FiEdit2 } from "react-icons/fi";
  import { FiTrash2 } from "react-icons/fi";
  import Swal from 'sweetalert2';

  const DaftarInstrumenPage = () => {
    const [instrumenData, setInstrumenData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedInstrumen, setSelectedInstrumen] = useState(null);
    const [selectedKodeCategory, setSelectedKodeCategory] = useState('');
    const [kodeCategoryOptions, setKodeCategoryOptions] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete state
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [selectedForDelete, setSelectedForDelete] = useState(new Set());

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});

    // Form state untuk add modal
    const [formData, setFormData] = useState({
      Kode: '',
      NoPeralatan: '',
      Peralatan: '',
      'Tahun Pengadaan': '',
      'Nama Pemilik Alat': '',
      Lokasi: '',
      Posisi: '',
      'Jenis Alat': '',
      Merk: '',
      Type: '',
      Produsen: '',
      'S/N': '',
      'Rentang Ukur': '',
      'Skala Terkecil': '',
      Akurasi: '',
      Infill: '',
      Kelengkapan: '',
      'Tanggal Inventarisasi': '',
      'Kalibrasi Terakhir': '',
      Keterangan: ''
    });

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
      // Reset delete mode when category changes
      setIsDeleteMode(false);
      setSelectedForDelete(new Set());
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

    const handleOpenAddModal = () => {
      setIsAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
      setIsAddModalOpen(false);
      setFormData({
        Kode: '',
        NoPeralatan: '',
        Peralatan: '',
        'Tahun Pengadaan': '',
        'Nama Pemilik Alat': '',
        Lokasi: '',
        Posisi: '',
        'Jenis Alat': '',
        Merk: '',
        Type: '',
        Produsen: '',
        'S/N': '',
        'Rentang Ukur': '',
        'Skala Terkecil': '',
        Akurasi: '',
        Infill: '',
        Kelengkapan: '',
        'Tanggal Inventarisasi': '',
        'Kalibrasi Terakhir': '',
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
    const handleDeleteInstrumen = () => {
      setIsDeleteMode(true);
      setSelectedForDelete(new Set());
    };

    const handleCancelDelete = () => {
      setIsDeleteMode(false);
      setSelectedForDelete(new Set());
    };

    const handleCheckboxChange = (instrumenKode) => {
      setSelectedForDelete(prev => {
        const newSet = new Set(prev);
        if (newSet.has(instrumenKode)) {
          newSet.delete(instrumenKode);
        } else {
          newSet.add(instrumenKode);
        }
        return newSet;
      });
    };

    const handleSelectAll = () => {
      if (selectedForDelete.size === filteredInstrumenData.length) {
        // Unselect all
        setSelectedForDelete(new Set());
      } else {
        // Select all
        const allKodes = new Set(filteredInstrumenData.map(instrumen => instrumen.Kode));
        setSelectedForDelete(allKodes);
      }
    };

    const handleConfirmDelete = async () => {
      if (selectedForDelete.size === 0) {
        await Swal.fire({
          title: 'Peringatan!',
          text: 'Pilih minimal satu instrumen untuk dihapus.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }

      const result = await Swal.fire({
        title: 'Konfirmasi Hapus',
        text: `Apakah Anda yakin ingin menghapus ${selectedForDelete.size} instrumen yang dipilih?`,
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
          
          // Simulasi API call untuk delete - ganti dengan actual API call
          console.log('Deleting instruments with codes:', Array.from(selectedForDelete));
          
          // Simulasi delay untuk API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Update data di state - hapus instrumen yang dipilih
          setInstrumenData(prev => 
            prev.filter(instrumen => !selectedForDelete.has(instrumen.Kode))
          );
          
          // Reset delete mode
          setIsDeleteMode(false);
          setSelectedForDelete(new Set());
          
          // Show success message
          await Swal.fire({
            title: 'Berhasil!',
            text: `${selectedForDelete.size} instrumen berhasil dihapus.`,
            icon: 'success',
            confirmButtonText: 'OK'
          });
          
        } catch (error) {
          console.error('Error deleting instruments:', error);
          await Swal.fire({
            title: 'Error!',
            text: 'Gagal menghapus instrumen. Silakan coba lagi.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        } finally {
          setIsSubmitting(false);
        }
      }
    };

    // Edit functions
    const handleEdit = () => {
      setIsEditing(true);
      setEditData({ ...selectedInstrumen });
    };

    const handleEditInputChange = (e) => {
      const { name, value } = e.target;
      setEditData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSaveEdit = async () => {
      try {
        // Show confirmation dialog
        const result = await Swal.fire({
          title: 'Konfirmasi Edit',
          text: 'Apakah Anda yakin ingin menyimpan perubahan?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Ya, Simpan',
          cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
          setIsSubmitting(true);
          
          // Simulasi API call untuk update - ganti dengan actual API call
          console.log('Updated instrument data:', editData);
          
          // Simulasi delay untuk API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Update data di state
          setInstrumenData(prev => 
            prev.map(item => 
              item.Kode === editData.Kode ? editData : item
            )
          );
          
          setSelectedInstrumen(editData);
          setIsEditing(false);
          
          // Show success message
          await Swal.fire({
            title: 'Berhasil!',
            text: 'Data instrumen berhasil diperbarui.',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        }
      } catch (error) {
        console.error('Error updating instrument:', error);
        await Swal.fire({
          title: 'Error!',
          text: 'Gagal memperbarui data instrumen. Silakan coba lagi.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleCancelEdit = () => {
      setIsEditing(false);
      setEditData({});
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Show confirmation dialog before adding
      const result = await Swal.fire({
        title: 'Konfirmasi Tambah Instrumen',
        text: 'Apakah data instrumen yang akan ditambahkan sudah sesuai?',
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
          // Simulasi API call - ganti dengan actual API call
          console.log('New instrument data:', formData);
          
          // Simulasi delay untuk API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Show success message
          await Swal.fire({
            title: 'Berhasil!',
            text: 'Data instrumen berhasil ditambahkan.',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          
          // Close modal and reset form
          setIsAddModalOpen(false);
          handleCloseAddModal();
          
        } catch (error) {
          console.error('Error adding instrument:', error);
          await Swal.fire({
            title: 'Error!',
            text: 'Gagal menambahkan data instrumen. Silakan coba lagi.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        } finally {
          setIsSubmitting(false);
        }
      }
    };

    const renderEditableField = (label, fieldName, value, type = 'text') => {
      const isCurrentlyEditing = isEditing;
      const currentValue = isCurrentlyEditing ? editData[fieldName] || '' : value || '';
      
      return (
        <div className="bg-white p-2 sm:p-3 rounded border-l-4 border-blue-500">
          <span className="font-medium text-black block sm:inline">{label}:</span>
          {isCurrentlyEditing ? (
            type === 'textarea' ? (
              <textarea
                name={fieldName}
                value={currentValue}
                onChange={handleEditInputChange}
                className="ml-0 sm:ml-2 block sm:inline w-full sm:w-auto mt-1 sm:mt-0 p-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            ) : (
              <input
                type={type}
                name={fieldName}
                value={currentValue}
                onChange={handleEditInputChange}
                className="ml-0 sm:ml-2 block sm:inline w-full sm:w-auto mt-1 sm:mt-0 p-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )
          ) : (
            <span className="ml-0 sm:ml-2 block sm:inline break-words">{currentValue}</span>
          )}
        </div>
      );
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
            <div className="mb-4 sm:mb-6 md:mb-2 mx-1 sm:mx-2 lg:mx-4 xl:mx-auto max-w-7xl">
              <div className="w-full">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 md:p-6 lg:p-8 rounded-lg  mx-1 sm:mx-2 lg:mx-4 xl:mx-auto max-w-7xl">
                  {/* Label */}
                  <label className="font-medium text-[10px] sm:text-base md:text-[15px] text-gray-700 text-center lg:text-center whitespace-nowrap lg:min-w-max">
                    Filter Berdasarkan Kategori Kode:
                  </label>
                  
                  {/* Filter dan Button Container */}
                  <div className="flex flex-row items-center gap-3 sm:gap-4 w-full lg:flex-1">
                    {/* Select Dropdown */}
                    <select
                      className="flex-1 min-w-0 rounded-lg  border border-gray-300 p-2 sm:p-2.5 text-[10px] sm:text-[14px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
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
                    
                    {/* Button Group */}
                    <div className="flex items-center gap-0 sm:gap-0 flex-shrink-0">
                      {/* Add Button - Hanya tampil di halaman utama */}
                      {!selectedInstrumen && (
                        <button 
                          className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 hover:bg-gray-100 rounded-lg transition-colors group"
                          onClick={handleOpenAddModal}
                          title="Tambah Instrumen"
                        >
                          <AiTwotoneFileAdd className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600 group-hover:text-blue-600" />
                        </button>
                      )}
                      
                      {/* Delete Button */}
                      {!selectedInstrumen && (
                        <button 
                          className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 hover:bg-red-100 rounded-lg transition-colors group"
                          onClick={handleDeleteInstrumen}
                          title="Hapus Instrumen"
                        >
                          <FiTrash2 className="w-4 h-4 sm:w-6 sm:h-6 text-red-500 group-hover:text-red-700" />
                        </button>
                      )}
                    </div>
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
                      {selectedForDelete.size} dari {filteredInstrumenData.length} instrumen dipilih
                    </span>
                  </div>
                  <div className="flex flex-row items-center gap-1 sm:gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleSelectAll}
                      className="flex-1 sm:flex-initial px-2 py-1.5 text-xs sm:text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      {selectedForDelete.size === filteredInstrumenData.length ? 'Batal Pilih' : 'Pilih Semua'}
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

            {selectedInstrumen ? (
              // Detail instrumen yang dipilih
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3  sm:p-4 md:p-6 shadow-md mb-4 sm:mb-6 md:mb-8 w-full max-w-6xl mx-auto">
                <div className="flex flex-col gap-4 sm:gap-6">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold text-black text-center break-words flex-1">
                        {selectedInstrumen.NoPeralatan} ({selectedInstrumen.Kode})
                      </h3>
                      {/* Edit Button */}
                      <div className="flex items-center gap-2 -ml-9">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              disabled={isSubmitting}
                              className="flex items-center gap-1  text-blue-500 rounded hover:bg-green-200 transition-colors disabled:opacity-50 text-sm"
                            >
                              <FaCheck className="w-4 h-3 sm:w-4 sm:h-4" />
                              {isSubmitting ? 'Menyimpan...' : ''}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={isSubmitting}
                              className="flex items-center gap-1  text-red-500 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
                            >
                              <IoClose className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={handleEdit}
                            className="flex items-center gap-1 px-3 py-1 text-blue-600 rounded hover:bg-blue-700 transition-colors text-sm"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:gap-3 text-gray-700 text-xs sm:text-sm md:text-base">
                      {renderEditableField('Kode Alat', 'Kode', selectedInstrumen.Kode)}
                      {renderEditableField('Peralatan', 'Peralatan', selectedInstrumen.Peralatan)}
                      {renderEditableField('Tahun Pengadaan', 'Tahun Pengadaan', selectedInstrumen["Tahun Pengadaan"])}
                      {renderEditableField('Nama Pemilik Alat', 'Nama Pemilik Alat', selectedInstrumen["Nama Pemilik Alat"])}
                      {renderEditableField('Lokasi', 'Lokasi', selectedInstrumen.Lokasi)}
                      {renderEditableField('Jenis Alat', 'Jenis Alat', selectedInstrumen["Jenis Alat"])}
                      {renderEditableField('Merk', 'Merk', selectedInstrumen.Merk)}
                      {renderEditableField('Type', 'Type', selectedInstrumen.Type)}
                      {renderEditableField('Produsen', 'Produsen', selectedInstrumen.Produsen)}
                      {renderEditableField('S/N', 'S/N', selectedInstrumen["S/N"])}
                      {renderEditableField('Rentang Ukur', 'Rentang Ukur', selectedInstrumen["Rentang Ukur"])}
                      {renderEditableField('Skala Terkecil', 'Skala Terkecil', selectedInstrumen["Skala Terkecil"])}
                      {renderEditableField('Akurasi', 'Akurasi', selectedInstrumen.Akurasi)}
                      {renderEditableField('Unit', 'Unit', selectedInstrumen.Unit)}
                      {renderEditableField('Kelengkapan', 'Kelengkapan', selectedInstrumen.Kelengkapan)}
                      {renderEditableField('Tanggal Inventarisasi', 'Tanggal Inventarisasi', selectedInstrumen["Tanggal Inventarisasi"], 'date')}
                      {renderEditableField('Keterangan', 'Keterangan', selectedInstrumen.Keterangan, 'textarea')}
                      {renderEditableField('Kalibrasi Terakhir', 'Kalibrasi Terakhir', selectedInstrumen["Kalibrasi Terakhir"], 'date')}
                      {renderEditableField('Sejak', 'Sejak', selectedInstrumen.Sejak)}
                      {renderEditableField('Posisi', 'Posisi', selectedInstrumen.Posisi)}
                    </div>
                    
                    {/* Tombol Kembali hanya ditampilkan ketika TIDAK sedang editing */}
                    {!isEditing && (
                      <button
                        onClick={() => {
                          setSelectedInstrumen(null);
                          setIsEditing(false);
                          setEditData({});
                        }}
                        className="mt-6 w-full sm:w-auto px-6 py-3 bg-[#0066CC] text-white font-semibold rounded-lg shadow-md hover:bg-[#0066CC]/50 
                        transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-[10px] sm:text-base"
                      >
                        ← Kembali ke Daftar Instrumen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              
              // Tabel/Card daftar semua instrumen (atau yang difilter)
              <div className="flex justify-center px-2 sm:px-4 lg:px-6 xl:px-8">
                {/* Desktop Table View (lg and above) */}
                <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden w-full max-w-7xl">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="bg-[#0066CC] text-white">
                          {isDeleteMode && (
                            <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-white uppercase tracking-wider w-12">
                              <input
                                type="checkbox"
                                checked={selectedForDelete.size === filteredInstrumenData.length && filteredInstrumenData.length > 0}
                                onChange={handleSelectAll}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </th>
                          )}
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/4">Kode</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/3">Peralatan</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/4">Posisi</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/3">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                          <tr>
                            <td colSpan={isDeleteMode ? 5 : 4} className="px-6 py-8 text-center text-sm text-gray-500">
                              <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                Memuat data instrumen...
                              </div>
                            </td>
                          </tr>
                        ) : error ? (
                          <tr>
                            <td colSpan={isDeleteMode ? 5 : 4} className="px-6 py-8 text-center text-sm text-red-500">
                              <div className="flex flex-col items-center">
                                <svg className="w-8 h-8 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                Error: {error}
                              </div>
                            </td>
                          </tr>
                        ) : filteredInstrumenData.length === 0 ? (
                          <tr>
                            <td colSpan={isDeleteMode ? 5 : 4} className="px-6 py-8 text-center text-sm text-gray-500">
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
                              key={instrumen.Kode} 
                              className={`hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                                isDeleteMode && selectedForDelete.has(instrumen.Kode) 
                                  ? 'bg-red-50 border-red-200' 
                                  : ''
                              }`}
                              onClick={() => {
                                if (isDeleteMode) {
                                  handleCheckboxChange(instrumen.Kode);
                                } else {
                                  setSelectedInstrumen(instrumen);
                                }
                              }}
                            >
                              {isDeleteMode && (
                                <td className="px-3 py-4 text-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedForDelete.has(instrumen.Kode)}
                                    onChange={() => handleCheckboxChange(instrumen.Kode)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                  />
                                </td>
                              )}
                              <td className="px-4 py-4 text-left text-sm text-gray-600 break-all">{instrumen.Kode}</td>
                              <td className="px-4 py-4 text-left text-sm text-gray-900 break-words">{instrumen.Peralatan}</td>
                              <td className="px-4 py-4 text-left text-sm text-gray-600 break-words">{instrumen.Posisi}</td>
                              <td className="px-4 py-4 text-left text-sm text-gray-600 break-words max-w-xs" title={instrumen.Keterangan}>
                                <div className="truncate">{instrumen.Keterangan}</div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tablet Table View (md to lg) */}
                <div className="hidden md:block lg:hidden bg-white rounded-lg shadow-md overflow-hidden w-full">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="bg-[#0066CC] text-white">
                          {isDeleteMode && (
                            <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-white uppercase tracking-wider w-10">
                              <input
                                type="checkbox"
                                checked={selectedForDelete.size === filteredInstrumenData.length && filteredInstrumenData.length > 0}
                                onChange={handleSelectAll}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </th>
                          )}
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Kode</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Peralatan</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Posisi</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                          <tr>
                            <td colSpan={isDeleteMode ? 4 : 3} className="px-4 py-6 text-center text-sm text-gray-500">
                              <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                                Memuat data instrumen...
                              </div>
                            </td>
                          </tr>
                        ) : error ? (
                          <tr>
                            <td colSpan={isDeleteMode ? 4 : 3} className="px-4 py-6 text-center text-sm text-red-500">
                              <div className="flex flex-col items-center">
                                <svg className="w-6 h-6 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                Error: {error}
                              </div>
                            </td>
                          </tr>
                        ) : filteredInstrumenData.length === 0 ? (
                          <tr>
                            <td colSpan={isDeleteMode ? 4 : 3} className="px-4 py-6 text-center text-sm text-gray-500">
                              <div className="flex flex-col items-center">
                                <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                Data instrumen tidak tersedia
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredInstrumenData.map((instrumen, index) => (
                            <tr 
                              key={instrumen.Kode} 
                              className={`hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                                isDeleteMode && selectedForDelete.has(instrumen.Kode) 
                                  ? 'bg-red-50 border-red-200' 
                                  : ''
                              }`}
                              onClick={() => {
                                if (isDeleteMode) {
                                  handleCheckboxChange(instrumen.Kode);
                                } else {
                                  setSelectedInstrumen(instrumen);
                                }
                              }}
                            >
                              {isDeleteMode && (
                                <td className="px-2 py-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedForDelete.has(instrumen.Kode)}
                                    onChange={() => handleCheckboxChange(instrumen.Kode)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                  />
                                </td>
                              )}
                              <td className="px-3 py-3 text-left text-sm text-gray-600 break-all">{instrumen.Kode}</td>
                              <td className="px-3 py-3 text-left text-sm text-gray-900 break-words">
                                <div className="font-medium">{instrumen.Peralatan}</div>
                                {instrumen.Keterangan && (
                                  <div className="text-xs text-gray-500 mt-1 truncate" title={instrumen.Keterangan}>
                                    {instrumen.Keterangan}
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-3 text-left text-sm text-gray-600 break-words">{instrumen.Posisi}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card View (sm and below) */}
                <div className="block md:hidden w-full space-y-3">
                  {loading ? (
                    <div className="bg-white rounded-lg shadow-md p-4 text-center">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                        <p className="text-gray-500 text-sm">Memuat data instrumen...</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="bg-white rounded-lg shadow-md p-4 text-center">
                      <div className="flex flex-col items-center">
                        <svg className="w-6 h-6 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-red-500 text-sm">Error: {error}</p>
                      </div>
                    </div>
                  ) : filteredInstrumenData.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                      <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-gray-500 text-sm">Data instrumen tidak tersedia</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredInstrumenData.map((instrumen, index) => (
                        <div 
                          key={instrumen.Kode} 
                          className={`bg-white rounded-lg shadow-sm p-3 cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-100 ${
                            isDeleteMode && selectedForDelete.has(instrumen.Kode) 
                              ? 'bg-red-50 border-red-300 shadow-md' 
                              : ''
                          }`}
                          onClick={() => {
                            if (isDeleteMode) {
                              handleCheckboxChange(instrumen.Kode);
                            } else {
                              setSelectedInstrumen(instrumen);
                            }
                          }}
                        >
                          {isDeleteMode && (
                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
                              <span className="text-xs font-medium text-red-600">
                                Mode Hapus - Klik untuk memilih
                              </span>
                              <input
                                type="checkbox"
                                checked={selectedForDelete.has(instrumen.Kode)}
                                onChange={() => handleCheckboxChange(instrumen.Kode)}
                                onClick={(e) => e.stopPropagation()}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                              />
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h3 className="font-semibold text-gray-900 text-sm leading-tight break-words flex-1 mr-2">
                                {instrumen.Peralatan}
                              </h3>
                              {!isDeleteMode && (
                                <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div className="flex items-start">
                                <span className="font-medium min-w-[45px] text-gray-800">Kode:</span>
                                <span className="break-all text-gray-600">{instrumen.Kode}</span>
                              </div>
                              <div className="flex items-start">
                                <span className="font-medium min-w-[45px] text-gray-800">Posisi:</span>
                                <span className="break-words text-gray-600">{instrumen.Posisi}</span>
                              </div>
                              {instrumen.Keterangan && (
                                <div className="flex items-start">
                                  <span className="font-medium min-w-[45px] text-gray-800">Ket:</span>
                                  <span className="break-words text-gray-600 line-clamp-2">{instrumen.Keterangan}</span>
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
      
      {/* Add Instrument Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[55vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-sm sm:text-lg md:text-xl font-semibold text-black w-full text-center">
                Masukkan Data Instrumen
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
                {/* Desktop: Two-column layout with proper alignment */}
                <div className="hidden lg:block">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Row 1 - Kode */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <label className="col-span-2 text-sm font-medium text-gray-700 bg-blue-50 py-3 px-4 rounded-md">
                          Kode <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="Kode"
                          value={formData.Kode}
                          onChange={handleInputChange}
                          placeholder="Masukkan kode instrumen"
                          className="col-span-3 py-3 px-4 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      
                      {/* Row 2 - Peralatan */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <label className="col-span-2 text-sm font-medium text-gray-700 bg-gray-50 py-3 px-4 rounded-md">
                          Peralatan <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="Peralatan"
                          value={formData.Peralatan}
                          onChange={handleInputChange}
                          placeholder="Masukkan nama peralatan"
                          className="col-span-3 py-3 px-4 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      
                      {/* Row 3 - Tahun Pengadaan */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <label className="col-span-2 text-sm font-medium text-gray-700 bg-gray-50 py-3 px-4 rounded-md">
                          Tahun Pengadaan
                        </label>
                        <input
                          type="text"
                          name="Tahun Pengadaan"
                          value={formData["Tahun Pengadaan"]}
                          onChange={handleInputChange}
                          placeholder="Masukkan tahun pengadaan"
                          className="col-span-3 py-3 px-4 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Row 4 - Nama Pemilik Alat */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <label className="col-span-2 text-sm font-medium text-gray-700 bg-gray-50 py-3 px-4 rounded-md">
                          Nama Pemilik Alat
                        </label>
                        <input
                          type="text"
                          name="Nama Pemilik Alat"
                          value={formData["Nama Pemilik Alat"]}
                          onChange={handleInputChange}
                          placeholder="Masukkan nama pemilik alat"
                          className="col-span-3 py-3 px-4 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Row 5 - Lokasi */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <label className="col-span-2 text-sm font-medium text-gray-700 bg-gray-50 py-3 px-4 rounded-md">
                          Lokasi
                        </label>
                        <input
                          type="text"
                          name="Lokasi"
                          value={formData.Lokasi}
                          onChange={handleInputChange}
                          placeholder="Masukkan lokasi"
                          className="col-span-3 py-3 px-4 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Row 6 - Jenis Alat */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <label className="col-span-2 text-sm font-medium text-gray-700 bg-gray-50 py-3 px-4 rounded-md">
                          Jenis Alat
                        </label>
                        <input
                          type="text"
                          name="Jenis Alat"
                          value={formData["Jenis Alat"]}
                          onChange={handleInputChange}
                          placeholder="Masukkan jenis alat"
                          className="col-span-3 py-3 px-4 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Row 7 - Merk */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <label className="col-span-2 text-sm font-medium text-gray-700 bg-gray-50 py-3 px-4 rounded-md">
                          Merk
                        </label>
                        <input
                          type="text"
                          name="Merk"
                          value={formData.Merk}
                          onChange={handleInputChange}
                          placeholder="Masukkan merk"
                          className="col-span-3 py-3 px-4 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Row 8 - Type */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <label className="col-span-2 text-sm font-medium text-gray-700 bg-gray-50 py-3 px-4 rounded-md">
                          Type
                        </label>
                        <input
                          type="text"
                          name="Type"
                          value={formData.Type}
                          onChange={handleInputChange}
                          placeholder="Masukkan type"
                          className="col-span-3 py-3 px-4 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Row 9 - Produsen */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <label className="col-span-2 text-sm font-medium text-gray-700 bg-gray-50 py-3 px-4 rounded-md">
                          Produsen
                        </label>
                        <input
                          type="text"
                          name="Produsen"
                          value={formData.Produsen}
                          onChange={handleInputChange}
                          placeholder="Masukkan produsen"
                          className="col-span-3 py-3 px-4 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Row 1 - S/N */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <label className="col-span-2 text-sm font-medium text-gray-700 bg-gray-50 py-3 px-4 rounded-md">
                          S/N
                        </label>
                        <input
                          type="text"
                          name="S/N"
                          value={formData["S/N"]}
                          onChange={handleInputChange}
                          placeholder="Masukkan serial number"
                          className="col-span-3 py-3 px-4 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Row 2 - Rentang Ukur */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <label className="col-span-2 text-sm font-medium text-gray-700 bg-gray-50 py-3 px-4 rounded-md">
                          Rentang Ukur
                        </label>
                        <input
                          type="text"
                          name="Rentang Ukur"
                          value={formData["Rentang Ukur"]}
                          onChange={handleInputChange}
                          placeholder="Masukkan rentang ukur"
                          className="col-span-3 py-3 px-4 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Row 3 - Skala Terkecil */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <label className="col-span-2 text-sm font-medium text-gray-700 bg-gray-50 py-3 px-4 rounded-md">
                          Skala Terkecil
                        </label>
                        <input
                          type="text"
                          name="Skala Terkecil"
                          value={formData["Skala Terkecil"]}
                          onChange={handleInputChange}
                          placeholder="Masukkan skala terkecil"
                          className="col-span-3 py-3 px-4 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Row 4 - Akurasi */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <label className="col-span-2 text-sm font-medium text-gray-700 bg-gray-50 py-3 px-4 rounded-md">
                          Akurasi
                        </label>
                        <input
                          type="text"
                          name="Akurasi"
                          value={formData.Akurasi}
                          onChange={handleInputChange}
                          placeholder="Masukkan akurasi"
                          className="col-span-3 py-3 px-4 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Row 5 - Infill */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <label className="col-span-2 text-sm font-medium text-gray-700 bg-blue-50 py-3 px-4 rounded-md">
                          Infill
                        </label>
                        <input
                          type="text"
                          name="Infill"
                          value={formData.Infill}
                          onChange={handleInputChange}
                          placeholder="Masukkan infill"
                          className="col-span-3 py-3 px-4 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Row 6 - Kelengkapan */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <label className="col-span-2 text-sm font-medium text-gray-700 bg-gray-50 py-3 px-4 rounded-md">
                          Kelengkapan
                        </label>
                        <input
                          type="text"
                          name="Kelengkapan"
                          value={formData.Kelengkapan}
                          onChange={handleInputChange}
                          placeholder="Masukkan kelengkapan"
                          className="col-span-3 py-3 px-4 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Row 7 - Tanggal Inventarisasi */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <label className="col-span-2 text-sm font-medium text-gray-700 bg-gray-50 py-3 px-4 rounded-md">
                          Tanggal Inventarisasi
                        </label>
                        <input
                          type="date"
                          name="Tanggal Inventarisasi"
                          value={formData["Tanggal Inventarisasi"]}
                          onChange={handleInputChange}
                          className="col-span-3 py-3 px-4 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Row 8 - Kalibrasi Terakhir */}
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <label className="col-span-2 text-sm font-medium text-gray-700 bg-gray-50 py-3 px-4 rounded-md">
                          Kalibrasi Terakhir
                        </label>
                        <input
                          type="date"
                          name="Kalibrasi Terakhir"
                          value={formData["Kalibrasi Terakhir"]}
                          onChange={handleInputChange}
                          className="col-span-3 py-3 px-4 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Row 9 - Keterangan */}
                      <div className="grid grid-cols-5 gap-4 items-start">
                        <label className="col-span-2 text-sm font-medium text-gray-700 bg-gray-50 py-3 px-4 rounded-md">
                          Keterangan
                        </label>
                        <textarea
                          name="Keterangan"
                          value={formData.Keterangan}
                          onChange={handleInputChange}
                          placeholder="Masukkan keterangan"
                          rows={3}
                          className="col-span-3 py-3 px-4 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile: Stack layout */}
                <div className="block lg:hidden">
                  <div className="space-y-4">
                    {/* Mobile fields remain the same as original */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Kode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="Kode"
                        value={formData.Kode}
                        onChange={handleInputChange}
                        placeholder="Masukkan kode instrumen"
                        className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Peralatan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="Peralatan"
                        value={formData.Peralatan}
                        onChange={handleInputChange}
                        placeholder="Masukkan nama peralatan"
                        className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Tahun Pengadaan
                      </label>
                      <input
                        type="text"
                        name="Tahun Pengadaan"
                        value={formData["Tahun Pengadaan"]}
                        onChange={handleInputChange}
                        placeholder="Masukkan tahun pengadaan"
                        className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Nama Pemilik Alat
                      </label>
                      <input
                        type="text"
                        name="Nama Pemilik Alat"
                        value={formData["Nama Pemilik Alat"]}
                        onChange={handleInputChange}
                        placeholder="Masukkan nama pemilik alat"
                        className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Lokasi
                      </label>
                      <input
                        type="text"
                        name="Lokasi"
                        value={formData.Lokasi}
                        onChange={handleInputChange}
                        placeholder="Masukkan lokasi"
                        className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Jenis Alat
                      </label>
                      <input
                        type="text"
                        name="Jenis Alat"
                        value={formData["Jenis Alat"]}
                        onChange={handleInputChange}
                        placeholder="Masukkan jenis alat"
                        className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Merk
                      </label>
                      <input
                        type="text"
                        name="Merk"
                        value={formData.Merk}
                        onChange={handleInputChange}
                        placeholder="Masukkan merk"
                        className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Type
                      </label>
                      <input
                        type="text"
                        name="Type"
                        value={formData.Type}
                        onChange={handleInputChange}
                        placeholder="Masukkan type"
                        className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Produsen
                      </label>
                      <input
                        type="text"
                        name="Produsen"
                        value={formData.Produsen}
                        onChange={handleInputChange}
                        placeholder="Masukkan produsen"
                        className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        S/N
                      </label>
                      <input
                        type="text"
                        name="S/N"
                        value={formData["S/N"]}
                        onChange={handleInputChange}
                        placeholder="Masukkan serial number"
                        className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Rentang Ukur
                      </label>
                      <input
                        type="text"
                        name="Rentang Ukur"
                        value={formData["Rentang Ukur"]}
                        onChange={handleInputChange}
                        placeholder="Masukkan rentang ukur"
                        className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Skala Terkecil
                      </label>
                      <input
                        type="text"
                        name="Skala Terkecil"
                        value={formData["Skala Terkecil"]}
                        onChange={handleInputChange}
                        placeholder="Masukkan skala terkecil"
                        className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Akurasi
                      </label>
                      <input
                        type="text"
                        name="Akurasi"
                        value={formData.Akurasi}
                        onChange={handleInputChange}
                        placeholder="Masukkan akurasi"
                        className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Infill
                      </label>
                      <input
                        type="text"
                        name="Infill"
                        value={formData.Infill}
                        onChange={handleInputChange}
                        placeholder="Masukkan infill"
                        className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Kelengkapan
                      </label>
                      <input
                        type="text"
                        name="Kelengkapan"
                        value={formData.Kelengkapan}
                        onChange={handleInputChange}
                        placeholder="Masukkan kelengkapan"
                        className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Tanggal Inventarisasi
                      </label>
                      <input
                        type="date"
                        name="Tanggal Inventarisasi"
                        value={formData["Tanggal Inventarisasi"]}
                        onChange={handleInputChange}
                        className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Kalibrasi Terakhir
                      </label>
                      <input
                        type="date"
                        name="Kalibrasi Terakhir"
                        value={formData["Kalibrasi Terakhir"]}
                        onChange={handleInputChange}
                        className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Keterangan
                      </label>
                      <textarea
                        name="Keterangan"
                        value={formData.Keterangan}
                        onChange={handleInputChange}
                        placeholder="Masukkan keterangan"
                        rows={3}
                        className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </div>
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
        </div>
      )}
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DaftarInstrumenPage;