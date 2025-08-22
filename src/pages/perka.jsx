import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../component/Header";
import Sidebar from "../component/sidebar";
import Footer from "../component/Footer";

const PerkaPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigate = (path) => {
    navigate(path);
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

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-center text-2xl sm:text-3xl font-bold text-gray-800 mb-8 sm:mb-12">
              Perka
            </h1>

            {/* Cards Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Card Mekanik */}
              <div
                onClick={() => handleNavigate("/perkaMekanik")}
                className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 sm:p-8 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Placeholder untuk SVG Icon Mekanik */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mb-4 sm:mb-6 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    {/* Tempat untuk SVG dari Figma - Mekanik */}
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-300 rounded"></div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    Mekanik
                  </h3>
                </div>
              </div>

              {/* Card Canggih */}
              <div
                onClick={() => handleNavigate("/perkaCanggih")}
                className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 sm:p-8 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Placeholder untuk SVG Icon Canggih */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mb-4 sm:mb-6 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    {/* Tempat untuk SVG dari Figma - Canggih */}
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-300 rounded"></div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    Canggih
                  </h3>
                </div>
              </div>

              {/* Card Sederhana Elektronik */}
              <div
                onClick={() => handleNavigate("/perkaSederhana")}
                className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 sm:p-8 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Placeholder untuk SVG Icon Sederhana Elektronik */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mb-4 sm:mb-6 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    {/* Tempat untuk SVG dari Figma - Sederhana Elektronik */}
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-300 rounded"></div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    Sederhana Elektronik
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PerkaPage;