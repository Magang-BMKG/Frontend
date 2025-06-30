import React, { useState } from 'react';
import { FaUser } from 'react-icons/fa';

const Header = () => {
    const scrollToAbout = () => {
    const aboutSection = document.getElementById('tentang-section');
    if (aboutSection) {
      aboutSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const scrollToContact = () => {
    const contactSection = document.getElementById('kontak-section');
    if (contactSection) {
      contactSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  return (
    <header className="bg-white shadow-sm">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3 md:py-4">
                <div className="flex items-center space-x-2 md:space-x-3">
                    <img 
                        src="/logo.png" 
                        alt="BMKG Logo" 
                        className="w-8 h-8 sm:w-10 sm:h-10 md:w-15 md:h-15 object-contain"
                    />
                    <div>
                        <h1 className="text-[8px] sm:text-sm font-bold text-gray-800">BADAN METEOROLOGI,</h1>
                        <h2 className="text-[8px] sm:text-sm font-bold text-gray-800">KLIMATOLOGI, DAN GEOFISIKA</h2>
                    </div>
                    </div>
                <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
                    <button 
                        onClick={scrollToContact}
                        className="text-[10px] sm:text-[12px] md:text-base text-gray-600 hover:text-gray-800 cursor-pointer"
                    >
                        Kontak
                    </button>
                    <button 
                        onClick={scrollToAbout}
                        className="text-[10px] sm:text-[12px] md:text-base text-gray-600 hover:text-gray-800 cursor-pointer"
                    >
                        Tentang
                    </button>
                    <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-50">
                        <FaUser className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>
        </div>
    </header>
  );
};

export default Header;
