import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Area, AreaChart } from 'recharts';
import { FaCheckCircle, FaExclamationTriangle, FaCog, FaFileAlt, FaDesktop } from 'react-icons/fa';
import Header from "../component/Header";
import Sidebar from "../component/sidebar";
import Footer from "../component/Footer";

const Sarmut2024 = () => {
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const metricsData = [
    {
      id: 'identifikasi',
      title: 'Respon Tindakan Identifikasi Kerusakan Peralatan Operasional (1x24 jam)',
      value: 100,
      status: 'success',
      icon: FaCheckCircle,
      color: 'bg-green-500'
    },
    {
      id: 'pemeliharaan',
      title: 'Pelaksanaan Pemeliharaan Peralatan (Mekanik, Elektronik, dan Teknologi Modern)',
      value: 100,
      status: 'success',
      icon: FaCog,
      color: 'bg-green-500'
    },
    {
      id: 'aloptama',
      title: 'Kinerja ALOPTAMA Peralatan Operasional ON',
      value: 95,
      status: 'warning',
      icon: FaExclamationTriangle,
      color: 'bg-orange-500'
    },
    {
      id: 'taman',
      title: 'Pelaksanaan Pemeliharaan Taman Alat Sesuai Jadwal',
      value: 100,
      status: 'success',
      icon: FaCheckCircle,
      color: 'bg-green-500'
    },
    {
      id: 'laporan',
      title: 'Penyampaian Laporan dalam Waktu 1x24 Jam Setelah Kegiatan',
      value: 90,
      status: 'warning',
      icon: FaFileAlt,
      color: 'bg-orange-500'
    },
    {
      id: 'monitoring',
      title: 'Monitoring dan Evaluasi 3 Bulan Sekali',
      value: 100,
      status: 'success',
      icon: FaDesktop,
      color: 'bg-green-500'
    }
  ];

  const chartData = {
    identifikasi: {
      title: 'Respon Identifikasi Kerusakan Peralatan',
      type: 'line',
      data: [
        { name: 'Jan', value: 98 },
        { name: 'Feb', value: 100 },
        { name: 'Mar', value: 100 },
        { name: 'Apr', value: 99 },
        { name: 'Mei', value: 100 },
        { name: 'Jun', value: 100 },
        { name: 'Jul', value: 100 },
        { name: 'Agu', value: 100 },
        { name: 'Sep', value: 99 },
        { name: 'Okt', value: 100 },
        { name: 'Nov', value: 100 },
        { name: 'Des', value: 100 }
      ]
    },
    pemeliharaan: {
      title: 'Pemeliharaan Peralatan',
      type: 'pie',
      data: [
        { name: 'Mekanik', value: 100 },
        { name: 'Elektronik', value: 100 },
        { name: 'Teknologi Modern', value: 100 }
      ]
    },
    aloptama: {
      title: 'Kinerja ALOPTAMA Peralatan',
      type: 'bar',
      data: [
        { name: 'Q1', value: 93 },
        { name: 'Q2', value: 95 },
        { name: 'Q3', value: 96 },
        { name: 'Q4', value: 95 }
      ]
    },
    taman: {
      title: 'Pemeliharaan Taman Alat',
      type: 'radar',
      data: [
        { subject: 'Mingguan', A: 100, fullMark: 100 },
        { subject: 'Bulanan', A: 100, fullMark: 100 },
        { subject: 'Triwulan', A: 100, fullMark: 100 },
        { subject: 'Tahunan', A: 100, fullMark: 100 }
      ]
    },
    laporan: {
      title: 'Ketepatan Waktu Laporan',
      type: 'pie',
      data: [
        { name: 'Tepat Waktu', value: 90 },
        { name: 'Terlambat', value: 10 }
      ]
    },
    monitoring: {
      title: 'Pelaksanaan Monitoring & Evaluasi',
      type: 'area',
      data: [
        { name: 'Triwulan 1', value: 100 },
        { name: 'Triwulan 2', value: 100 },
        { name: 'Triwulan 3', value: 100 },
        { name: 'Triwulan 4', value: 100 }
      ]
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const handleMetricClick = (metric) => {
    setSelectedMetric(metric);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMetric(null);
  };

  const renderChart = (data, type) => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Persentase']} />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Persentase']} />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar name="Persentase" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Persentase']} />
              <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const summaryStats = {
    totalIndicators: metricsData.length,
    targetAchieved: metricsData.filter(m => m.status === 'success').length,
    needsAttention: metricsData.filter(m => m.status === 'warning').length,
    averagePerformance: (metricsData.reduce((sum, m) => sum + m.value, 0) / metricsData.length).toFixed(1)
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

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {metricsData.map((metric, index) => {
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
        </div>
      </div>

      {/* Modal for Charts */}
      {isModalOpen && selectedMetric && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {chartData[selectedMetric.id]?.title}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4">
                {renderChart(
                  chartData[selectedMetric.id]?.data,
                  chartData[selectedMetric.id]?.type
                )}
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                  <div className={`w-4 h-4 rounded-full ${selectedMetric.color}`}></div>
                  <span className="font-medium">Nilai Saat Ini: {selectedMetric.value}%</span>
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