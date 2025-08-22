import React, { useState, useEffect } from "react";
import { WiSunrise, WiDaySunny, WiNightClear } from "react-icons/wi";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../component/Header";
import Sidebar from "../component/sidebar";
import Footer from "../component/Footer";

const LogbookPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigate = (path, time) => {
    console.log("Attempting to navigate to:", path);
    console.log("Setting active card to:", time);
    
    // Set active card when clicked
    setActiveCard(time);
    
    if (path === "#") {
      console.log("Path is '#', navigation cancelled");
      return;
    }
    
    try {
      navigate(path);
      console.log("Navigation successful to:", path);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  // Check if current path matches any card to set initial active state
  useEffect(() => {
    if (location.pathname === "/logbookPagi") {
      setActiveCard("Pagi");
    } else if (location.pathname === "/logbookSiang") {
      setActiveCard("Siang");
    } else if (location.pathname === "/logbookMalam") {
      setActiveCard("Malam");
    }
  }, [location.pathname]);

  const cards = [
    { 
      icon: <WiSunrise className="text-4xl sm:text-5xl lg:text-6xl text-yellow-500" />, 
      title: "Log Book Pagi", 
      time: "Pagi", 
      path: "/logbookPagi" 
    },
    { 
      icon: <WiDaySunny className="text-4xl sm:text-5xl lg:text-6xl text-orange-500" />, 
      title: "Log Book Siang", 
      time: "Siang", 
      path: "#" 
    },
    { 
      icon: <WiNightClear className="text-4xl sm:text-5xl lg:text-6xl text-blue-500" />, 
      title: "Log Book Malam", 
      time: "Malam", 
      path: "#" 
    },
  ];

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
        <main className="flex-1 w-full min-w-0 p-4 md:p-6 xl:p-8 max-w-7xl mx-auto lg:mx-40 lg:ml-18 xl:ml-2 bg-grey-300">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-center text-[20px] sm:text-3xl font-bold text-gray-800 mb-8 sm:mb-12">
              Log Book
            </h1>

            {/* Cards Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {cards.map(({ icon, title, time, path }) => (
                <div
                  key={time}
                  onClick={() => handleNavigate(path, time)}
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
                      activeCard === time 
                        ? "text-blue-600" 
                        : "text-gray-800 group-hover:text-blue-600"
                    }`}>
                      {title}
                    </h3>
                    
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

export default LogbookPage;
