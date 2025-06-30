import React from "react";
import logo from "../assets/logo-bmkg.svg"; // Pastikan path ini sesuai dengan lokasi logo Anda

function Header() {
  return (
    <header className="bg-white text-black h-[85px] flex items-center justify-between px-10 py-2 shadow-lg">
      {/* Logo dan Judul */}
      <div className="flex items-center gap-5">
        {/* Placeholder untuk logo-bmkg.svg */}
        <img src={logo} alt="Logo BMKG" className="h-full w-auto" />
        <span className="w-64 text-[15px] font-semibold uppercase">
          BADAN METEOROLOGI, KLIMATOLOGI, DAN GEOFISIKA
        </span>
      </div>

      {/* Navigasi dan Tombol Login */}
      <nav className="flex items-center space-x-4 md:space-x-10">
        <ul className="flex space-x-5 md:space-x-10">
          <li>
            <a
              href="#kontak"
              className="hover:underline decoration-blue-500 decoration-1 transition duration-300"
            >
              Kontak
            </a>
          </li>
          <li>
            <a
              href="#tentang"
              className="hover:underline decoration-blue-500 decoration-1 transition duration-300"
            >
              Tentang
            </a>
          </li>
        </ul>
        <button className="h-9 w-25 bg-[#0066CC] text-white px-4 rounded-full font-semibold border-1 border-black hover:border-[#0066CC] transition duration-300 shadow-md">
          Login
        </button>
      </nav>
    </header>
  );
}

export default Header;
