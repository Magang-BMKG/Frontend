import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaChartLine, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { IoClose } from "react-icons/io5";
import Header from "../component/Header";
import Sidebar from "../component/sidebar";
import Footer from "../component/Footer";

// Fungsi helper untuk mengonversi angka bulan menjadi nama bulan
const getMonthName = (monthNumber) => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return monthNames[monthNumber - 1] || '';
};

const Sarmut2025 = () => {
  const navigate = useNavigate();
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataSarmut, setDataSarmut] = useState([]); // State untuk data mentah dari Apps Script
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State untuk data yang sudah diproses agar sesuai dengan struktur komponen
  const [processedMetricsData, setProcessedMetricsData] = useState([]);
  const [processedChartData, setProcessedChartData] = useState({});

  // State untuk editing di dalam modal
  const [editingRow, setEditingRow] = useState(null); // { uraian: '...', bulan: X }
  const [editRowFormInput, setEditRowFormInput] = useState({});
  const [editRowMessage, setEditRowMessage] = useState('');
  const [isRowSaving, setIsRowSaving] = useState(false);

  // Ganti dengan URL Aplikasi Web Google Apps Script Anda yang sudah di-deploy!
  const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwut02e4kiilx4MsdCAtj_h3OxqSrD_xvTEHkoW903jLhiyV1DFLs9bt9y171wIMp2N/exec'; 

  // Fungsi untuk mengambil data dari Google Sheet
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      const rawData = Array.isArray(result.data) ? result.data : result;
      setDataSarmut(rawData);
      processFetchedData(rawData); // Proses data setelah diambil
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle sidebar untuk mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  // Fungsi untuk memproses data mentah dari Apps Script menjadi format yang dibutuhkan komponen
  const processFetchedData = (rawData) => {
    const metricsMap = new Map(); // Untuk mengumpulkan data metrik unik
    const chartsMap = new Map(); // Untuk mengumpulkan data chart per uraian

    rawData.forEach(item => {
      const uraian = item.URAIAN;
      const bulan = parseInt(item.Bulan); // Pastikan Bulan adalah angka
      const persentase = parseFloat(String(item.Persentase).replace(',', '.')); // Pastikan Persentase adalah angka, handle koma

      if (!uraian) return; // Lewati jika uraian kosong

      // Buat ID yang konsisten untuk metrik dan chart
      const metricId = uraian.replace(/\s+/g, '-').toLowerCase();

      // Untuk metricsData: hitung rata-rata persentase untuk setiap uraian
      if (!metricsMap.has(metricId)) { // Gunakan metricId sebagai kunci
        metricsMap.set(metricId, {
          id: metricId, // Simpan ID yang konsisten
          title: uraian,
          totalPersentase: 0,
          count: 0,
          value: 0, // Rata-rata akhir
          status: 'warning', 
          icon: FaChartLine, 
          color: 'bg-orange-500'
        });
      }
      const currentMetric = metricsMap.get(metricId); // Dapatkan berdasarkan metricId
      if (!isNaN(persentase)) {
        currentMetric.totalPersentase += persentase;
        currentMetric.count += 1;
      }
      
      // Untuk chartData: kumpulkan data bulanan untuk setiap uraian
      if (!chartsMap.has(metricId)) { // Gunakan metricId sebagai kunci
        chartsMap.set(metricId, {
          title: uraian,
          type: 'bar', // Default ke bar chart
          data: []
        });
      }
      if (!isNaN(bulan) && !isNaN(persentase)) {
        chartsMap.get(metricId).data.push({ // Dapatkan berdasarkan metricId
          URAIAN: uraian, // Tambahkan URAIAN dan Bulan untuk identifikasi unik saat edit
          Bulan: bulan,
          name: getMonthName(bulan),
          Persentase: persentase // Gunakan Persentase sebagai key untuk chart
        });
      }
    });

    // Finalisasi metricsData: hitung rata-rata dan tentukan status/warna
    const finalMetricsData = Array.from(metricsMap.values()).map(metric => {
      metric.value = metric.count > 0 ? (metric.totalPersentase / metric.count).toFixed(1) : 0;
      metric.status = metric.value >= 95 ? 'success' : 'warning';
      metric.color = metric.value >= 95 ? 'bg-green-500' : 'bg-orange-500';
      delete metric.totalPersentase; // Hapus properti sementara
      delete metric.count;
      return metric;
    });

    // Sort chart data by month
    chartsMap.forEach(chart => {
      chart.data.sort((a, b) => a.Bulan - b.Bulan); // Urutkan berdasarkan angka bulan
    });

    setProcessedMetricsData(finalMetricsData);
    setProcessedChartData(Object.fromEntries(chartsMap));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const handleBack = () => {
    navigate("/sarmut");
  };

  const handleMetricClick = (metric) => {
    setSelectedMetric(metric);
    setIsModalOpen(true);
    setEditingRow(null); // Reset editing state when modal opens
    setEditRowMessage('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMetric(null);
    setEditingRow(null);
    setEditRowMessage('');
  };

  // Fungsi untuk memulai mode edit pada baris tabel di modal
  const handleEditRowClick = (item) => {
    setEditingRow({ uraian: item.URAIAN, bulan: item.Bulan });
    setEditRowFormInput({ ...item }); // Isi form dengan data item saat ini
    setEditRowMessage('');
  };

  // Tangani perubahan input form edit di modal
  const handleEditRowChange = (e) => {
    const { name, value } = e.target;
    setEditRowFormInput(prev => ({ ...prev, [name]: value }));
  };

  // Tangani pembatalan edit di modal
  const handleCancelRowEdit = () => {
    setEditingRow(null);
    setEditRowFormInput({});
    setEditRowMessage('');
  };

  // Tangani submit edit baris di modal
  const handleSaveRowEdit = async (e) => {
    e.preventDefault();
    setIsRowSaving(true);
    setEditRowMessage('');

    try {
      const payload = {
        URAIAN: editingRow.uraian,
        Bulan: editingRow.bulan,
        Persentase: parseFloat(String(editRowFormInput.Persentase).replace(',', '.')), // Pastikan Persentase adalah angka, handle koma
        _method: 'PUT', // Indikasikan ini adalah permintaan PUT
      };

      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        redirect: 'follow', // Pastikan mengikuti redirect jika ada
        method: 'POST', // Tetap gunakan POST, tetapi dengan _method: 'PUT'
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setEditRowMessage(result.message || 'Operasi berhasil!');
      if (result.success) {
        fetchData(); // Refresh data setelah berhasil diperbarui
        setEditingRow(null); // Keluar dari mode edit
      }
    } catch (e) {
      setEditRowMessage(`Gagal mengedit data: ${e.message}`);
    } finally {
      setIsRowSaving(false);
    }
  };


  const renderChart = (data, type) => {
    if (!data || data.length === 0) {
      return <p className="text-center text-gray-600">Tidak ada data chart yang tersedia.</p>;
    }
    // Untuk SARMUT, kita akan selalu menggunakan BarChart di modal
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" /> {/* 'name' adalah nama bulan */}
          <YAxis domain={[0, 100]} />
          <Tooltip formatter={(value) => [`${value}%`, 'Persentase']} />
          <Bar dataKey="Persentase" fill="#8884d8" /> {/* 'Persentase' adalah key dari data */}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const summaryStats = {
    totalIndicators: processedMetricsData.length,
    targetAchieved: processedMetricsData.filter(m => m.status === 'success').length,
    needsAttention: processedMetricsData.filter(m => m.status === 'warning').length,
    averagePerformance: processedMetricsData.length > 0
      ? (processedMetricsData.reduce((sum, m) => sum + parseFloat(m.value), 0) / processedMetricsData.length).toFixed(1)
      : 0
  };

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

        {/* Overlay untuk mobile ketika sidebar terbuka */}
        {isSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 bg-opacity-50 z-40"
            onClick={toggleSidebar}
          ></div>
        )}
        
        <div className="flex-1 p-4 sm:p-6 lg:p-12 max-w-7xl mx-auto static lg:absolute lg:left-48">
            {/* Dashboard Header */}
            <div className="mb-4 sm:mb-6">
              <button
                onClick={handleBack}
                className="mb-4 sm:mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors text-xs sm:text-sm md:text-base"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali ke Sarmut
              </button>
              <h2 className="text-center text-[18px] sm:text-[28px] font-bold mb-2 sm:mb-2">Dashboard SARMUT 2025</h2>
              <p className="text-black text-center text-[11px] sm:text-[17px]">Monitoring Sistem Peralatan Operasional</p>
            </div>

            {/* Loading and Error States */}
            {loading && (
              <div className="flex items-center justify-center py-40">
                <p className="text-[12px] sm:text-[20px] text-gray-700">Memuat data dari Google Sheet...</p>
              </div>
            )}
            {error && (
              <div className="flex flex-col items-center justify-center bg-red-100 text-red-800 p-4 rounded-lg shadow-md mb-4">
                <p className="text-[9px] sm:text-[15px] font-bold mb-2">Terjadi Kesalahan Saat Memuat Data:</p>
                <p className="text-[9px] sm:text-[15px]">{error}</p>
                <p className="text-[9px] sm:text-[15px] mt-4">Pastikan URL Google Apps Script Anda benar, script telah di-deploy dengan benar, dan sheet 'SARMUT' ada di spreadsheet.</p>
              </div>
            )}

            {!loading && !error && processedMetricsData.length === 0 && (
              <p className="text-center text-gray-600 text-[9px] sm:text-[15px] py-8">Tidak ada data SARMUT yang tersedia untuk ditampilkan.</p>
            )}

            {/* Metrics Grid */}
            {!loading && !error && processedMetricsData.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8 justify-items-center">
                  {processedMetricsData.map((metric, index) => {
                    const IconComponent = metric.icon;
                    return (
                      <div
                        key={metric.id}
                        className="bg-white rounded-lg shadow-md p-4 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg w-full max-w-sm"
                        onClick={() => handleMetricClick(metric)}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-2 rounded-full ${metric.color}`}>
                            <IconComponent className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                            metric.status === 'success' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {metric.status === 'success' ? 'Tercapai' : 'Perhatian'}
                          </div>
                        </div>
                        
                        <h3 className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2 leading-tight">
                          {metric.title}
                        </h3>
                        
                        <div className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                          {metric.value}%
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${metric.color}`}
                            style={{ width: `${metric.value}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 justify-items-center">
                  <div className="bg-white rounded-lg shadow-md p-6 text-center w-full max-w-xs">
                    <div className="text-[15px] sm:text-[17px] font-bold text-blue-600 mb-2">{summaryStats.totalIndicators}</div>
                    <div className="text-gray-600 text-[12px] sm:text-[16px]">Total Indikator</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6 text-center w-full max-w-xs">
                    <div className="text-[15px] sm:text-[17px] font-bold text-green-600 mb-2">{summaryStats.targetAchieved}</div>
                    <div className="text-gray-600 text-[12px] sm:text-[16px]">Target Tercapai</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6 text-center w-full max-w-xs">
                    <div className="text-[15px] sm:text-[17px] font-bold text-orange-600 mb-2">{summaryStats.needsAttention}</div>
                    <div className="text-gray-600 text-[12px] sm:text-[16px]">Perlu Perhatian</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6 text-center w-full max-w-xs">
                    <div className="text-[15px] sm:text-[17px] font-bold text-purple-600 mb-2">{summaryStats.averagePerformance}%</div>
                    <div className="text-gray-600 text-[12px] sm:text-[16px]">Rata-rata Kinerja</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        

      {/* Modal for Charts and Table */}
      {isModalOpen && selectedMetric && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-start justify-between p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-[9px] sm:text-[15px] md:text-base font-semibold text-black w-full text-justify">
                  Detail: {selectedMetric.title}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors ml-3 flex-shrink-0"
                >
                  <IoClose className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tabel Data Bulanan */}
                <div>
                  <h4 className="text-[9px] sm:text-[15px] font-semibold text-gray-800 mb-3">Data Bulanan</h4>
                  {editRowMessage && (
                    <p className={`mb-3 text-center ${editRowMessage.includes('Gagal') ? 'text-red-600' : 'text-green-600'} font-medium`}>
                      {editRowMessage}
                    </p>
                  )}
                  <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
                    <table className="min-w-full bg-white">
                      <thead className="bg-blue-100 text-blue-800">
                        <tr>
                          <th className="py-2 px-3 text-left text-[9px] sm:text-[15px] font-semibold">Bulan</th>
                          <th className="py-2 px-3 text-left text-[9px] sm:text-[15px] font-semibold">Persentase</th>
                          <th className="py-2 px-3 text-left text-[9px] sm:text-[15px] font-semibold">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {processedChartData[selectedMetric.id]?.data.map((item, index) => (
                          <tr key={item.Bulan} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="py-2 px-3 text-gray-800 text-[9px] sm:text-[15px]">
                              {getMonthName(item.Bulan)}
                            </td>
                            <td className="py-2 px-3 text-gray-800 text-[9px] sm:text-[15px]">
                              {editingRow && editingRow.uraian === item.URAIAN && editingRow.bulan === item.Bulan ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  name="Persentase"
                                  value={editRowFormInput.Persentase || ''}
                                  onChange={handleEditRowChange}
                                  className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                              ) : (
                                `${item.Persentase}%`
                              )}
                            </td>
                            <td className="py-2 px-3 text-[9px] sm:text-[15px]">
                              {editingRow && editingRow.uraian === item.URAIAN && editingRow.bulan === item.Bulan ? (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={handleSaveRowEdit}
                                    className="text-green-600 hover:text-green-800"
                                    disabled={isRowSaving}
                                  >
                                    <FaSave className="inline-block mr-1" /> {isRowSaving ? 'Menyimpan...' : 'Simpan'}
                                  </button>
                                  <button
                                    onClick={handleCancelRowEdit}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <FaTimes className="inline-block mr-1" /> Batal
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleEditRowClick(item)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <FaEdit className="inline-block mr-1" /> Edit
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Diagram Batang */}
                <div>
                  <h4 className="text-[9px] sm:text-[15px] font-semibold text-gray-800 mb-3">Grafik Persentase Bulanan</h4>
                  {renderChart(
                    processedChartData[selectedMetric.id]?.data,
                    'bar' // Selalu render BarChart di sini
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Sarmut2025;
