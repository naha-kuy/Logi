# Logi Math - Platform Belajar Matematika Gamifikasi

## 1. Tentang Proyek
**Logi Math** adalah aplikasi web edukasi yang mengubah cara siswa belajar matematika (khususnya Geometri Bangun Ruang dan Lingkaran) menjadi pengalaman yang menyenangkan seperti bermain game.

Aplikasi ini menggunakan konsep **Gamifikasi** untuk meningkatkan motivasi belajar, dengan fitur seperti XP, Level, Streak, Avatar, dan Papan Peringkat.

## 2. Fitur Utama

### 👨‍🎓 Untuk Siswa
- **Peta Belajar Interaktif:** Materi disusun dalam bentuk peta petualangan (Unit Path) zig-zag yang menarik.
- **Materi & Kuis:** Pembelajaran berbasis teks interaktif dengan rumus matematika yang rapi (LaTeX) dan latihan soal.
- **Sistem Gamifikasi:**
  - **XP & Level:** Dapatkan poin setiap menyelesaikan materi.
  - **Avatar Customization:** Buat dan kreasikan karakter unikmu sendiri.
  - **Leaderboard:** Bersaing secara sehat dengan teman sekelas dalam perolehan XP.
- **LogiBot (AI):** (Persiapan) Asisten belajar cerdas berbasis Gemini AI untuk tanya jawab.
- **Forum Diskusi:** Ruang tanya jawab dengan teman dan guru.
- **Game Modes:** (Persiapan) Zona Ujian, Labirin Logika, dan Petualangan Geometri.

### 👩‍🏫 Untuk Guru
- **Dasbor Manajemen Siswa:** Kelola akun siswa, reset password, hapus akun, dan pantau status aktif.
- **Statistik Kelas:** Pantau rata-rata level, total XP, dan distribusi kemampuan siswa melalui grafik visual.
- **Moderasi Forum:** Pantau, kunci, atau bersihkan diskusi kelas.

## 3. Teknologi yang Digunakan
- **Frontend:** React (Vite) + TypeScript
- **Styling:** Tailwind CSS (Custom Color Palette: Feather Green, Macaw Blue, Cardinal Red, dll.)
- **Math Rendering:** KaTeX (untuk menampilkan rumus matematika $E=mc^2$ dengan indah)
- **Backend & Auth:** Supabase (PostgreSQL, Authentication, Row Level Security)
- **Icons:** Lucide React
- **AI Integration:** Google Gemini API (Configured for future features)

## 4. Struktur Materi (Kurikulum)
Aplikasi ini mencakup 7 Unit Pembelajaran komprehensif:
1.  **Unit 1:** Klasifikasi Bangun Ruang (Kubus, Balok, Prisma, Limas).
2.  **Unit 2:** Luas Permukaan Bangun Ruang Sisi Datar.
3.  **Unit 3:** Volume Bangun Ruang Sisi Datar.
4.  **Unit 4:** Dasar Lingkaran (Keliling & Luas).
5.  **Unit 5:** Geometri Lingkaran Lanjut (Busur & Juring).
6.  **Unit 6:** Luas Permukaan Bangun Ruang Sisi Lengkung (Tabung, Kerucut, Bola).
7.  **Unit 7:** Volume Bangun Ruang Sisi Lengkung.

## 5. Cara Menjalankan (Local Development)

1.  **Install Dependencies**
    ```bash
    npm install
    ```
2.  **Setup Environment Variables**
    Pastikan file `.env` sudah terisi dengan:
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
    - API Keys untuk Google Gemini (opsional untuk fitur AI)
3.  **Jalankan Aplikasi**
    ```bash
    npm run dev
    ```

## 6. Catatan Pengembang
- **Gambar Materi:** Disimpan di `public/images/materials/`. File placeholder SVG telah disediakan.
- **Database:** Skema database dan policy keamanan terdapat di file `db.sql`.
- **Render Matematika:** Menggunakan `KaTeX` dengan konfigurasi auto-render untuk konten dinamis.
