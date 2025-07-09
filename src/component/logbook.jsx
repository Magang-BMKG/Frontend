import React, { useState, useEffect, useMemo } from 'react';
import Header from './Header'; 
import Sidebar from './Sidebar'; 
import Footer from './Footer'; 

const LogbookPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
      // Toggle sidebar untuk mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
          <div className="mb-4 sm:mb-6 md:mb-8 flex justify-center px-2 sm:px-0">
            <div className="w-full max-w-sm sm:max-w-md">
              <div className="flex flex-col items-center gap-3 sm:gap-4  p-3 sm:p-4 md:p-6 shadow-md rounded-lg">
                <label className="font-medium text-[12px] sm:text-base md:text-lg text-gray-700 text-center leading-relaxed">
                  Filter Berdasarkan Kategori Kode:
                </label>
                
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

export default LogbookPage;