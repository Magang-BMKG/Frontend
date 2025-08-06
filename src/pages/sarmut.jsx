import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Import hooks router
import { FaCalendarAlt, FaArchive, FaFileAlt } from "react-icons/fa";
import Header from "../component/Header";
import Sidebar from "../component/sidebar";
import Footer from "../component/Footer";

const SarmutPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [error, setError] = useState(null);
  
  // Initialize router hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Error boundary simulation
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button 
            onClick={() => setError(null)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigate = (path, year) => {
    console.log("Attempting to navigate to:", path);
    console.log("Setting active card to:", year);
    
    // Set active card when clicked
    setActiveCard(year);
    
    if (path === "#") {
      console.log("Path is '#', navigation cancelled");
      return;
    }
    
    try {
      // Navigate to the specified path
      navigate(path);
      console.log("Navigation successful to:", path);
    } catch (error) {
      console.error("Navigation error:", error);
      setError(new Error("Failed to navigate to " + path));
    }
  };

  // Check if current path matches any card to set initial active state
  useEffect(() => {
    const currentPath = location.pathname;
    console.log("Current path:", currentPath);
    
    if (currentPath === "/sarmut2024") {
      setActiveCard("2024");
    } else if (currentPath === "/sarmut2025") {
      setActiveCard("2025");  
    } else if (currentPath === "/sarmut2026") {
      setActiveCard("2026");
    }
  }, [location.pathname]);

  const cards = [
    { 
      icon: <FaArchive className="text-4xl sm:text-5xl lg:text-6xl text-black" />, 
      title: "Sarmut 2024", 
      year: "2024", 
      path: "/sarmut2024" 
    },
    { 
      icon: <FaFileAlt className="text-4xl sm:text-5xl lg:text-6xl text-black" />, 
      title: "Sarmut 2025", 
      year: "2025", 
      path: "#"
    },
    { 
      icon: <FaCalendarAlt className="text-4xl sm:text-5xl lg:text-6xl text-black" />, 
      title: "Sarmut 2026", 
      year: "2026", 
      path: "#"
    },
  ];

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
        {/* Sidebar - Hidden on mobile, overlay when open */}
        <div
          className={`
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static absolute inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
        `}
        >
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-center text-[20px] sm:text-3xl font-bold text-gray-800 mb-4">
              Sasaran Mutu (SARMUT)
            </h1>
            <p className="text-center text-gray-600 mb-8 sm:mb-12">
              Pilih tahun untuk mengakses data Sasaran Mutu
            </p>

            {/* Cards Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {cards.map(({ icon, title, year, path }) => (
                <div
                  key={year}
                  onClick={() => handleNavigate(path, year)}
                  className={`bg-white rounded-lg shadow-lg border border-gray-200 p-6 sm:p-8 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group ${
                    path === "#" 
                      ? "opacity-75 cursor-not-allowed" 
                      : ""
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Icon Container */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 mb-4 sm:mb-6 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                      {icon}
                    </div>
                    
                    {/* Title */}
                    <h3 className={`text-xl sm:text-2xl font-semibold transition-colors ${
                      activeCard === year 
                        ? "text-blue-600" 
                        : "text-gray-800 group-hover:text-blue-600"
                    }`}>
                      {title}
                    </h3>
                    
                    {/* Year Badge */}
                    <div className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-black text-white text-sm rounded-full font-medium">
                      Tahun {year}
                    </div>
                    
                    {/* Coming Soon Badge */}
                    {path === "#" && (
                      <span className="mt-2 px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SarmutPage;