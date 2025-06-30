import React, { useState } from 'react';

// Custom React Icons
const UserIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const SettingsIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const BookIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
  </svg>
);

const CalendarIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
    <line x1="16" x2="16" y1="2" y2="6"/>
    <line x1="8" x2="8" y1="2" y2="6"/>
    <line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);

// Komponen halaman Desktop Teknisi
const DesktopTeknisi = () => (
  <div className="flex-1 p-6 bg-gray-50">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Profil Teknisi</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Informasi Pribadi</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Nama Lengkap</label>
                <p className="text-gray-900">Ahmad Teknisi</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">ID Teknisi</label>
                <p className="text-gray-900">TEK001</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">ahmad.teknisi@company.com</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">No. Telepon</label>
                <p className="text-gray-900">+62 812-3456-7890</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Informasi Pekerjaan</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Departemen</label>
                <p className="text-gray-900">IT Support</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Posisi</label>
                <p className="text-gray-900">Senior Technician</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Tanggal Bergabung</label>
                <p className="text-gray-900">15 Januari 2020</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Status</label>
                <span className="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                  Aktif
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Komponen halaman Tidak Ditemukan
const NotFound = ({ pageName }) => (
  <div className="flex-1 flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="text-6xl text-gray-300 mb-4">404</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Halaman Tidak Ditemukan</h1>
      <p className="text-gray-600 mb-4">
        Halaman "{pageName}" sedang dalam pengembangan.
      </p>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-md mx-auto">
        <p className="text-sm text-gray-500">
          Fitur ini akan segera tersedia. Silakan kembali lagi nanti.
        </p>
      </div>
    </div>
  </div>
);

const Sidebar = ({ 
  onNavigate, // Callback function untuk navigasi
  iconSize = { mobile: 20, tablet: 24, desktop: 28 }, 
  textSize = { mobile: 'text-[10px]', tablet: 'text-sm', desktop: 'text-sm' },
  sidebarWidth = { mobile: 'w-25', tablet: 'w-32', desktop: 'w-40' },
  spacing = { mobile: 'space-y-8', tablet: 'space-y-3', desktop: 'space-y-4' },
  padding = { mobile: 'p-6', tablet: 'p-3', desktop: 'p-4' }
}) => {
  const [activeItem, setActiveItem] = useState('profil');

  const menuItems = [
    { id: 'profil', icon: UserIcon, label: 'Profil Teknisi', shortLabel: 'Profil Teknisi', route: '/destopteknisi' },
    { id: 'meta', icon: SettingsIcon, label: 'Meta Data', shortLabel: 'Meta Data', route: '/not-found?page=metadata' },
    { id: 'logbook', icon: BookIcon, label: 'Log Book', shortLabel: 'Log Book', route: '/not-found?page=logbook' },
    { id: 'jadwal', icon: CalendarIcon, label: 'Jadwal', shortLabel: 'Jadwal', route: '/not-found?page=jadwal' }
  ];

  const handleItemClick = (item) => {
    setActiveItem(item.id);
    
    // Jika ada callback onNavigate, panggil untuk routing
    if (onNavigate) {
      onNavigate(item.route);
    } else {
      // Fallback: gunakan window.location untuk navigasi
      if (item.id === 'profil') {
        window.location.href = '/destopteknisi';
      } else {
        window.location.href = `/not-found?page=${item.label}`;
      }
    }
  };

  // Handle responsive values
  const getResponsiveValue = (value) => {
    if (typeof value === 'object') {
      return value;
    }
    return { mobile: value, tablet: value, desktop: value };
  };

  const responsiveIconSize = getResponsiveValue(iconSize);
  const responsiveTextSize = getResponsiveValue(textSize);
  const responsiveSidebarWidth = getResponsiveValue(sidebarWidth);
  const responsiveSpacing = getResponsiveValue(spacing);
  const responsivePadding = getResponsiveValue(padding);

  return (
    <div className={`
      ${responsiveSidebarWidth.mobile} 
      sm:${responsiveSidebarWidth.tablet} 
      md:${responsiveSidebarWidth.desktop}
      bg-white border-r border-gray-200 flex flex-col items-center py-4 sm:py-5 md:py-6 
      ${responsiveSpacing.mobile} 
      sm:${responsiveSpacing.tablet} 
      md:${responsiveSpacing.desktop}
    `}>
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => handleItemClick(item)}
          className={`
            flex flex-col items-center space-y-1 sm:space-y-2 
            ${responsivePadding.mobile} 
            sm:${responsivePadding.tablet} 
            md:${responsivePadding.desktop}
            rounded-lg transition-colors w-full
            ${activeItem === item.id 
              ? 'bg-blue-50 text-blue-600 border border-blue-200' 
              : 'text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
            }
          `}
        >
          {/* Mobile Icon */}
          <div className="block sm:hidden">
            <item.icon size={responsiveIconSize.mobile} />
          </div>
          
          {/* Tablet Icon */}
          <div className="hidden sm:block md:hidden">
            <item.icon size={responsiveIconSize.tablet} />
          </div>
          
          {/* Desktop Icon */}
          <div className="hidden md:block">
            <item.icon size={responsiveIconSize.desktop} />
          </div>

          {/* Mobile Text - Short Label */}
          <span className={`
            block sm:hidden 
            ${responsiveTextSize.mobile} 
            text-center font-medium leading-tight
          `}>
            {item.shortLabel}
          </span>
          
          {/* Tablet Text */}
          <span className={`
            hidden sm:block md:hidden 
            ${responsiveTextSize.tablet} 
            text-center font-medium leading-tight
          `}>
            {item.label}
          </span>
          
          {/* Desktop Text */}
          <span className={`
            hidden md:block 
            ${responsiveTextSize.desktop} 
            text-center font-medium leading-tight
          `}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default Sidebar;