// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Buat Konteks React
// Nilai default-nya adalah null.
export const AuthContext = createContext(null);

// 2. Buat Komponen Penyedia (Provider)
// Komponen ini akan "menyediakan" nilai konteks ke semua komponen di bawahnya.
export const AuthProvider = ({ children }) => {
  // Inisialisasi peran dari Local Storage saat aplikasi dimuat.
  // Jika ada di Local Storage, gunakan itu; jika tidak, default ke null.
  const [userRole, setUserRole] = useState(() => {
    try {
      const storedRole = localStorage.getItem('userRole');
      // Pastikan data yang diambil dari Local Storage di-parse sebagai JSON
      return storedRole ? JSON.parse(storedRole) : null;
    } catch (error) {
      console.error("Gagal mengurai peran pengguna dari Local Storage", error);
      return null;
    }
  });

  // 3. Simpan Peran ke Local Storage setiap kali berubah
  // useEffect ini akan berjalan setiap kali `userRole` berubah.
  useEffect(() => {
    try {
      if (userRole) {
        // Simpan peran sebagai string JSON
        localStorage.setItem('userRole', JSON.stringify(userRole));
      } else {
        // Hapus dari Local Storage jika peran tidak ada (misal, setelah logout)
        localStorage.removeItem('userRole');
      }
    } catch (error) {
      console.error("Gagal menyimpan peran pengguna ke Local Storage", error);
    }
  }, [userRole]); // Bergantung pada `userRole`

  // Fungsi untuk mengatur peran pengguna
  const setRole = (role) => {
    setUserRole(role);
  };

  // Fungsi untuk logout (menghapus peran)
  const logout = () => {
    setUserRole(null);
  };

  // Menyediakan `userRole`, `setRole`, dan `logout` ke komponen anak-anak
  return (
    <AuthContext.Provider value={{ userRole, setRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Buat Hook Kustom untuk Kemudahan Penggunaan
// Ini adalah cara yang lebih bersih untuk menggunakan konteks di komponen lain.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};