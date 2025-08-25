import React, { useState, useEffect } from 'react';

// Custom React Icons
const UserIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const DatabaseIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M42 10C42 13.3137 33.9411 16 24 16C14.0589 16 6 13.3137 6 10M42 10C42 6.68629 33.9411 4 24 4C14.0589 4 6 6.68629 6 10M42 10V38C42 41.32 34 44 24 44C14 44 6 41.32 6 38V10M42 24C42 27.32 34 30 24 30C14 30 6 27.32 6 24" />
  </svg>
);

const BookIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
  </svg>
);

const SettingsIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

// Calendar/Schedule Icon
const CalendarIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 55 55" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M36.6667 4.5835V13.7502M18.3333 4.5835V13.7502M6.875 22.9168H48.125M11.4583 9.16683H43.5417C46.073 9.16683 48.125 11.2189 48.125 13.7502V45.8335C48.125 48.3648 46.073 50.4168 43.5417 50.4168H11.4583C8.92703 50.4168 6.875 48.3648 6.875 45.8335V13.7502C6.875 11.2189 8.92703 9.16683 11.4583 9.16683Z"/>
  </svg>
);

// Report Icon untuk Laporan
const ReportIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10,9 9,9 8,9"/>
  </svg>
);

// Shield Icon untuk Sarmut (Safety/Security)
const ShieldIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
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
  onNavigate,
  currentPage = '',
  iconSize = { mobile: 20, tablet: 24, desktop: 28 }, 
  textSize = { mobile: 'text-[10px]', tablet: 'text-sm', desktop: 'text-sm' },
  sidebarWidth = { mobile: 'w-25', tablet: 'w-32', desktop: 'w-40' },
  spacing = { mobile: 'space-y-8', tablet: 'space-y-3', desktop: 'space-y-8' },
  padding = { mobile: 'p-8', tablet: 'p-4', desktop: 'p-8' },
  stickyPosition = 'top-0', // Posisi sticky (top-0, top-16, dll)
  maxHeight = 'max-h-screen', // Tinggi maksimal sidebar
  scrollable = true // Apakah sidebar bisa di-scroll
}) => {
  const [activeItem, setActiveItem] = useState('');

  const menuItems = [
    { 
      id: 'profil', 
      icon: UserIcon, 
      label: 'Profil Teknisi', 
      shortLabel: 'Profil', 
      route: '/destopteknisi',
      keywords: ['profil', 'teknisi', 'destopteknisi']
    },
    { 
      id: 'meta', 
      icon: DatabaseIcon, 
      label: 'Meta Data', 
      shortLabel: 'Meta Data', 
      route: '/instrumen',
      keywords: ['meta', 'data', 'instrumen', 'daftar', 'peralatan']
    },
    { 
      id: 'logbook', 
      icon: BookIcon, 
      label: 'Log Book', 
      shortLabel: 'Log Book', 
      route: '/logbook',
      keywords: ['logbook', 'log', 'book']
    },
    { 
      id: 'jadwal', 
      icon: CalendarIcon, 
      label: 'Jadwal', 
      shortLabel: 'Jadwal', 
      route: '/jadwal',
      keywords: ['jadwal', 'schedule', 'calendar', 'kalender']
    },
    // { 
      // id: 'laporan', 
      // icon: ReportIcon, 
      // label: 'Laporan',  
      // shortLabel: 'Laporan', 
      // route: '/laporan',
      // keywords: ['laporan', 'report', 'reporting']
    // },
    { 
      id: 'sarmut', 
      icon: ShieldIcon, 
      label: 'Sarmut', 
      shortLabel: 'Sarmut', 
      route: '/sarmut',
      keywords: ['sarmut', 'safety', 'security', 'keamanan', 'keselamatan']
    },
    { 
      id: 'perka', 
      icon: SettingsIcon, 
      label: 'Perka', 
      shortLabel: 'Perka', 
      route: '/perka',
      keywords: ['perka', 'settings', 'pengaturan']
    }
  ];

  // Fungsi untuk mendeteksi halaman aktif berdasarkan URL atau currentPage prop
  const detectActivePage = () => {
    // Jika currentPage prop diberikan, gunakan itu
    if (currentPage) {
      const foundItem = menuItems.find(item => 
        item.keywords.some(keyword => 
          currentPage.toLowerCase().includes(keyword)
        )
      );
      return foundItem ? foundItem.id : '';
    }

    // Jika tidak ada currentPage prop, deteksi dari URL
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname.toLowerCase();
      const currentSearch = window.location.search.toLowerCase();
      const fullUrl = currentPath + currentSearch;

      const foundItem = menuItems.find(item => 
        item.keywords.some(keyword => 
          fullUrl.includes(keyword) || currentPath.includes(keyword)
        )
      );
      return foundItem ? foundItem.id : '';
    }

    return '';
  };

  // Set active item saat komponen dimount atau currentPage berubah
  useEffect(() => {
    const detectedPage = detectActivePage();
    setActiveItem(detectedPage);
  }, [currentPage]);

  const handleItemClick = (item) => {
    setActiveItem(item.id);
    
    // Jika ada callback onNavigate, panggil untuk routing
    if (onNavigate) {
      onNavigate(item.route);
    } else {
      // Fallback: gunakan window.location untuk navigasi
      const routeMap = {
        'profil': '/destopteknisi',
        'meta': '/instrumen',
        'logbook': '/logbook',
        'jadwal': '/jadwal',
        // 'laporan': '/laporan',
        'sarmut': '/sarmut',
        'perka': '/perka'
      };
      
      const route = routeMap[item.id];
      if (route) {
        window.location.href = route;
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

  // Tentukan kelas CSS untuk sticky dan scrollable
  const stickyClass = scrollable ? `sticky ${stickyPosition}` : 'relative';
  const scrollableClass = scrollable ? `${maxHeight} overflow-y-auto` : '';

  return (
    <div className={`
      ${responsiveSidebarWidth.mobile} 
      sm:${responsiveSidebarWidth.tablet} 
      md:${responsiveSidebarWidth.desktop}
      ${stickyClass}
      ${scrollableClass}
      bg-white border-r border-gray-200 flex flex-col items-center py-4 sm:py-5 md:py-6 
      ${responsiveSpacing.mobile} 
      sm:${responsiveSpacing.tablet} 
      md:${responsiveSpacing.desktop}
      z-10
    `}>
      {/* Wrapper untuk menu items yang bisa di-scroll */}
      <div className={`
        flex flex-col items-center w-full
        ${responsiveSpacing.mobile} 
        sm:${responsiveSpacing.tablet} 
        md:${responsiveSpacing.desktop}
        ${scrollable ? 'flex-1 overflow-y-auto' : ''}
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
              rounded-lg transition-all duration-200 w-full transform hover:scale-105
              ${activeItem === item.id 
                ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200 hover:text-gray-800'
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
              ${activeItem === item.id ? 'text-blue-600' : ''}
            `}>
              {item.shortLabel}
            </span>
            
            {/* Tablet Text */}
            <span className={`
              hidden sm:block md:hidden 
              ${responsiveTextSize.tablet} 
              text-center font-medium leading-tight
              ${activeItem === item.id ? 'text-blue-600' : ''}
            `}>
              {item.label}
            </span>
            
            {/* Desktop Text */}
            <span className={`
              hidden md:block 
              ${responsiveTextSize.desktop} 
              text-center font-medium leading-tight
              ${activeItem === item.id ? 'text-blue-600' : ''}
            `}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Demo Component untuk menunjukkan sidebar yang mengikuti scroll
const DemoApp = () => {
  const [currentPage, setCurrentPage] = useState('profil');
  
  const handleNavigate = (route) => {
    console.log('Navigating to:', route);
    // Simulasi perubahan halaman
    if (route.includes('destopteknisi')) setCurrentPage('profil');
    else if (route.includes('instrumen')) setCurrentPage('meta');
    else if (route.includes('logbook')) setCurrentPage('logbook');
    else if (route.includes('jadwal')) setCurrentPage('jadwal');
    // else if (route.includes('laporan')) setCurrentPage('laporan');
    else if (route.includes('sarmut')) setCurrentPage('sarmut');
    else if (route.includes('perka')) setCurrentPage('perka');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        onNavigate={handleNavigate}
        currentPage={currentPage}
        scrollable={true}
        stickyPosition="top-0"
        maxHeight="max-h-screen"
      />
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Demo Sidebar dengan Menu Laporan dan Sarmut
          </h1>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Menu yang Tersedia:
            </h2>
            <ul className="space-y-2 text-gray-600">
              <li>• <strong>Profil Teknisi</strong> - Informasi profil teknisi</li>
              <li>• <strong>Meta Data</strong> - Data instrumen dan peralatan</li>
              <li>• <strong>Log Book</strong> - Catatan aktivitas</li>
              <li>• <strong>Jadwal</strong> - Kalender dan penjadwalan</li>
              {/* <li>• <strong>Laporan</strong> - Generate dan kelola laporan (Baru!)</li> */}
              <li>• <strong>Sarmut</strong> - Keamanan dan keselamatan sistem (Baru!)</li>
              <li>• <strong>Perka</strong> - Pengaturan sistem</li>
            </ul>
          </div>

          {/* Demo active page indicator */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Halaman Aktif: <span className="text-blue-600 capitalize">{currentPage}</span>
            </h2>
            <p className="text-gray-600">
              Klik menu sidebar untuk melihat perubahan halaman aktif. 
              Menu baru yang ditambahkan:
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">📊 Laporan</h3>
                <p className="text-blue-700 text-sm">
                  Menu untuk membuat, melihat, dan mengelola berbagai jenis laporan sistem.
                </p>
              </div> */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">🛡️ Sarmut</h3>
                <p className="text-green-700 text-sm">
                  Menu untuk sistem keamanan dan keselamatan (Safety & Security Management).
                </p>
              </div>
            </div>
          </div>

          {/* Feature highlight */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Fitur Sidebar:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Responsif</h3>
                <p>Sidebar menyesuaikan ukuran dan tampilan berdasarkan ukuran layar (mobile, tablet, desktop).</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Auto-detect Active Page</h3>
                <p>Sidebar secara otomatis mendeteksi halaman aktif berdasarkan URL atau prop currentPage.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Sticky Position</h3>
                <p>Sidebar tetap terlihat saat scrolling dengan posisi sticky yang dapat dikonfigurasi.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Icon Scaling</h3>
                <p>Ukuran ikon dan teks dapat disesuaikan untuk setiap breakpoint responsif.</p>
              </div>
            </div>
          </div>

          {/* Konten panjang untuk testing scroll */}
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Konten Demo {i + 1}
              </h3>
              <p className="text-gray-600">
                Ini adalah konten dummy untuk menguji apakah sidebar mengikuti scroll dan 
                responsif di berbagai ukuran layar. Menu baru "Laporan" dan "Sarmut" sudah 
                terintegrasi dengan sistem navigasi. Sidebar akan tetap sticky dan dapat 
                di-scroll jika konten menu terlalu panjang.
              </p>
              {i === 10 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    <strong>Tips:</strong> Coba ubah ukuran browser untuk melihat bagaimana sidebar 
                    menyesuaikan tampilannya secara responsif!
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;