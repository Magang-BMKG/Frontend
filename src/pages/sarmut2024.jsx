import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaChartLine, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import Header from "../component/Header";
import Sidebar from "../component/sidebar";
import Footer from "../component/Footer";

// Fungsi helper untuk mengonversi angka bulan menjadi nama bulan
const getMonthName = (monthNumber) => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return monthNames[monthNumber - 1] || '';
};

const Sarmut2024 = () => {
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataSarmut, setDataSarmut] = useState([]); // State untuk data mentah dari Apps Script
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk data yang sudah diproses agar sesuai dengan struktur komponen
  const [processedMetricsData, setProcessedMetricsData] = useState([]);
  const [processedChartData, setProcessedChartData] = useState({});

  // State untuk editing di dalam modal
  const [editingRow, setEditingRow] = useState(null); // { uraian: '...', bulan: X }
  const [editRowFormInput, setEditRowFormInput] = useState({});
  const [editRowMessage, setEditRowMessage] = useState('');
  const [isRowSaving, setIsRowSaving] = useState(false);

  // Ganti dengan URL Aplikasi Web Google Apps Script Anda yang sudah di-deploy!
  const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyTX4AdbiifNFiYSj-rCenlglNa2M5jE6PEBZIcuDTnybPw4DZTB21B-UsA5lKK51dtVw/exec'; 

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <div className="flex-1 p-6">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard SARMUT 2024</h2>
            <p className="text-gray-600">Monitoring Sistem Peralatan Operasional</p>
          </div>

          {/* Loading and Error States */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <p className="text-lg text-gray-700">Memuat data dari Google Sheet...</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center bg-red-100 text-red-800 p-4 rounded-lg shadow-md mb-4">
              <p className="text-xl font-bold mb-2">Terjadi Kesalahan Saat Memuat Data:</p>
              <p className="text-lg">{error}</p>
              <p className="text-md mt-4">Pastikan URL Google Apps Script Anda benar, script telah di-deploy dengan benar, dan sheet 'SARMUT' ada di spreadsheet.</p>
            </div>
          )}

          {!loading && !error && processedMetricsData.length === 0 && (
            <p className="text-center text-gray-600 text-lg py-8">Tidak ada data SARMUT yang tersedia untuk ditampilkan.</p>
          )}

          {/* Metrics Grid */}
          {!loading && !error && processedMetricsData.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {processedMetricsData.map((metric, index) => {
                  const IconComponent = metric.icon;
                  return (
                    <div
                      key={metric.id}
                      className="bg-white rounded-lg shadow-md p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      onClick={() => handleMetricClick(metric)}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-full ${metric.color}`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          metric.status === 'success' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {metric.status === 'success' ? 'Target Tercapai' : 'Perlu Perhatian'}
                        </div>
                      </div>
                      
                      <h3 className="text-sm text-gray-600 mb-2 line-clamp-3">
                        {metric.title}
                      </h3>
                      
                      <div className="text-3xl font-bold text-gray-900 mb-2">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{summaryStats.totalIndicators}</div>
                  <div className="text-gray-600">Total Indikator</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{summaryStats.targetAchieved}</div>
                  <div className="text-gray-600">Target Tercapai</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{summaryStats.needsAttention}</div>
                  <div className="text-gray-600">Perlu Perhatian</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{summaryStats.averagePerformance}%</div>
                  <div className="text-gray-600">Rata-rata Kinerja</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal for Charts and Table */}
      {isModalOpen && selectedMetric && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Detail: {selectedMetric.title}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tabel Data Bulanan */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Data Bulanan</h4>
                  {editRowMessage && (
                    <p className={`mb-3 text-center ${editRowMessage.includes('Gagal') ? 'text-red-600' : 'text-green-600'} font-medium`}>
                      {editRowMessage}
                    </p>
                  )}
                  <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
                    <table className="min-w-full bg-white">
                      <thead className="bg-blue-100 text-blue-800">
                        <tr>
                          <th className="py-2 px-3 text-left text-sm font-semibold">Bulan</th>
                          <th className="py-2 px-3 text-left text-sm font-semibold">Persentase</th>
                          <th className="py-2 px-3 text-left text-sm font-semibold">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {processedChartData[selectedMetric.id]?.data.map((item, index) => (
                          <tr key={item.Bulan} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="py-2 px-3 text-gray-800 text-sm">
                              {getMonthName(item.Bulan)}
                            </td>
                            <td className="py-2 px-3 text-gray-800 text-sm">
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
                            <td className="py-2 px-3 text-sm">
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
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Grafik Persentase Bulanan</h4>
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

export default Sarmut2024;
