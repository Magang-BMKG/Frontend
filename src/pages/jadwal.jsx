import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../component/Header";
import Sidebar from "../component/sidebar";
import Footer from "../component/Footer";

const JadwalPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeCard, setActiveCard] = useState(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigate = (path, dayId) => {
    console.log("Attempting to navigate to:", path);
    console.log("Setting active card to:", dayId);
    
    // Set active card when clicked
    setActiveCard(dayId);
    
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
    if (location.pathname === "/jadwalSeninPage") {
      setActiveCard("senin");
    } else if (location.pathname === "/jadwalSelasaPage") {
      setActiveCard("selasa");
    } else if (location.pathname === "/jadwal/rabu") {
      setActiveCard("rabu");
    } else if (location.pathname === "/jadwal/kamis") {
      setActiveCard("kamis");
    } else if (location.pathname === "/jadwal/insidental") {
      setActiveCard("insidental");
    }
  }, [location.pathname]);

  // Day cards data
  const dayCards = [
    {
      id: 'senin',
      title: 'Senin',
      route: '/jadwal/senin',
      textColor: 'group-hover:text-blue-600'
    },
    {
      id: 'selasa',
      title: 'Selasa',
      route: '/jadwal/selasa', // Ubah ke '#' jika belum ready
      textColor: 'group-hover:text-blue-600'
    },
    {
      id: 'rabu',
      title: 'Rabu',
      route: '/jadwal/rabu', // Ubah ke '#' jika belum ready
      textColor: 'group-hover:text-blue-600'
    },
    {
      id: 'kamis',
      title: 'Kamis',
      route: '/jadwal/kamis', // Ubah ke '#' jika belum ready
      textColor: 'group-hover:text-blue-600'
    },
    {
      id: 'insidental',
      title: 'Insidental',
      route: '/jadwal/insidental', // Ubah ke '#' jika belum ready
      textColor: 'group-hover:text-blue-600'
    }
  ];

  // Calendar icon component
  const CalendarIcon = ({ className = "w-12 h-12 sm:w-16 sm:h-16" }) => (
    <svg 
      className={className} 
      viewBox="0 0 55 55" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M36.6667 4.5835V13.7502M18.3333 4.5835V13.7502M6.875 22.9168H48.125M11.4583 9.16683H43.5417C46.073 9.16683 48.125 11.2189 48.125 13.7502V45.8335C48.125 48.3648 46.073 50.4168 43.5417 50.4168H11.4583C8.92703 50.4168 6.875 48.3648 6.875 45.8335V13.7502C6.875 11.2189 8.92703 9.16683 11.4583 9.16683Z"/>
    </svg>
  );

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
        <main className="flex-1 w-full min-w-0 p-4 md:p-6 xl:p-20 max-w-7xl mx-auto lg:mx-40 lg:ml-18 xl:ml-2 bg-grey-300">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-center text-2xl sm:text-3xl font-bold text-gray-800 mb-8 sm:mb-20">
              Pemeliharaan Berkala
            </h1>

            {/* Cards Container - Responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 sm:gap-8">
              {dayCards.map((day) => (
                <div
                  key={day.id}
                  onClick={() => handleNavigate(day.route, day.id)}
                  className={`bg-white rounded-lg shadow-lg border border-gray-200 p-6 sm:p-8 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group ${
                    day.route === "#" 
                      ? "opacity-75 cursor-not-allowed" 
                      : ""
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Calendar Icon with dynamic colors */}
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 mb-4 sm:mb-6 ${day.bgColor} rounded-full flex items-center justify-center ${day.hoverBgColor} transition-colors`}>
                      <CalendarIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 group-hover:text-current" />
                    </div>
                    
                    {/* Day Title */}
                    <h3 className={`text-xl sm:text-2xl font-semibold transition-colors ${
                      activeCard === day.id 
                        ? "text-blue-600" 
                        : `text-gray-800 ${day.textColor}`
                    }`}>
                      {day.title}
                    </h3>
                    
                    {/* Coming Soon Badge */}
                    {day.route === "#" && (
                      <span className="mt-2 px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded-full">
                        Coming Soon
                      </span>
                    )}
                    
                    {/* Optional subtitle or description - only show if not coming soon */}
                    {day.route !== "#" && (
                      <p className="text-sm text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {day.id === 'insidental' ? 'Kegiatan mendadak' : 'Kegiatan terjadwal'}
                      </p>
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

export default JadwalPage;