import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../component/Header";
import Sidebar from "../component/sidebar";
import Footer from "../component/Footer";
import Swal from 'sweetalert2';
import { IoClose } from "react-icons/io5";
import { FiEdit2 } from "react-icons/fi";
import { FiTrash2 } from "react-icons/fi";
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
    const [showCharts, setShowCharts] = useState(false);
    const [showEquipmentCharts, setShowEquipmentCharts] = useState(false); // New state for equipment charts view
    const [selectedEquipment, setSelectedEquipment] = useState(null); // New state for selected equipment

    // States untuk modal Tambah Entri Peralatan (Peralatan & Keterangan)
    const [showAddEntryModal, setShowAddEntryModal] = useState(false);
    const [newPeralatan, setNewPeralatan] = useState("");
    const [newKeterangan, setNewKeterangan] = useState("");
    const [newBuktiFotoFile, setNewBuktiFotoFile] = useState(null); // State untuk file foto baru
    const [isUploading, setIsUploading] = useState(false); // State untuk status upload

    // States untuk modal Tambah Penanggung Jawab & Tanggal BARU
    const [showAddPersonDateModal, setShowAddPersonDateModal] = useState(false);
    const [newPersonDatePenanggungJawab, setNewPersonDatePenanggungJawab] = useState("");
    const [newPersonDateTanggal, setNewPersonDateTanggal] = useState("");

    // States untuk modal Edit Entri Logbook
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editedPeralatan, setEditedPeralatan] = useState("");
    const [editedKeterangan, setEditedKeterangan] = useState("");
    const [editedBuktiFotoFile, setEditedBuktiFotoFile] = useState(null); // State untuk file foto yang diedit
    const [editedBuktiFotoURL, setEditedBuktiFotoURL] = useState(""); // State untuk URL foto yang sudah ada

    // States untuk modal Edit Penanggung Jawab & Tanggal
    const [showEditPersonDateModal, setShowEditPersonDateModal] = useState(false);
    const [editingPersonDateCombo, setEditingPersonDateCombo] = useState(null);
    const [editedPersonDatePenanggungJawab, setEditedPersonDatePenanggungJawab] = useState("");
    const [editedPersonDateTanggal, setEditedPersonDateTanggal] = useState("");

    // State untuk menu kebab (titik tiga)
    const [openKebabMenuId, setOpenKebabMenuId] = useState(null);
    const { userRole, logout } = useAuth();

    useEffect(() => {
      if (!userRole || (userRole !== "admin" && userRole !== "user")) {
        navigate('/');
      }
    }, [userRole, navigate]);

    // URL API Logbook (tetap sama)
    const LOGBOOK_API_URL =
        "https://script.google.com/macros/s/AKfycbzx8LbGA284ZXj_xg7hRqaF2GQe3TgNwBe8f7v1EkFmrRTd67AcUiAf6BEEqnFWbO5qQA/exec";

    // --- Fungsi Pengambilan Data Logbook ---
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
            const apiResponse = await response.json();

            if (apiResponse.success) {
                if (Array.isArray(apiResponse.data)) {
                    setLogbookData(apiResponse.data);
                } else {
                    throw new Error("Format data tidak valid dari API. Diharapkan array di dalam properti 'data'.");
                }
            } else {
                throw new Error(apiResponse.message || "Gagal mengambil data logbook dari API.");
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
      if (userRole === "admin" || userRole === "user") {
        fetchData();
      }
    }, [userRole]);

    // --- Fungsi Pengiriman Permintaan API Umum (untuk Logbook) ---
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

    // --- Handler Navigasi Kembali ---
    const handleBackToSummary = () => {
        setFilterPeralatanDetail("");
        setSelectedPersonDateEntry(null);
        setShowCharts(false);
        setShowEquipmentCharts(false); // Reset equipment charts view
        setSelectedEquipment(null); // Reset selected equipment
    };

    const handleBackToLogbook = () => {
        navigate("/logbook");
    };

    const handleBackToEquipmentList = () => {
        setSelectedEquipment(null);
    };

    // --- Handlers Modal Tambah Entri Peralatan (Peralatan & Keterangan) ---
    const handleAddEntry = async () => {
        if (!selectedPersonDateEntry) {
            Swal.fire('Error', 'Tidak ada Penanggung Jawab dan Tanggal yang dipilih. Silakan pilih atau tambahkan entri baru terlebih dahulu.', 'error');
            return;
        }
        if (!newPeralatan || !newKeterangan) {
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
            Swal.fire('Berhasil!', 'Entri peralatan berhasil ditambahkan!', 'success');
            setShowAddEntryModal(false);
            setNewPeralatan("");
            setNewKeterangan("");
            fetchData();
        } catch (err) {
            Swal.fire('Gagal!', `Gagal menambahkan entri peralatan: ${err.message}`, 'error');
        }
    };

    // --- Handlers Modal Tambah Penanggung Jawab & Tanggal BARU ---
    const handleAddPersonDate = async () => {
        if (!newPersonDatePenanggungJawab || !newPersonDateTanggal) {
            Swal.fire('Peringatan', 'Penanggung Jawab dan Tanggal harus diisi.', 'warning');
            return;
        }
        const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!dateRegex.test(newPersonDateTanggal)) {
            Swal.fire('Peringatan', 'Format tanggal harus DD/MM/YYYY (contoh: 01/01/2025).', 'warning');
            return;
        }

        try {
            await sendApiRequest("add", {
                "Penanggung Jawab": newPersonDatePenanggungJawab,
                Tanggal: newPersonDateTanggal,
                Peralatan: "",
                Keterangan: ""
            });
            Swal.fire('Berhasil!', 'Penanggung Jawab dan Tanggal baru berhasil ditambahkan!', 'success');
            setShowAddPersonDateModal(false);
            setNewPersonDatePenanggungJawab("");
            setNewPersonDateTanggal("");
            fetchData();
        } catch (err) {
            Swal.fire('Gagal!', `Gagal menambahkan entri: ${err.message}`, 'error');
        }
    };

    // --- Handlers Modal Edit Entri Logbook ---
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

    // --- Handlers Hapus Entri Logbook ---
    const handleDeleteClick = (item) => {
        deleteEntry(item);
    };

    const deleteEntry = async (item) => {
        Swal.fire({
            title: 'Konfirmasi Hapus',
            text: `Anda yakin ingin menghapus entri untuk Peralatan: ${item.Peralatan} oleh ${item["Penanggung Jawab"]} pada Tanggal: ${item.Tanggal}?`,
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

    // Handlers untuk mengedit kombinasi Penanggung Jawab & Tanggal
    const handleEditPersonDateClick = (combo) => {
        setOpenKebabMenuId(null);
        setEditingPersonDateCombo(combo);
        setEditedPersonDatePenanggungJawab(combo.person);
        setEditedPersonDateTanggal(combo.date);
        setShowEditPersonDateModal(true);
    };

    const handleSavePersonDateEdit = async () => {
        if (!editingPersonDateCombo || !editedPersonDatePenanggungJawab || !editedPersonDateTanggal) {
            Swal.fire('Peringatan', 'Penanggung Jawab dan Tanggal harus diisi.', 'warning');
            return;
        }
        const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!dateRegex.test(editedPersonDateTanggal)) {
            Swal.fire('Peringatan', 'Format tanggal harus DD/MM/YYYY (contoh: 01/01/2025).', 'warning');
            return;
        }

        const hasDetails = logbookData.some(item =>
            item["Penanggung Jawab"] === editingPersonDateCombo.person &&
            item.Tanggal === editingPersonDateCombo.date &&
            (item.Peralatan || item.Keterangan)
        );

        if (hasDetails) {
            Swal.fire({
                title: 'Konfirmasi Edit',
                text: 'Kombinasi Penanggung Jawab dan Tanggal ini memiliki entri peralatan terkait. Mengubahnya akan mengubah semua entri terkait. Anda yakin?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ya, Ubah Semua',
                cancelButtonText: 'Batal'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await sendApiRequest("editPersonDate", {
                            originalPenanggungJawab: editingPersonDateCombo.person,
                            originalTanggal: editingPersonDateCombo.date,
                            newPenanggungJawab: editedPersonDatePenanggungJawab,
                            newTanggal: editedPersonDateTanggal
                        });
                        Swal.fire('Berhasil!', 'Penanggung Jawab dan Tanggal berhasil diperbarui di semua entri terkait!', 'success');
                        setShowEditPersonDateModal(false);
                        fetchData();
                    } catch (err) {
                        Swal.fire('Gagal!', `Gagal memperbarui: ${err.message}`, 'error');
                    }
                }
            });
        } else {
            try {
                await sendApiRequest("editPersonDate", {
                    originalPenanggungJawab: editingPersonDateCombo.person,
                    originalTanggal: editingPersonDateCombo.date,
                    newPenanggungJawab: editedPersonDatePenanggungJawab,
                    newTanggal: editedPersonDateTanggal
                });
                Swal.fire('Berhasil!', 'Penanggung Jawab dan Tanggal berhasil diperbarui!', 'success');
                setShowEditPersonDateModal(false);
                fetchData();
            } catch (err) {
                Swal.fire('Gagal!', `Gagal memperbarui: ${err.message}`, 'error');
            }
        }
    };

    // Handlers untuk menghapus kombinasi Penanggung Jawab & Tanggal
    const handleDeletePersonDate = (combo) => {
        setOpenKebabMenuId(null);
        Swal.fire({
            title: 'Konfirmasi Hapus Semua Entri',
            text: `Anda yakin ingin menghapus SEMUA entri logbook untuk ${combo.person} pada Tanggal: ${combo.date}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus Semua',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await sendApiRequest("deletePersonDate", {
                        "Penanggung Jawab": combo.person,
                        Tanggal: combo.date,
                    });
                    Swal.fire('Berhasil!', `Semua entri untuk ${combo.person} pada ${combo.date} berhasil dihapus!`, 'success');
                    fetchData();
                    setSelectedPersonDateEntry(null);
                } catch (err) {
                    Swal.fire('Gagal!', `Gagal menghapus entri: ${err.message}`, 'error');
                }
            }
        });
    };

    // Kebab menu handlers
    const handleOpenKebabMenu = (id) => {
        setOpenKebabMenuId(id);
    };

    const handleCloseKebabMenu = () => {
        setOpenKebabMenuId(null);
    };

    const statusOptions = ["OK", "Rusak", "Perbaikan", "Tidak Beroperasi"];

    // Function to map status to severity score
    const getStatusScore = (status) => {
        switch (status) {
            case "OK": return 0;
            case "Rusak": return 1;
            case "Tidak Beroperasi": return 1;
            case "Perbaikan": return 2;
            default: return 0;
        }
    };
    

    // Function to get status color
    const getStatusColor = (status) => {
        switch (status) {
            case "OK": return "#10B981";
            case "Rusak": return "#EF4444";
            case "Tidak Beroperasi": return "#DC2626";
            case "Perbaikan": return "#F59E0B";
            default: return "#6B7280";
        }
    };

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

    const detailTableData = useMemo(() => {
        if (!selectedPersonDateEntry) return [];

        let filtered = logbookData.filter(
            (item) =>
                item.Tanggal === selectedPersonDateEntry.date &&
                item["Penanggung Jawab"] === selectedPersonDateEntry.person &&
                (item.Peralatan || item.Keterangan)
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

    // Data untuk grafik - hanya menghitung entri yang memiliki peralatan dan keterangan
    const chartData = useMemo(() => {
        const statusCount = {};
        const equipmentData = logbookData.filter(item => item.Peralatan && item.Keterangan);
        
        statusOptions.forEach(status => {
            statusCount[status] = 0;
        });

        equipmentData.forEach(item => {
            if (statusCount.hasOwnProperty(item.Keterangan)) {
                statusCount[item.Keterangan]++;
            }
        });

        const dateStatusMap = {};
        equipmentData.forEach(item => {
            if (!dateStatusMap[item.Tanggal]) {
                dateStatusMap[item.Tanggal] = {};
            }
            statusOptions.forEach(status => {
                if (!dateStatusMap[item.Tanggal][status]) {
                    dateStatusMap[item.Tanggal][status] = 0;
                }
            });
            if (dateStatusMap[item.Tanggal][item.Keterangan] !== undefined) {
                dateStatusMap[item.Tanggal][item.Keterangan]++;
            }
        });

        const lineData = Object.entries(dateStatusMap)
        .map(([date, statuses]) => ({
            date,
            ...statuses,
            dateSort: parseDateForSort(date)
        }))
        .sort((a, b) => a.dateSort - b.dateSort);

        return { lineData, totalEquipment: equipmentData.length };
    }, [logbookData]);

    // New: Get unique equipment list for equipment charts view
    const uniqueEquipmentList = useMemo(() => {
        const equipmentSet = new Set();
        logbookData.forEach((item) => {
            if (item.Peralatan && item.Peralatan.trim()) {
                equipmentSet.add(item.Peralatan);
            }
        });
        return Array.from(equipmentSet).sort();
    }, [logbookData]);

    // New: Get chart data for specific equipment
    const getEquipmentChartData = (equipmentName) => {
        const equipmentEntries = logbookData.filter(item => 
            item.Peralatan === equipmentName && item.Keterangan
        );

        // Group by date
        const dateStatusMap = {};
        equipmentEntries.forEach(item => {
            if (!dateStatusMap[item.Tanggal]) {
                dateStatusMap[item.Tanggal] = {};
                statusOptions.forEach(status => {
                    dateStatusMap[item.Tanggal][status] = 0;
                });
            }
            if (dateStatusMap[item.Tanggal][item.Keterangan] !== undefined) {
                dateStatusMap[item.Tanggal][item.Keterangan]++;
            }
        });

        // Convert to chart format for line chart (status count over time)
        const lineChartData = Object.entries(dateStatusMap)
        .map(([date, statuses]) => ({
            date,
            ...statuses,
            dateSort: parseDateForSort(date)
        }))
        .sort((a, b) => a.dateSort - b.dateSort);

        return {
            lineChartData,
            totalEntries: equipmentEntries.length,
            uniqueDates: Object.keys(dateStatusMap).length
        };
    };

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
                    <p className="font-semibold">{`${data.name || label}: ${data.value || data.payload.jumlah}`}</p>
                    <p className="text-sm text-gray-600">
                        Persentase: {((data.value || data.payload.jumlah) / chartData.totalEquipment * 100).toFixed(1)}%
                    </p>
                </div>
            );
        }
        return null;
    };

    // --- Tampilan Loading dan Error ---
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

    if (!userRole) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-lg text-gray-700">Memeriksa autentikasi...</p>
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
                <main className="flex-1 w-full min-w-0 p-4 md:p-6 xl:p-8 max-w-7xl mx-auto bg-gray-50">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        {/* Tombol Kembali */}
                        <button
                            onClick={
                                selectedEquipment ? handleBackToEquipmentList :
                                selectedPersonDateEntry || showCharts || showEquipmentCharts ? handleBackToSummary : 
                                handleBackToLogbook
                            }
                            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 rounded-md text-[10px] sm:text-sm md:text-base"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            {selectedEquipment ? "Kembali ke Daftar Peralatan" :
                             selectedPersonDateEntry || showCharts || showEquipmentCharts ? "Kembali ke Ringkasan Log Book" : 
                             "Kembali ke Halaman Log Book"}
                        </button>

                        {/* Tombol untuk toggle grafik dan tambah data */}
                        <div className="flex gap-2">
                            {!selectedPersonDateEntry && !showCharts && !showEquipmentCharts && !selectedEquipment && (
                                <>
                                    <button
                                        onClick={() => setShowEquipmentCharts(true)}
                                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center space-x-2 whitespace-nowrap"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                        <span>Grafik per Peralatan</span>
                                    </button>
                                    <button
                                        onClick={() => setShowAddPersonDateModal(true)}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center space-x-2 whitespace-nowrap"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span>Tambah Penanggung Jawab & Tanggal</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <h2 className="text-center text-[15px] md:text-2xl xl:text-3xl font-semibold mb-6 md:mb-8">
                        Log Book Pagi
                    </h2>

                    {userRole && (
                      <div className="text-center mb-4 text-gray-600">
                        Anda login sebagai: <span className="font-bold uppercase">{userRole}</span>
                      </div>
                    )}

                    {/* Tampilan Grafik per Peralatan - Individual Equipment Chart */}
                    {selectedEquipment && (
                        <div className="space-y-6 mb-8">
                            {(() => {
                                const equipmentData = getEquipmentChartData(selectedEquipment);
                                return (
                                    <>
                                        {/* Statistics Cards - TETAP */}
                                        <div className="bg-white rounded-lg shadow-md p-6">
                                            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                                                Analisis Peralatan: <span className="text-blue-600">{selectedEquipment}</span>
                                            </h3>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                                                    <div className="flex items-center">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-600">Total Entri</p>
                                                            <p className="text-2xl font-bold text-blue-600">{equipmentData.totalEntries}</p>
                                                        </div>
                                                        <div className="p-3 bg-blue-100 rounded-full">
                                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                                                    <div className="flex items-center">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-600">Hari Tercatat</p>
                                                            <p className="text-2xl font-bold text-green-600">{equipmentData.uniqueDates}</p>
                                                        </div>
                                                        <div className="p-3 bg-green-100 rounded-full">
                                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                                                    <div className="flex items-center">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-600">Status OK</p>
                                                            <p className="text-2xl font-bold text-orange-600">
                                                                {equipmentData.lineChartData.reduce((sum, item) => sum + (item.OK || 0), 0)}
                                                            </p>
                                                        </div>
                                                        <div className="p-3 bg-orange-100 rounded-full">
                                                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* HANYA LINE CHART - Hapus Pie Chart */}
                                        <div className="bg-white rounded-lg shadow-md p-6">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                                                Status Peralatan {selectedEquipment} Per Hari
                                            </h4>
                                            <div className="h-80">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={equipmentData.lineChartData}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis 
                                                            dataKey="date" 
                                                            angle={-45}
                                                            textAnchor="end"
                                                            height={80}
                                                            fontSize={12}
                                                        />
                                                        <YAxis />
                                                        <Tooltip />
                                                        <Legend />
                                                        {statusOptions.map((status) => (
                                                            <Line 
                                                                key={status}
                                                                type="monotone" 
                                                                dataKey={status} 
                                                                stroke={getStatusColor(status)}
                                                                strokeWidth={2}
                                                                connectNulls={false}
                                                            />
                                                        ))}
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    )}

                    {/* Tampilan Daftar Peralatan untuk Grafik */}
                    {showEquipmentCharts && !selectedEquipment && (
                        <div className="space-y-6 mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                                    Pilih Peralatan untuk Melihat Grafik Detail
                                </h3>
                                
                                {uniqueEquipmentList.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">Tidak ada data peralatan yang tersedia.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {uniqueEquipmentList.map((equipment, index) => {
                                            const equipmentData = getEquipmentChartData(equipment);
                                            return (
                                                <div
                                                    key={index}
                                                    onClick={() => setSelectedEquipment(equipment)}
                                                    className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4 border border-blue-200 cursor-pointer hover:shadow-lg hover:border-blue-400 transition-all duration-200 transform hover:-translate-y-1"
                                                >
                                                    <div className="flex flex-col items-center text-center">
                                                        <div className="mb-3 p-3 bg-blue-100 rounded-full">
                                                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                            </svg>
                                                        </div>
                                                        <h4 className="font-semibold text-gray-800 mb-2 text-sm break-words">
                                                            {equipment}
                                                        </h4>
                                                        <div className="text-xs text-gray-600 space-y-1">
                                                            <p>Entri: <span className="font-semibold text-blue-600">{equipmentData.totalEntries}</span></p>
                                                            <p>Hari: <span className="font-semibold text-green-600">{equipmentData.uniqueDates}</span></p>
                                                        </div>
                                                        <div className="mt-2 flex items-center text-xs text-blue-600">
                                                            <span>Lihat Detail</span>
                                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tampilan Grafik Keseluruhan */}
                    {showCharts && (
                         <div className="space-y-6 mb-8">
                            {/* Statistics Cards - TETAP */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
                                    <div className="flex items-center">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-600">Total Peralatan</p>
                                            <p className="text-2xl font-bold text-gray-900">{chartData.totalEquipment}</p>
                                        </div>
                                        <div className="p-3 bg-green-100 rounded-full">
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
                                    <div className="flex items-center">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-600">Status OK</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {chartData.lineData.reduce((sum, item) => sum + (item.OK || 0), 0)}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-green-100 rounded-full">
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
                                    <div className="flex items-center">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-600">Rusak/Tidak Beroperasi</p>
                                            <p className="text-2xl font-bold text-red-600">
                                                {chartData.lineData.reduce((sum, item) => sum + (item.Rusak || 0) + (item["Tidak Beroperasi"] || 0), 0)}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-red-100 rounded-full">
                                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
                                    <div className="flex items-center">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-600">Dalam Perbaikan</p>
                                            <p className="text-2xl font-bold text-orange-600">
                                                {chartData.lineData.reduce((sum, item) => sum + (item.Perbaikan || 0), 0)}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-orange-100 rounded-full">
                                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* HANYA LINE CHART - Hapus Pie Chart dan Bar Chart */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                                    Tren Status Peralatan Seiring Waktu
                                </h3>
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData.lineData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis 
                                                dataKey="date" 
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                                fontSize={12}
                                            />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            {statusOptions.map((status) => (
                                                <Line 
                                                    key={status}
                                                    type="monotone" 
                                                    dataKey={status} 
                                                    stroke={getStatusColor(status)}
                                                    strokeWidth={2}
                                                    connectNulls={false}
                                                />
                                            ))}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Status Legend - TETAP */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Keterangan Status & Skor Keparahan</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {statusOptions.map((status) => (
                                        <div key={status} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                            <div 
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: getStatusColor(status) }}
                                            ></div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">{status}</p>
                                                <p className="text-sm text-gray-600">Skor: {getStatusScore(status)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Sistem Penilaian:</strong> OK = 0 (Normal), Rusak/Tidak Beroperasi = 1 (Kritis), Perbaikan = 2 (Sedang Diperbaiki)
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    {logbookData.length === 0 && !loading && !error ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600 text-sm md:text-base">
                                Tidak ada data logbook yang ditemukan.
                            </p>
                            {!selectedPersonDateEntry && !showCharts && !showEquipmentCharts && (
                                <button
                                    onClick={() => setShowAddPersonDateModal(true)}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center space-x-2 mx-auto"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span>Tambahkan Entri Pertama</span>
                                </button>
                            )}
                        </div>
                    ) : selectedPersonDateEntry ? (
                        // Tampilan Tabel Detail
                         <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-8">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
                                <h3 className="text-[13px] md:text-xl font-semibold text-gray-800 text-center sm:text-left flex-grow">
                                    Detail Log Book untuk <span className="text-blue-700">{selectedPersonDateEntry.person}</span> pada <span className="text-blue-700">{selectedPersonDateEntry.date}</span>
                                </h3>
                                    <button
                                        onClick={() => setShowAddEntryModal(true)}
                                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base whitespace-nowrap flex items-center space-x-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span>Tambah Peralatan</span>
                                    </button>
                            </div>

                            {/* Input pencarian */}
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Cari peralatan..."
                                    className="w-full p-2 md:p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                                    value={filterPeralatanDetail}
                                    onChange={(e) => setFilterPeralatanDetail(e.target.value)}
                                />
                            </div>

                            {/* Tabel dengan scroll horizontal */}
                            <div className="overflow-x-auto -mx-4 md:-mx-6 lg:mx-0">
                                <div className="inline-block min-w-full px-4 md:px-6 lg:px-0">
                                    <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Peralatan
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Keterangan
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Bukti Foto
                                                    </th>
                                                    <th className="px-3 py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Aksi
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {detailTableData.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="3" className="px-3 py-4 text-center text-sm text-gray-500">
                                                            Tidak ada Peralatan yang cocok dengan pencarian atau belum ada entri.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    detailTableData.map((item, index) => (
                                                        <tr key={index} className="hover:bg-gray-50">
                                                            <td className="px-3 py-4 text-[10px] sm:text-sm font-medium text-gray-900">
                                                                <div className="break-words max-w-xs md:max-w-sm">
                                                                    {item.Peralatan}
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-4 text-[10px] sm:text-sm text-gray-500">
                                                                <div className="break-words max-w-xs md:max-w-sm">
                                                                    {item.Keterangan}
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-4">
                                                                {item["Bukti Foto"] ? (
                                                                    <a href={item["Bukti Foto"]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs sm:text-sm">
                                                                        Lihat Foto
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-gray-500 text-xs sm:text-sm">Tidak Ada</span>
                                                                )}
                                                            </td>
                                                                <td className="px-3 py-4 text-center">
                                                                    <div className="flex justify-center items-center space-x-2">
                                                                        <button
                                                                            onClick={() => handleEditClick(item)}
                                                                            className="text-blue-600 hover:text-blue-900 p-1"
                                                                            title="Edit Entri"
                                                                        >
                                                                            <FiEdit2 className="w-4 h-4 md:w-5 md:h-5" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteClick(item)}
                                                                            className="text-red-600 hover:text-red-900 p-1"
                                                                            title="Hapus Entri"
                                                                        >
                                                                            <FiTrash2 className="w-4 h-4 md:w-5 md:h-5" />
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
                    ) : !showCharts && !showEquipmentCharts ? (
                        // Tampilan Grid Kotak Ringkasan (mirip PerkaCanggih)
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                            {uniquePersonDateCombinations.map((combo, index) => {
                                // Membuat ID unik untuk setiap kotak untuk menu kebab
                                const comboId = `${combo.person}-${combo.date}`;
                                return (
                                    <div
                                        key={comboId}
                                        className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-200 transform hover:-translate-y-1 flex flex-col justify-between items-start relative"
                                        onClick={() => setSelectedPersonDateEntry(combo)}
                                    >
                                        <div className="flex justify-between items-center w-full mb-2">
                                            <p className="text-sm md:text-base font-semibold text-gray-800 break-words flex-grow">
                                                {combo.person}
                                            </p>
                                            <svg
                                                className="w-4 h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0 ml-2"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                            </svg>
                                        </div>
                                        <p className="text-xs md:text-sm text-gray-600">{combo.date}</p>

                                        {/* Kebab Menu Button (tetap SVG inline) */}
                                        {userRole === "admin" && (
                                          <button
                                              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
                                              onClick={(e) => {
                                                  e.stopPropagation(); // Mencegah klik kotak memicu setSelectedPersonDateEntry
                                                  handleOpenKebabMenu(comboId);
                                              }}
                                          >
                                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                                              </svg>
                                          </button>
                                        )}

                                        {/* Kebab Menu Dropdown (tetap menggunakan ikon yang sebelumnya Anda set) */}
                                        {openKebabMenuId === comboId && (
                                            <div
                                                className="absolute top-10 right-2 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                                                onMouseLeave={handleCloseKebabMenu} // Tutup saat mouse keluar
                                            >
                                                <button
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditPersonDateClick(combo);
                                                    }}
                                                >
                                                    <FiEdit2 className="w-4 h-4" />
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeletePersonDate(combo);
                                                    }}
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                    <span>Hapus</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : null} 
                </main>
            </div>

            {/* Modal Tambah Penanggung Jawab & Tanggal BARU */}
            {showAddPersonDateModal && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h3 className="text-lg md:text-xl font-semibold text-gray-800 flex-grow text-center">
                                Tambah Penanggung Jawab & Tanggal Baru
                            </h3>
                            <button
                                onClick={() => setShowAddPersonDateModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                            >
                                <IoClose className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="newPersonDatePenanggungJawab"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Penanggung Jawab <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="newPersonDatePenanggungJawab"
                                className="w-full p-2 md:p-3 border border-gray-300 rounded-md text-sm md:text-base"
                                value={newPersonDatePenanggungJawab}
                                onChange={(e) => setNewPersonDatePenanggungJawab(e.target.value)}
                                placeholder="Misal: Kurniawan R."
                            />
                        </div>
                        <div className="mb-6">
                            <label
                                htmlFor="newPersonDateTanggal"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Tanggal <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="newPersonDateTanggal"
                                className="w-full p-2 md:p-3 border border-gray-300 rounded-md text-sm md:text-base"
                                value={newPersonDateTanggal}
                                onChange={(e) => setNewPersonDateTanggal(e.target.value)}
                                placeholder="DD/MM/YYYY"
                            />
                            <p className="text-xs text-gray-500 mt-1">Format: DD/MM/YYYY (contoh: 01/01/2025)</p>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => setShowAddPersonDateModal(false)}
                                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-black bg-red-400 rounded sm:rounded-md hover:bg-red-600 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleAddPersonDate}
                                className="px-4 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded sm:rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Tambah
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Edit Penanggung Jawab & Tanggal */}
            {showEditPersonDateModal && editingPersonDateCombo && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h3 className="text-lg md:text-xl font-semibold text-gray-800 flex-grow text-center">
                                Edit Penanggung Jawab & Tanggal
                            </h3>
                            <button
                                onClick={() => setShowEditPersonDateModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                            >
                                <IoClose className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="editedPersonDatePenanggungJawab"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Penanggung Jawab Baru <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="editedPersonDatePenanggungJawab"
                                className="w-full p-2 md:p-3 border border-gray-300 rounded-md text-sm md:text-base"
                                value={editedPersonDatePenanggungJawab}
                                onChange={(e) => setEditedPersonDatePenanggungJawab(e.target.value)}
                                placeholder="Misal: Kurniawan R."
                            />
                        </div>
                        <div className="mb-6">
                            <label
                                htmlFor="editedPersonDateTanggal"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Tanggal Baru <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="editedPersonDateTanggal"
                                className="w-full p-2 md:p-3 border border-gray-300 rounded-md text-sm md:text-base"
                                value={editedPersonDateTanggal}
                                onChange={(e) => setEditedPersonDateTanggal(e.target.value)}
                                placeholder="DD/MM/YYYY"
                            />
                            <p className="text-xs text-gray-500 mt-1">Format: DD/MM/YYYY (contoh: 01/01/2025)</p>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => setShowEditPersonDateModal(false)}
                                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-black bg-red-400 rounded sm:rounded-md hover:bg-red-600 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSavePersonDateEdit}
                                className="px-4 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded sm:rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Simpan Perubahan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tambah Peralatan (Add Entry) - Menggunakan nama state showAddEntryModal */}
            {showAddEntryModal && selectedPersonDateEntry && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h3 className="text-lg md:text-xl font-semibold text-gray-800 flex-grow text-center">
                                Tambah Entri Peralatan
                            </h3>
                            <button
                                onClick={() => setShowAddEntryModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                            >
                                <IoClose className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="mb-4 p-3 bg-gray-50 rounded-md">
                            <p className="text-[10px] sm:text-sm text-gray-600 mb-1">
                                Penanggung Jawab:{" "}
                                <span className="font-medium text-gray-800">
                                    {selectedPersonDateEntry.person}
                                </span>
                            </p>
                            <p className="text-[10px] sm:text-sm text-gray-600">
                                Tanggal:{" "}
                                <span className="font-medium text-gray-800">
                                    {selectedPersonDateEntry.date}
                                </span>
                            </p>
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="newPeralatan"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Nama Peralatan <span className="text-red-500">*</span>
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
                        <div className="mb-4">
                            <label
                                htmlFor="newKeterangan"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Keterangan/Status Awal <span className="text-red-500">*</span>
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
                        {/* Input File untuk Bukti Foto */}
                        <div className="mb-6">
                            <label
                                htmlFor="newBuktiFotoFile"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Bukti Foto
                            </label>
                            <input
                                type="file"
                                id="newBuktiFotoFile"
                                accept="image/*"
                                className="w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                onChange={(e) => setNewBuktiFotoFile(e.target.files[0])}
                                disabled={isUploading}
                            />
                            {newBuktiFotoFile && (
                                <p className="mt-2 text-xs text-gray-500">
                                    File dipilih: {newBuktiFotoFile.name}
                                </p>
                            )}
                            {isUploading && (
                                <p className="mt-2 text-blue-500 text-sm">Mengunggah foto...</p>
                            )}
                        </div>
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => setShowAddEntryModal(false)}
                                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-black bg-red-400 rounded sm:rounded-md hover:bg-red-600 transition-colors"
                                disabled={isUploading}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleAddEntry}
                                className="px-4 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm bg-green-600 text-white rounded sm:rounded-md hover:bg-green-700 transition-colors"
                                disabled={isUploading}
                            >
                                {isUploading ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Edit Keterangan (Edit Entry) */}
            {showEditModal && editingItem && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h3 className="text-lg md:text-xl font-semibold text-gray-800 flex-grow text-center">
                                Edit Entri Log Book
                            </h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                            >
                                <IoClose className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="mb-4 p-3 bg-gray-50 rounded-md">
                            <p className="text-[10px] sm:text-sm text-gray-600 mb-1">
                                Penanggung Jawab:{" "}
                                <span className="font-medium text-gray-800">
                                    {editingItem["Penanggung Jawab"]}
                                </span>
                            </p>
                            <p className="text-[10px] sm:text-sm text-gray-600 mb-1">
                                Tanggal:{" "}
                                <span className="font-medium text-gray-800">{editingItem.Tanggal}</span>
                            </p>
                            <p className="text-[10px] sm:text-sm text-gray-600">
                                Peralatan Asli:{" "}
                                <span className="font-medium text-gray-800">{editingItem.Peralatan}</span>
                            </p>
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="editedPeralatan"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Nama Peralatan Baru <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="editedPeralatan"
                                className="w-full p-2 md:p-3 border border-gray-300 rounded-md text-sm md:text-base"
                                value={editedPeralatan}
                                onChange={(e) => setEditedPeralatan(e.target.value)}
                                placeholder="Misal: AWOS Bandara"
                            />
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="editedKeterangan"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Keterangan Baru <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="editedKeterangan"
                                className="w-full p-2 md:p-3 border border-gray-300 rounded-md text-sm md:text-base"
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
                        {/* Input File untuk Bukti Foto di Edit Modal */}
                        <div className="mb-6">
                            <label
                                htmlFor="editedBuktiFotoFile"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Bukti Foto
                            </label>
                            <input
                                type="file"
                                id="editedBuktiFotoFile"
                                accept="image/*"
                                className="w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                onChange={(e) => setEditedBuktiFotoFile(e.target.files[0])}
                                disabled={isUploading}
                            />
                            {editedBuktiFotoFile && (
                                <p className="mt-2 text-xs text-gray-500">
                                    File dipilih: {editedBuktiFotoFile.name}
                                </p>
                            )}
                            {!editedBuktiFotoFile && editedBuktiFotoURL && (
                                <p className="mt-2 text-xs text-gray-500">
                                    Foto saat ini: <a href={editedBuktiFotoURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Lihat Foto</a>
                                </p>
                            )}
                            {isUploading && (
                                <p className="mt-2 text-blue-500 text-sm">Mengunggah foto...</p>
                            )}
                        </div>
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-black bg-red-400 rounded sm:rounded-md hover:bg-red-600 transition-colors"
                                disabled={isUploading}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleEditEntry}
                                className="px-4 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm bg-green-600 text-white rounded sm:rounded-md hover:bg-green-700 transition-colors"
                                disabled={isUploading}
                            >
                                {isUploading ? 'Menyimpan...' : 'Simpan Perubahan'}
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