
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
// import { supabase } from '../supabaseClient'; // Tidak perlu lagi jika pindah ke Google Drive

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

    // States untuk modal Tambah Entri Peralatan (Peralatan & Keterangan)
    const [showCharts, setShowCharts] = useState(false);
    const [showEquipmentCharts, setShowEquipmentCharts] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState(null);

    // States untuk modal Tambah Entri Peralatan (Peralatan & Keterangan)
    const [showAddEntryModal, setShowAddEntryModal] = useState(false);
    const [newPeralatan, setNewPeralatan] = useState("");
    const [newKeterangan, setNewKeterangan] = useState("");
    const [newBuktiFotoFile, setNewBuktiFotoFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // States untuk modal Tambah Penanggung Jawab & Tanggal BARU
    const [showAddPersonDateModal, setShowAddPersonDateModal] = useState(false);
    const [newPersonDatePenanggungJawab, setNewPersonDatePenanggungJawab] = useState("");
    const [newPersonDateTanggal, setNewPersonDateTanggal] = useState("");

    // States untuk modal Edit Entri Logbook
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editedPeralatan, setEditedPeralatan] = useState("");
    const [editedKeterangan, setEditedKeterangan] = useState("");
    const [editedBuktiFotoFile, setEditedBuktiFotoFile] = useState(null);
    const [editedBuktiFotoURL, setEditedBuktiFotoURL] = useState("");
    const [removeExistingPhoto, setRemoveExistingPhoto] = useState(false);

    // States untuk modal Edit Penanggung Jawab & Tanggal
    const [showEditPersonDateModal, setShowEditPersonDateModal] = useState(false);
    const [editingPersonDateCombo, setEditingPersonDateCombo] = useState(null);
    const [editedPersonDatePenanggungJawab, setEditedPersonDatePenanggungJawab] = useState("");
    const [editedPersonDateTanggal, setEditedPersonDateTanggal] = useState("");

    // State untuk menu kebab (titik tiga)
    const [openKebabMenuId, setOpenKebabMenuId] = useState(null);
    const { userRole, logout } = useAuth();

    // === FILTER STATE ===
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [showFilter, setShowFilter] = useState(false);

    const [showAddNewPersonInput, setShowAddNewPersonInput] = useState(false);
    const [newPersonName, setNewPersonName] = useState('');

    const [penanggungJawabList, setPenanggungJawabList] = useState([
        'Kurniawan Raharjo, S.T',
        'Agusto Pramana Putera, S.Tr',
        'Ahmad Fauzi, S.T',
        'Nastiti Siwi Risantika, S.Tr.Inst',
        'Badia Lumbanbatu, STr Inst',
        'Mapasena Farid Wijaya, S.Tr Inst',
        'Muhammad Rony Zakaria, STr Inst'
    ]);

    // Daftar bulan
    const months = [
        { value: '01', label: 'Januari' },
        { value: '02', label: 'Februari' },
        { value: '03', label: 'Maret' },
        { value: '04', label: 'April' },
        { value: '05', label: 'Mei' },
        { value: '06', label: 'Juni' },
        { value: '07', label: 'Juli' },
        { value: '08', label: 'Agustus' },
        { value: '09', label: 'September' },
        { value: '10', label: 'Oktober' },
        { value: '11', label: 'November' },
        { value: '12', label: 'Desember' }
    ];

    useEffect(() => {
        if (!userRole || (userRole !== "admin" && userRole !== "user")) {
            navigate('/');
        }
    }, [userRole, navigate]);

    // URL API Logbook
    const LOGBOOK_API_URL =
        "https://script.google.com/macros/s/AKfycbwdCJ4ravHuphNoOfw1w63F5k6Dx3F-8CrBUjng74CJouvM2X4uAo0igExKvMLyKp8CJg/exec";

    // === Fungsi parsing tanggal ===
    const parseDateToStandard = (dateStr) => {
        if (!dateStr) return null;
        const parts = dateStr.split("/");
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);
            return new Date(year, month - 1, day);
        }
        return null;
    };

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

    // --- Fungsi untuk membaca file sebagai Base64 ---
    const readFileAsBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    };

    // --- Handler Navigasi Kembali ---
    const handleBackToSummary = () => {
        setFilterPeralatanDetail("");
        setSelectedPersonDateEntry(null);
        setShowCharts(false);
        setShowEquipmentCharts(false);
        setSelectedEquipment(null);
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
        if (isUploading) {
            Swal.fire('Mohon Tunggu', 'Upload foto sedang berlangsung...', 'info');
            return;
        }

        let base64Foto = '';
        let fileName = '';

        if (newBuktiFotoFile) {
            setIsUploading(true);
            try {
                base64Foto = await readFileAsBase64(newBuktiFotoFile);
                fileName = newBuktiFotoFile.name;
            } catch (fileError) {
                Swal.fire('Error Membaca File!', `Gagal membaca file foto: ${fileError.message}`, 'error');
                setIsUploading(false);
                return;
            }
        }

        const payload = { 
            Peralatan: newPeralatan,
            Keterangan: newKeterangan,
            "Penanggung Jawab": selectedPersonDateEntry.person,
            Tanggal: selectedPersonDateEntry.date,
            "Bukti Foto": "",
        };
        if (newBuktiFotoFile) {
            payload.base64Foto = base64Foto;
            payload.fileName = fileName;
        }

        try {
            await sendApiRequest("add", payload);
            Swal.fire('Berhasil!', 'Entri peralatan berhasil ditambahkan!', 'success');
            setShowAddEntryModal(false);
            setNewPeralatan("");
            setNewKeterangan("");
            setNewBuktiFotoFile(null);
            fetchData();
        } catch (err) {
            Swal.fire('Gagal!', `Gagal menambahkan entri peralatan: ${err.message}`, 'error');
        } finally {
            setIsUploading(false);
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
                Keterangan: "",
                "Bukti Foto": "" 
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
        setEditedBuktiFotoURL(item["Bukti Foto"] || "");
        setEditedBuktiFotoFile(null);
        setRemoveExistingPhoto(false);
        setShowEditModal(true);
    };

    const handleEditEntry = async () => {
        if (!editingItem || !editedPeralatan || !editedKeterangan) {
            Swal.fire('Peringatan', 'Nama Peralatan dan Keterangan harus diisi.', 'warning');
            return;
        }
        if (isUploading) {
            Swal.fire('Mohon Tunggu', 'Upload foto sedang berlangsung...', 'info');
            return;
        }

        let base64Foto = '';
        let fileName = '';

        if (editedBuktiFotoFile) {
            setIsUploading(true);
            try {
                base64Foto = await readFileAsBase64(editedBuktiFotoFile);
                fileName = editedBuktiFotoFile.name;
            } catch (fileError) {
                Swal.fire('Error Membaca File!', `Gagal membaca file foto: ${fileError.message}`, 'error');
                setIsUploading(false);
                return;
            }
        }

        try {
            await sendApiRequest("edit", {
                originalPeralatan: editingItem.Peralatan,
                originalPenanggungJawab: editingItem["Penanggung Jawab"],
                originalTanggal: editingItem.Tanggal,
                Peralatan: editedPeralatan,
                Keterangan: editedKeterangan,
                "Bukti Foto": editedBuktiFotoURL,
                base64Foto: base64Foto,
                fileName: fileName,
                removeFoto: removeExistingPhoto
            });
            Swal.fire('Berhasil!', 'Data berhasil diubah!', 'success');
            setShowEditModal(false);
            setEditingItem(null);
            setEditedPeralatan("");
            setEditedKeterangan("");
            setEditedBuktiFotoFile(null);
            setEditedBuktiFotoURL("");
            setRemoveExistingPhoto(false);
            fetchData();
        } catch (err) {
            Swal.fire('Gagal!', `Gagal mengubah data: ${err.message}`, 'error');
        } finally {
            setIsUploading(false);
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
            text: `Anda yakin ingin menghapus SEMUA entri logbook untuk ${combo.person} pada Tanggal: ${combo.date}? Ini termasuk semua bukti foto terkait.`,
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

    // === FILTER FUNCTIONS ===
    const clearFilters = () => {
        setSelectedMonth('');
        setSelectedYear('');
    };

    const hasActiveFilters = selectedMonth || selectedYear;

    // Mendapatkan tahun unik dari data
    const availableYears = useMemo(() => {
        const years = logbookData
            .filter(item => item.Tanggal)
            .map(item => {
                const date = parseDateToStandard(item.Tanggal);
                return date ? date.getFullYear() : null;
            })
            .filter(year => year !== null);
        return [...new Set(years)].sort((a, b) => b - a);
    }, [logbookData]);

    const statusOptions = ["OK", "Rusak", "Perbaikan", "Tidak Beroperasi"];
    
    // Function to map status to severity score
    const getStatusScore = (status) => {
        switch (status) {
            case "OK": return 0;
            case "Rusak": return 1;
            case "Perbaikan": return 2;
            case "Tidak Beroperasi": return 3;
            default: return 0;
        }
    };

    const getStatusLabelFromScore = (score) => {
        const roundedScore = Math.round(score);
        switch (roundedScore) {
            case 0: return "OK";
            case 1: return "Rusak";
            case 2: return "Perbaikan";
            case 3: return "Tidak Beroperasi";
            default: return "";
        }
    };
    
    const getStatusLabel = (value) => {
        const statusLabels = {
            0: "OK",
            1: "Rusak", 
            2: "Perbaikan",
            3: "Tidak Beroperasi"
        };
        return statusLabels[value] || "";
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

    // === FILTERED COMBINATIONS WITH MONTH/YEAR FILTER ===
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
        
        let filteredCombinations = Array.from(combinations)
            .map((str) => JSON.parse(str));

        // Apply month and year filters
        if (selectedMonth || selectedYear) {
            filteredCombinations = filteredCombinations.filter(combo => {
                const date = parseDateToStandard(combo.date);
                if (!date) return false;
                
                const comboMonth = String(date.getMonth() + 1).padStart(2, '0');
                const comboYear = date.getFullYear();

                const monthMatch = !selectedMonth || comboMonth === selectedMonth;
                const yearMatch = !selectedYear || comboYear === parseInt(selectedYear);

                return monthMatch && yearMatch;
            });
        }

        return filteredCombinations.sort((a, b) => {
            const dateComparison = parseDateForSort(a.date) - parseDateForSort(b.date);
            if (dateComparison !== 0) {
                return dateComparison;
            }
            return a.person.localeCompare(b.person);
        });
    }, [logbookData, selectedMonth, selectedYear]);

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
    
    // Data untuk grafik
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
            .map(([date, statuses]) => {
                const dataPoint = {
                    date,
                    dateSort: parseDateForSort(date)
                };
                
                statusOptions.forEach(status => {
                    const count = statuses[status] || 0;
                    if (count > 0) {
                        dataPoint[status] = getStatusScore(status);
                    } else {
                        dataPoint[status] = null;
                    }
                });
                
                return dataPoint;
            })
            .sort((a, b) => a.dateSort - b.dateSort);

        return { lineData, totalEquipment: equipmentData.length };
    }, [logbookData]);

    // Get unique equipment list for equipment charts view
    const uniqueEquipmentList = useMemo(() => {
        const equipmentSet = new Set();
        logbookData.forEach((item) => {
            if (item.Peralatan && item.Peralatan.trim()) {
                equipmentSet.add(item.Peralatan);
            }
        });
        return Array.from(equipmentSet).sort();
    }, [logbookData]);

    // Get chart data for specific equipment
    const getEquipmentChartData = (equipmentName) => {
        const equipmentEntries = logbookData.filter(item => 
            item.Peralatan === equipmentName && item.Keterangan
        );

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

        const lineChartData = Object.entries(dateStatusMap)
            .map(([date, statuses]) => {
                const dataPoint = {
                    date,
                    dateSort: parseDateForSort(date)
                };
                
                statusOptions.forEach(status => {
                    const count = statuses[status] || 0;
                    if (count > 0) {
                        dataPoint[status] = getStatusScore(status);
                    } else {
                        dataPoint[status] = null;
                    }
                });
                
                return dataPoint;
            })
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

    const formatYAxisTick = (tickItem) => {
        const roundedValue = Math.round(tickItem);
        return getStatusLabel(roundedValue);
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

            {/* Mobile Menu Button - hanya muncul di mobile ketika sidebar tertutup */}
            <div className={`xl:hidden bg-white border-b border-gray-200 px-4 py-3 ${isSidebarOpen ? 'hidden' : 'block'}`}>
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
                    <button
                    onClick={toggleSidebar}
                    className="xl:hidden absolute top-0 right-32 z-10 flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors bg-white shadow-sm"
                >
                    <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
                    <Sidebar toggleSidebar={toggleSidebar} />
                </div>

                    {/* Overlay untuk mobile/tablet ketika sidebar terbuka */}
                    {isSidebarOpen && (
                        <div
                            className="xl:hidden fixed inset-0 bg-black/50 bg-opacity-50 z-40"
                            onClick={toggleSidebar}
                        ></div>
                    )}

                    {/* Main Content */}
                    <main className="flex-1 w-full min-w-0 p-4 md:p-6 xl:p-8 max-w-7xl mx-auto lg:mx-40 lg:ml-18 xl:ml-2 bg-grey-300">
                        {/* Header dengan Tombol Kembali */}
                        <div className="mb-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                            </div>
                        </div>

                        <h2 className="text-center text-[15px] md:text-2xl xl:text-3xl font-bold mb-2 md:mb-8">
                            Log Book Pagi
                        </h2>

                        {userRole && (
                            <div className="text-center text-[11px] md:text-2xl xl:text-3xl mb-12 text-gray-600">
                                Anda login sebagai: <span className="font-bold uppercase text-[10px] sm:text-base lg:text-lg">{userRole}</span>
                            </div>
                        )}

                        {/* Action Buttons - Dipindahkan ke bawah "Anda login sebagai" */}
                        {!selectedPersonDateEntry && !showCharts && !showEquipmentCharts && !selectedEquipment && (
                            <div className="mb-6">
                                {/* Tombol Sejajar - Filter di kiri, Grafik dan Tambah di kanan */}
                                <div className="flex flex-col sm:flex-row items-center justify-between grid-cols-3 sm:grid-cols-3 gap-3 mb-4">
                                    {/* Tombol Filter dan Reset */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <button
                                            onClick={() => setShowFilter(!showFilter)}
                                            className={`flex items-center gap-1 px-4 py-2 rounded-lg border transition-all${
                                                hasActiveFilters 
                                                    ? 'bg-blue-500 text-white border-blue-500' 
                                                    : 'bg-white text-black border-blue-600 hover:border-blue-300'
                                            }`}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                            </svg>
                                            Filter
                                            {hasActiveFilters && (
                                                <span className="bg-white text-blue-500 rounded-full px-2 py-0.5 text-xs font-medium">
                                                    {uniquePersonDateCombinations.length}
                                                </span>
                                            )}
                                        </button>
                                        
                                        {hasActiveFilters && (
                                            <button
                                                onClick={clearFilters}
                                                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Reset
                                            </button>
                                        )}
                                    </div>

                                    {/* Tombol Grafik dan Tambah - Kanan */}
                                    <div className="flex items-center gap-3">
                                        {/* Tombol Grafik per Peralatan */}
                                        <button
                                            onClick={() => setShowEquipmentCharts(true)}
                                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center space-x-2 whitespace-nowrap"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                            </svg>
                                            <span className="hidden lg:inline xl:inline">Grafik per Peralatan</span>
                                            <span className="lg:hidden">Grafik</span>
                                        </button>

                                        {/* Tombol Tambah Penanggung Jawab & Tanggal */}
                                        <button
                                            onClick={() => setShowAddPersonDateModal(true)}
                                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center space-x-2 whitespace-nowrap"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <span className="hidden lg:inline xl:inline">Tambah Penanggung Jawab & Tanggal</span>
                                            <span className="lg:hidden">Tambah PJ</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Filter Controls */}
                                {showFilter && (
                                    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Filter Bulan */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Bulan
                                                </label>
                                                <select
                                                    value={selectedMonth}
                                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Semua Bulan</option>
                                                    {months.map(month => (
                                                        <option key={month.value} value={month.value}>
                                                            {month.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Filter Tahun */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Tahun
                                                </label>
                                                <select
                                                    value={selectedYear}
                                                    onChange={(e) => setSelectedYear(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Semua Tahun</option>
                                                    {availableYears.map(year => (
                                                        <option key={year} value={year}>
                                                            {year}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Info Filter Aktif */}
                                {hasActiveFilters && (
                                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                                        {selectedMonth && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                                {months.find(m => m.value === selectedMonth)?.label}
                                                <button
                                                    onClick={() => setSelectedMonth('')}
                                                    className="ml-1 hover:text-blue-600"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </span>
                                        )}
                                        {selectedYear && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                                {selectedYear}
                                                <button
                                                    onClick={() => setSelectedYear('')}
                                                    className="ml-1 hover:text-blue-600"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </span>
                                        )}
                                    </div>
                                )}
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
                                                <h3 className="text-[15px] md:text-2xl xl:text-3xl font-bold text-gray-800 mb-4 text-center">
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
                                                <h4 className="text-[15px] md:text-2xl xl:text-3xl font-semibold text-gray-800 mb-4 text-center">
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
                                                            <YAxis 
                                                                domain={[0, 3]}
                                                                type="number"
                                                                tickCount={4}
                                                                tickFormatter={(value) => getStatusLabelFromScore(value)}
                                                                allowDecimals={false}
                                                                tick={{ fontSize: 11, fill: '#666' }}
                                                                width={120}
                                                            />
                                                            <Tooltip 
                                                                formatter={(value, name) => {
                                                                    if (value === null) return ['Tidak Ada Data', name];
                                                                    return [getStatusLabelFromScore(value), name];
                                                                }}
                                                                labelFormatter={(label) => `Tanggal: ${label}`}
                                                            />
                                                            <Legend />
                                                            {statusOptions.map((status) => (
                                                                <Line 
                                                                    key={status}
                                                                    type="stepAfter"
                                                                    dataKey={status} 
                                                                    stroke={getStatusColor(status)}
                                                                    strokeWidth={3}
                                                                    connectNulls={false}
                                                                    dot={{ fill: getStatusColor(status), strokeWidth: 2, r: 5 }}
                                                                    activeDot={{ r: 7, fill: getStatusColor(status) }}
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
                                    <h3 className="text-[15px] md:text-2xl xl:text-3xl font-bold text-gray-800 mb-6 text-center">
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

                                {/* LINE CHART  */}
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
                                                <YAxis 
                                                    domain={[0, 3]}
                                                    type="number"
                                                    tickCount={4}
                                                    tickFormatter={formatYAxisTick}
                                                    allowDecimals={false}
                                                    tick={{ fontSize: 11, fill: '#666' }}
                                                    width={120}
                                                />
                                                <Tooltip 
                                                    formatter={(value, name) => {
                                                        if (value === null) return ['Tidak Ada Data', name];
                                                        return [getStatusLabelFromScore(value), name];
                                                    }}
                                                    labelFormatter={(label) => `Tanggal: ${label}`}
                                                />
                                                <Legend />
                                                {statusOptions.map((status) => (
                                                    <Line 
                                                        key={status}
                                                        type="stepAfter"
                                                        dataKey={status}
                                                        stroke={getStatusColor(status)}
                                                        strokeWidth={3}
                                                        connectNulls={false}
                                                        dot={{ fill: getStatusColor(status), strokeWidth: 2, r: 5 }}
                                                        activeDot={{ r: 7, fill: getStatusColor(status) }}
                                                    />
                                                ))}
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Status Legend - TETAP */}
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Keterangan Status Peralatan</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {statusOptions.map((status, index) => (
                                            <div key={status} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                <div 
                                                    className="w-4 h-4 rounded-full"
                                                    style={{ backgroundColor: getStatusColor(status) }}
                                                ></div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-800">{status}</p>
                                                    <p className="text-sm text-gray-600">Level: {getStatusScore(status)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <strong>Level Status:</strong> OK (0) = Normal, Rusak (1) = Bermasalah, Perbaikan (2) = Dalam Perbaikan, Tidak Beroperasi (3) = Tidak Berfungsi
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {logbookData.length === 0 && !loading && !error ? (
                            <div className="text-center py-8">
                                <p className="text-gray-600 text-sm md:text-base">
                                    Tidak ada data yang ditemukan.
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

                                            {userRole === "admin" && (
                                                <button
                                                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenKebabMenu(comboId);
                                                    }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                                                    </svg>
                                                </button>
                                            )}

                                            {openKebabMenuId === comboId && userRole === "admin" && (
                                                <div
                                                    className="absolute top-10 right-2 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                                                    onMouseLeave={handleCloseKebabMenu}
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
                            
                            {/* Dropdown untuk memilih penanggung jawab */}
                            <select
                                id="newPersonDatePenanggungJawab"
                                className="w-full p-2 md:p-3 border border-gray-300 rounded-md text-sm md:text-base bg-white"
                                value={newPersonDatePenanggungJawab}
                                onChange={(e) => {
                                    if (e.target.value === 'add_new') {
                                        setShowAddNewPersonInput(true);
                                        setNewPersonDatePenanggungJawab('');
                                    } else {
                                        setShowAddNewPersonInput(false);
                                        setNewPersonDatePenanggungJawab(e.target.value);
                                    }
                                }}
                            >
                                <option value="">-- Pilih Penanggung Jawab --</option>
                                {/* Data dummy nama-nama penanggung jawab */}
                                <option value="'Kurniawan Raharjo, S.T.">'Kurniawan Raharjo, S.T.</option>
                                <option value="Agusto Pramana Putera, S.Tr">Agusto Pramana Putera, S.Tr</option>
                                <option value="Ahmad Fauzi, S.T">Ahmad Fauzi, S.T</option>
                                <option value="Nastiti Siwi Risantika, S.Tr.Inst">Nastiti Siwi Risantika, S.Tr.Inst</option>
                                <option value="Badia Lumbanbatu, STr Inst">Badia Lumbanbatu, STr Inst</option>
                                <option value="Mapasena Farid Wijaya, S.Tr Inst">Mapasena Farid Wijaya, S.Tr Inst</option>
                                <option value="Muhammad Rony Zakaria, STr Inst">Muhammad Rony Zakaria, STr Inst</option>
                                <option value="add_new" className="bg-blue-50 text-blue-600 font-medium">
                                    + Tambah Nama Baru
                                </option>
                            </select>
                            {/* Input untuk nama baru jika memilih "Tambah Nama Baru" */}
                            {showAddNewPersonInput && (
                                <div className="mt-3">
                                    <input
                                        type="text"
                                        className="w-full p-2 md:p-3 border border-blue-300 rounded-md text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={newPersonName}
                                        onChange={(e) => setNewPersonName(e.target.value)}
                                        placeholder="Masukkan nama penanggung jawab baru"
                                        autoFocus
                                    />
                                    <div className="flex justify-end space-x-2 mt-2">
                                        <button
                                            onClick={() => {
                                                setShowAddNewPersonInput(false);
                                                setNewPersonName('');
                                                setNewPersonDatePenanggungJawab('');
                                            }}
                                            className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (newPersonName.trim()) {
                                                    setNewPersonDatePenanggungJawab(newPersonName.trim());
                                                    setShowAddNewPersonInput(false);
                                                    setNewPersonName('');
                                                    // Opsional: Tambahkan nama baru ke data dummy untuk penggunaan selanjutnya
                                                    // setPenanggungJawabList(prev => [...prev, newPersonName.trim()]);
                                                }
                                            }}
                                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                            disabled={!newPersonName.trim()}
                                        >
                                            Simpan
                                        </button>
                                    </div>
                                </div>
                            )}
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
                        <div className="mb-4">
                            <label
                                htmlFor="editedBuktiFotoFile"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Unggah Bukti Foto Baru
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
                                onChange={(e) => {
                                    setEditedBuktiFotoFile(e.target.files[0]);
                                    setRemoveExistingPhoto(false); 
                                }}
                                disabled={isUploading}
                            />
                            {editedBuktiFotoFile && (
                                <p className="mt-2 text-xs text-gray-500">
                                    File dipilih: {editedBuktiFotoFile.name}
                                </p>
                            )}
                            {isUploading && (
                                <p className="mt-2 text-blue-500 text-sm">Mengunggah foto...</p>
                            )}
                        </div>
                        {/* Opsi Hapus Foto Lama atau Tampilkan Link Foto Lama */}
                        {editedBuktiFotoURL && !editedBuktiFotoFile && (
                            <div className="mb-6 flex items-center">
                                <input
                                    type="checkbox"
                                    id="removeExistingPhoto"
                                    checked={removeExistingPhoto}
                                    onChange={(e) => setRemoveExistingPhoto(e.target.checked)}
                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                                <label htmlFor="removeExistingPhoto" className="ml-2 text-sm text-gray-700">
                                    Hapus foto saat ini
                                </label>
                                {!removeExistingPhoto && (
                                    <p className="ml-4 text-xs text-gray-500">
                                        Foto saat ini: <a href={editedBuktiFotoURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Lihat Foto</a>
                                    </p>
                                )}
                            </div>
                        )}
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