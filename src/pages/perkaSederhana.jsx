// pages/PerkaSederhanaElektronik.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../component/Header";
import Sidebar from "../component/sidebar";
import Footer from "../component/Footer";

const PerkaSederhanaElektronik = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleBack = () => {
    navigate("/perka");
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
          lg:translate-x-0 lg:static absolute inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
        `}
        >
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Kembali ke Perka
            </button>

            <h1 className="text-center text-2xl sm:text-3xl font-bold text-gray-800 mb-8">
              Perka Sederhana Elektronik
            </h1>

            {/* Content Container */}
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  {/* Tempat untuk SVG Icon Sederhana Elektronik */}
                  <div className="w-16 h-16 bg-gray-300 rounded"></div>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Halaman Perka Sederhana Elektronik
                </h2>
                <p className="text-gray-600">
                  Konten untuk halaman Perka Sederhana Elektronik akan ditampilkan di sini.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default PerkaSederhanaElektronik;