import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPhone } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";
import { BsBook } from "react-icons/bs";
import { LuUsers } from "react-icons/lu";
import { HiOutlineWrenchScrewdriver } from "react-icons/hi2";
import { CiCalendar } from "react-icons/ci";
import { CiLock } from "react-icons/ci";
import { FaEyeSlash, FaRegEye } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';

export default function BMKGLandingPage() {
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginClick = () => {
    setShowLoginPopup(true);
  };

  const navigate = useNavigate();

  const handleLogin = () => {
    // Navigasi ke halaman DaftarTeknisiPage
    navigate('/destopteknisi');
  };

  const handleClosePopup = () => {
    setShowLoginPopup(false);
  };

  // const handleLogin = () => {
  //   // Handle login logic here
  //   console.log('Login attempt:', { email, password });
  // };

  const handleGoogleLogin = () => {
    // Handle Google login logic here
    console.log('Google login attempt');
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
            <nav className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
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
              <button 
              onClick={handleLoginClick} 
              className="bg-[#0066CC] text-white px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-lg hover:bg-blue-700 text-[10px] sm:text-[12px] md:text-base">
                Login
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-64 sm:h-80 md:h-96 lg:h-150">
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-100"
            style={{
                backgroundImage: `url('/latar.png')`
            }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
          <div className="text-center text-black">
            <h1 className="text-[20px] sm:text-3xl md:text-4xl font-bold mb-2 md:mb-4">Selamat Datang</h1>
            <p className="text-[10px] sm:text-base md:text-lg max-w-2xl mx-auto px-4">
              Jelajahi data meteorologi, klimatologi, dan geofisika 
            </p>
            <p className="text-[10px] sm:text-base md:text-lg max-w-2xl mx-auto px-4">
              terkini dari sumber terpercaya
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Profil Teknisi */}
            <div className="bg-white rounded-lg border border-gray-20 p-4 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
               <div className="flex items-center space-x-3 md:space-x-4">
                <div className="w-13 h-13 md:w-20 md:h-20 flex items-center justify-center flex-shrink-0 bg-gray-50 rounded-lg">
                  <LuUsers className="w-50 h-50 md:w-80 md:h-80 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-[10px] md:text-xl text-justify font-bold text-gray-800 mb-2 md:mb-4">Profil Teknisi</h3>
                  <p className="text-black text-justify text-[9px] md:text-sm leading-relaxed">
                    Teknisi BMKG merupakan profil sumber daya manusia dengan keahlian spesifik 
                    di bidang teknologi instrumentasi, elektronika, dan jaringan. Tugas utama 
                    mereka mencakup pemeliharaan preventif, analisis kerusakan, hingga kalibrasi 
                    instrumen canggih. Melalui tangan terampil merekalah, data mentah dari alam 
                    dapat terekam secara konsisten dan berkualitas, menjadi fondasi bagi setiap 
                    informasi yang disajikan BMKG
                  </p>
                </div>
              </div>
            </div>

            {/* Log Book */}
            <div className="bg-white rounded-lg border border-gray-20 p-4 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="w-12 h-12 md:w-20 md:h-20 flex items-center justify-center flex-shrink-0 bg-gray-50 rounded-lg">
                  <BsBook className="w-50 h-50 md:w-80 md:h-80 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-[10px] md:text-xl text-justify font-bold text-gray-800 mb-2 md:mb-4">Log Book</h3>
                  <p className="text-black text-justify text-[9px] md:text-sm leading-relaxed">
                   Log Book adalah cerminan digital dari komitmen setiap karyawan. 
                   Setiap kehadiran dicatat dan disandingkan langsung dengan jadwal 
                   yang telah ditetapkan. Dari sinilah lahir kalkulasi Sasaran 
                   Mutu—sebuah persentase yang merefleksikan tingkat kedisiplinan 
                   dan kepatuhan terhadap jadwal. Ini adalah cara kami menjaga 
                   akuntabilitas secara transparan dan menjadi tolok ukur 
                   bersama dalam upaya memberikan pelayanan publik yang selalu 
                   tepat waktu.
                  </p>
                </div>
              </div>
            </div>

            {/* Meta Data */}
            <div className="bg-white rounded-lg border border-gray-20 p-4 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="w-12 h-12 md:w-20 md:h-20 flex items-center justify-center flex-shrink-0 bg-gray-50 rounded-lg">
                  <HiOutlineWrenchScrewdriver className="w-50 h-50 md:w-80 md:h-80 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-[10px] md:text-xl text-justify font-bold text-gray-800 mb-2 md:mb-4">Meta Data</h3>
                  <p className="text-black text-justify text-[9px] md:text-sm leading-relaxed">
                    Setiap data BMKG berawal dari instrumen yang terjamin kualitasnya. 
                    Kami mendokumentasikan metadata instrumen secara detail, mencakup 
                    riwayat kalibrasi, posisi penempatan, keterangan kondisi, hingga 
                    spesifikasi teknis seperti merk dan type. Ini adalah bentuk 
                    transparansi dan komitmen kami untuk memastikan setiap informasi 
                    yang Anda terima berasal dari sumber yang valid dan terawat baik.
                  </p>
                </div>
              </div>
            </div>

            {/* Jadwal */}
            <div className="bg-white rounded-lg border border-gray-20 p-4 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
               <div className="flex items-center space-x-3 md:space-x-4">
                <div className="w-13 h-13 md:w-20 md:h-20 flex items-center justify-center flex-shrink-0 bg-gray-50 rounded-lg">
                  <CiCalendar className="w-50 h-50 md:w-80 md:h-80 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-[10px] md:text-xl text-justify font-bold text-gray-800 mb-2 md:mb-4">Jadwal</h3>
                  <p className="text-black text-justify text-[9px] md:text-sm leading-relaxed">
                    Kesiapsiagaan kami berawal dari jadwal yang terorganisir. 
                    Jadwal Karyawan kami adalah Peta Jalan Operasional yang 
                    mengatur ritme kerja tim untuk memberikan layanan tanpa jeda. 
                    Ini memastikan setiap posisi penting selalu terisi oleh tenaga ahli, 
                    baik di hiruk pikuk Shift Pagi maupun di keheningan Shift Malam, 
                    sebagai wujud komitmen kami pada layanan publik.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white p-4 md:p-8 text-center w-full">
        <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-8 md:gap-20">
            {/* Kontak Kami */}
            <div id="kontak-section" className="text-left">
              <h3 className="text-[10px] md:text-xl font-bold mb-4 md:mb-6">KONTAK KAMI</h3>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-start space-x-3">
                  <IoLocationOutline className="w-4 h-4 md:w-5 md:h-5 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-[7px] md:text-sm">
                      Jl. Marsma R. Iswahyudi No.3, Sepinggan, Kecamatan Balikpapan Selatan, 
                      Kota Balikpapan, Kalimantan Timur 76115
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FiPhone className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                  <span className="text-[8px] md:text-sm">(0542) 764771</span>
                </div>
              </div>
            </div>

            {/* Tentang */}
            <div id="tentang-section" className="text-end">
              <h3 className="text-[10px] md:text-xl font-bold mb-4 md:mb-6">TENTANG</h3>
              <p className="text-[8px] md:text-sm leading-relaxed">
                Website resmi BMKG ini adalah sumber utama informasi akurat mengenai cuaca, 
                iklim dan gempabumi. Selain melayani publik, situs ini juga mendukung 
                transparansi dengan menampilkan profil tim kami serta menyajikan sistem 
                manajemen operasional internal.
              </p>
            </div>
          </div>
        </div>
      </footer>

       {/* Login Popup */}
        {showLoginPopup && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 w-full max-w-md relative">
              {/* Close Button */}
              <button
                onClick={handleClosePopup}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <AiOutlineClose className="w-6 h-6" />
              </button>

              {/* Login Form */}
              <div className="text-center mb-8">
                <h2 className="text-[20px] md:text-3xl font-bold text-black">Silahkan Login</h2>
              </div>

              <div className="space-y-6">
                {/* Email Input */}
                <div>
                  <label className="block text-[15px] md:text-xl font-medium text-black mb-2">
                    E - mail
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <LuUsers className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Masukkan e-mail"
                      className="w-full text-[12px] md:text-[15px] pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-[15px] md:text-xl font-medium text-black mb-2">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <CiLock className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi"
                      className="w-full text-[12px] md:text-[15px] pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                         <FaEyeSlash className="w-4 h-4 md:w-5 md:h-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <FaRegEye className="w-4 h-4 md:w-5 md:h-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                 <button
        onClick={handleLogin}
        className="w-full text-[15px] md:text-xl bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Masuk
      </button>

                {/* Divider */}
                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-2 text-[12px] md:text-[16px] text-black">atau masuk dengan</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Google Login Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full text-[15px] md:text-xl bg-cyan-400 text-white py-3 rounded-lg font-medium hover:bg-cyan-500 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google</span>
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}