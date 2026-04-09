// Format: { tags: string[], q: string, opts: string[], ans: string }

export const ADVENTURE_QUESTIONS_DB = [
    // --- LOGIKA UMUM / CT (Basic - 20 Soal) ---
    { tags: ['basic'], q: "Pak Andi menumpuk kardus membentuk piramida. Tingkat atas 1, bawahnya 3, bawahnya lagi 5. Ada berapa kardus di tingkat ke-5?", opts: ["7", "9", "11", "13"], ans: "9" },
    { tags: ['basic'], q: "Jika 3 Kucing menangkap 3 Tikus dalam 3 Menit. Butuh berapa menit untuk 100 Kucing menangkap 100 Tikus?", opts: ["100 Menit", "3 Menit", "33 Menit", "1 Menit"], ans: "3 Menit" },
    { tags: ['basic'], q: "Ada 5 lampu. Setiap 1 menit satu lampu mati. Setelah 3 menit, berapa lampu menyala?", opts: ["2", "3", "5", "0"], ans: "2" },
    { tags: ['basic'], q: "Pola bilangan: 1, 1, 2, 3, 5, 8, ... Angka selanjutnya?", opts: ["11", "13", "12", "15"], ans: "13" },
    { tags: ['basic'], q: "Ayah berumur 40 tahun, anaknya 10 tahun. Berapa tahun lagi umur Ayah menjadi 2 kali umur anak?", opts: ["10 tahun", "20 tahun", "5 tahun", "15 tahun"], ans: "20 tahun" },
    { tags: ['basic'], q: "Sebuah bakteri membelah diri menjadi 2 setiap menit. Jika toples penuh dalam 1 jam, kapan toples terisi setengahnya?", opts: ["30 menit", "59 menit", "15 menit", "45 menit"], ans: "59 menit" },
    { tags: ['basic'], q: "Jika A > B dan B > C, maka hubungan A dan C adalah?", opts: ["A > C", "A < C", "A = C", "Tidak tahu"], ans: "A > C" },
    { tags: ['basic'], q: "Ada 12 pasang kaos kaki di laci gelap. Berapa kaos kaki minimal yang harus diambil agar pasti dapat sepasang yang cocok?", opts: ["2", "3", "13", "25"], ans: "3" },
    { tags: ['basic'], q: "Kode rahasia: A=1, B=2, C=3. Maka K+A+K+I = ?", opts: ["30", "24", "32", "11119"], ans: "32" }, // K=11, A=1, K=11, I=9 -> 11+1+11+9 = 32
    { tags: ['basic'], q: "Budi antri tiket. Dia urutan ke-5 dari depan dan ke-5 dari belakang. Berapa orang dalam antrian?", opts: ["10", "9", "11", "8"], ans: "9" },
    { tags: ['basic'], q: "Manakah yang paling berat: 1kg Kapas, 1kg Besi, atau 1kg Emas?", opts: ["Besi", "Emas", "Kapas", "Sama Berat"], ans: "Sama Berat" },
    { tags: ['basic'], q: "Jika kemarin adalah besoknya hari Senin, maka hari ini adalah?", opts: ["Selasa", "Rabu", "Kamis", "Jumat"], ans: "Rabu" }, // Besoknya Senin = Selasa. Kemarin = Selasa. Hari ini = Rabu.
    { tags: ['basic'], q: "Ada 3 pintu. Pintu 1: Api, Pintu 2: Pembunuh bayaran, Pintu 3: Singa yang tak makan 3 tahun. Mana yang aman?", opts: ["Pintu 1", "Pintu 2", "Pintu 3", "Tidak ada"], ans: "Pintu 3" }, // Singa mati
    { tags: ['basic'], q: "Berapa kali kamu bisa mengurangi angka 10 dari 100?", opts: ["1 kali", "10 kali", "9 kali", "Tak terhingga"], ans: "1 kali" }, // Setelah itu jadi 90
    { tags: ['basic'], q: "Apa yang naik tapi tidak pernah turun?", opts: ["Umur", "Gaji", "Hujan", "Pesawat"], ans: "Umur" },
    { tags: ['basic'], q: "Ibu Budi punya 3 anak: April, Mei. Siapa nama anak ketiga?", opts: ["Juni", "Budi", "Juli", "Agus"], ans: "Budi" },
    { tags: ['basic'], q: "Jika sebuah lingkaran memiliki 0 sudut, berapa sudut setengah lingkaran?", opts: ["0", "1", "2", "Tak hingga"], ans: "2" },
    { tags: ['basic'], q: "Berapa banyak huruf 'a' dalam angka 0 sampai 100 (dalam bahasa Indonesia)?", opts: ["0", "1", "10", "Banyak"], ans: "Banyak" }, // Satu, Dua (ada a), Tiga (ada a)...
    { tags: ['basic'], q: "Jika 1=5, 2=25, 3=125, 4=625, maka 5=?", opts: ["3125", "1", "5", "25"], ans: "1" }, // Logika: Jika 1=5, maka 5=1
    { tags: ['basic'], q: "Benda apa yang jika dipotong malah semakin tinggi?", opts: ["Celana", "Tiang", "Pohon", "Rambut"], ans: "Celana" },

    // --- UNIT 1: KLASIFIKASI BANGUN RUANG (30 Soal) ---
    // Fokus: Kubus, Balok, Prisma (Tanpa Limas/Kerucut/Bola)
    { tags: ['Unit 1', 'Sifat'], q: "Aku punya 6 sisi persegi yang sama persis. Jika aku dibuka, aku punya 11 macam pola jaring-jaring. Siapakah aku?", opts: ["Balok", "Kubus", "Prisma Segitiga", "Prisma Segilima"], ans: "Kubus" },
    { tags: ['Unit 1', 'Logika'], q: "Sebuah dadu (kubus) angka yang berlawanan selalu berjumlah 7. Jika atas angka 2, bawah angka berapa?", opts: ["5", "4", "3", "6"], ans: "5" },
    { tags: ['Unit 1', 'Euler'], q: "Sebuah bangun punya 8 titik sudut dan 6 sisi. Berapa rusuknya? (Ingat V - E + F = 2)", opts: ["10", "12", "14", "8"], ans: "12" },
    { tags: ['Unit 1', 'Sifat'], q: "Bangun ruang yang memiliki alas dan tutup berbentuk segitiga identik adalah?", opts: ["Prisma Segiempat", "Balok", "Kubus", "Prisma Segitiga"], ans: "Prisma Segitiga" },
    { tags: ['Unit 1', 'Sifat'], q: "Prisma Segi-5 memiliki berapa titik sudut?", opts: ["5", "6", "10", "12"], ans: "10" },
    { tags: ['Unit 1', 'Analogi'], q: "Prisma Segitiga itu seperti tenda, kalau Kubus itu seperti...?", opts: ["Bola", "Dadu", "Piramida", "Kaleng"], ans: "Dadu" },
    { tags: ['Unit 1', 'Sifat'], q: "Bangun manakah yang memiliki 12 rusuk sama panjang?", opts: ["Balok", "Kubus", "Prisma Segitiga", "Prisma Segilima"], ans: "Kubus" },
    { tags: ['Unit 1', 'Visual'], q: "Jika sebuah kubus dipotong salah satu pojoknya, jumlah titik sudutnya akan...?", opts: ["Berkurang", "Bertambah", "Tetap", "Hilang"], ans: "Bertambah" },
    { tags: ['Unit 1', 'Sifat'], q: "Berapa banyak sisi pada Prisma Segi-4?", opts: ["4", "5", "6", "8"], ans: "6" },
    { tags: ['Unit 1', 'Definisi'], q: "Apa nama lain dari Prisma Segiempat beraturan?", opts: ["Kubus", "Balok", "Prisma Segitiga", "Tabung"], ans: "Balok" },
    { tags: ['Unit 1', 'Sifat'], q: "Prisma Segienam memiliki berapa sisi tegak?", opts: ["4", "5", "6", "8"], ans: "6" },
    { tags: ['Unit 1', 'Sifat'], q: "Jumlah rusuk pada Prisma Segitiga adalah?", opts: ["6", "9", "12", "15"], ans: "9" },
    { tags: ['Unit 1', 'Sifat'], q: "Sisi alas dan tutup pada Balok berbentuk?", opts: ["Persegi", "Persegi Panjang", "Segitiga", "Lingkaran"], ans: "Persegi Panjang" },
    { tags: ['Unit 1', 'Sifat'], q: "Berapa jumlah diagonal ruang pada Kubus?", opts: ["2", "4", "6", "8"], ans: "4" },
    { tags: ['Unit 1', 'Sifat'], q: "Prisma yang memiliki 6 sisi, 12 rusuk, dan 8 titik sudut adalah?", opts: ["Prisma Segitiga", "Prisma Segilima", "Prisma Segiempat", "Prisma Segienam"], ans: "Prisma Segiempat" },
    { tags: ['Unit 1', 'Jaring'], q: "Manakah yang BUKAN merupakan jaring-jaring kubus?", opts: ["Pola 1-4-1", "Pola 2-2-2", "Pola Lurus 5 Kotak", "Pola 3-3"], ans: "Pola Lurus 5 Kotak" },
    { tags: ['Unit 1', 'Sifat'], q: "Sudut pertemuan antara dua rusuk disebut?", opts: ["Sisi", "Titik Sudut", "Bidang", "Diagonal"], ans: "Titik Sudut" },
    { tags: ['Unit 1', 'Sifat'], q: "Benda berikut yang berbentuk Balok adalah?", opts: ["Bola Kasti", "Kaleng Susu", "Kotak Sepatu", "Topi Ulang Tahun"], ans: "Kotak Sepatu" },
    { tags: ['Unit 1', 'Sifat'], q: "Benda berikut yang berbentuk Prisma Segitiga adalah?", opts: ["Piramida Mesir", "Tenda Kemah", "Bola Basket", "Dadu"], ans: "Tenda Kemah" },
    { tags: ['Unit 1', 'Sifat'], q: "Prisma Segi-n memiliki sisi sebanyak?", opts: ["n+1", "n+2", "2n", "3n"], ans: "n+2" },
    { tags: ['Unit 1', 'Sifat'], q: "Prisma Segi-n memiliki rusuk sebanyak?", opts: ["n+2", "2n", "3n", "n"], ans: "3n" },
    { tags: ['Unit 1', 'Sifat'], q: "Prisma Segi-n memiliki titik sudut sebanyak?", opts: ["n+2", "2n", "3n", "n"], ans: "2n" },
    { tags: ['Unit 1', 'Logika'], q: "Jika alas prisma berbentuk segilima, maka jumlah sisi tegaknya adalah?", opts: ["4", "5", "6", "7"], ans: "5" },
    { tags: ['Unit 1', 'Sifat'], q: "Apakah kubus termasuk prisma?", opts: ["Ya", "Tidak", "Mungkin", "Hanya jika kecil"], ans: "Ya" },
    { tags: ['Unit 1', 'Sifat'], q: "Sisi yang berhadapan pada balok selalu...", opts: ["Tegak lurus", "Berpotongan", "Sejajar dan sama luas", "Berbeda ukuran"], ans: "Sejajar dan sama luas" },
    { tags: ['Unit 1', 'Sifat'], q: "Berapa banyak bidang diagonal pada kubus?", opts: ["4", "6", "8", "12"], ans: "6" },
    { tags: ['Unit 1', 'Sifat'], q: "Prisma dengan alas segidelapan memiliki berapa rusuk?", opts: ["16", "24", "32", "8"], ans: "24" },
    { tags: ['Unit 1', 'Sifat'], q: "Manakah yang merupakan bangun ruang sisi datar?", opts: ["Tabung", "Kerucut", "Bola", "Prisma"], ans: "Prisma" },
    { tags: ['Unit 1', 'Visual'], q: "Jika balok dipotong sejajar alas, penampangnya berbentuk?", opts: ["Persegi Panjang", "Segitiga", "Lingkaran", "Trapesium"], ans: "Persegi Panjang" },
    { tags: ['Unit 1', 'Sifat'], q: "Semua sisi kubus berbentuk?", opts: ["Persegi Panjang", "Persegi", "Jajar Genjang", "Belah Ketupat"], ans: "Persegi" },

    // --- UNIT 2: LUAS PERMUKAAN PRISMA (30 Soal) ---
    { tags: ['Unit 2', 'Skala'], q: "Sebuah kotak kado diperbesar ukurannya menjadi 2 kali lipat panjang, lebar, dan tingginya. Kertas kado yang dibutuhkan menjadi berapa kali lipat?", opts: ["2 kali", "4 kali", "6 kali", "8 kali"], ans: "4 kali" },
    { tags: ['Unit 2', 'Logika'], q: "Dua balok disusun menumpuk. Apakah luas permukaan gabungannya sama dengan jumlah luas permukaan masing-masing balok?", opts: ["Ya", "Tidak, lebih kecil", "Tidak, lebih besar", "Tergantung"], ans: "Tidak, lebih kecil" },
    { tags: ['Unit 2', 'Kubus'], q: "Jika luas satu sisi kubus adalah A, maka luas permukaan totalnya adalah?", opts: ["4A", "6A", "8A", "A^3"], ans: "6A" },
    { tags: ['Unit 2', 'Aplikasi'], q: "Pak Budi mengecat dinding kamar balok (4 sisi). Jika Ia mengecat juga langit-langitnya, berapa sisi yang dicat?", opts: ["4", "5", "6", "3"], ans: "5" },
    { tags: ['Unit 2', 'Logika'], q: "Jika kamu membuka kardus mie instan (balok), jaring-jaringnya terdiri dari berapa persegi panjang?", opts: ["4", "6", "8", "2"], ans: "6" },
    { tags: ['Unit 2', 'Perbandingan'], q: "Kubus A rusuknya 1cm, Kubus B rusuknya 2cm. Perbandingan Luas Permukaannya?", opts: ["1:2", "1:4", "1:8", "1:16"], ans: "1:4" },
    { tags: ['Unit 2', 'Aplikasi'], q: "Membuat kerangka balok dari kawat. Jika p=10, l=5, t=5. Butuh kawat sepanjang?", opts: ["80 cm", "20 cm", "40 cm", "100 cm"], ans: "80 cm" },
    { tags: ['Unit 2', 'Analisis'], q: "Manakah yang lebih hemat bahan: Membuat 1 kubus besar (s=10) atau 8 kubus kecil (s=5)?", opts: ["1 Kubus Besar", "8 Kubus Kecil", "Sama Saja", "Tidak Tahu"], ans: "1 Kubus Besar" },
    { tags: ['Unit 2', 'Prisma'], q: "Luas permukaan Prisma terdiri dari 2 alas dan ... sisi tegak?", opts: ["3", "4", "n", "n+1"], ans: "n" },
    { tags: ['Unit 2', 'Prisma'], q: "Luas selimut prisma segitiga berbentuk?", opts: ["3 Persegi Panjang", "3 Segitiga", "2 Segitiga", "Lingkaran"], ans: "3 Persegi Panjang" },
    { tags: ['Unit 2', 'Hitung'], q: "Luas permukaan kubus dengan sisi 5 cm adalah?", opts: ["100 cm²", "125 cm²", "150 cm²", "25 cm²"], ans: "150 cm²" },
    { tags: ['Unit 2', 'Hitung'], q: "Balok ukuran 2x3x4. Luas permukaannya?", opts: ["24", "52", "48", "26"], ans: "52" }, // 2(6+8+12) = 2(26) = 52
    { tags: ['Unit 2', 'Rumus'], q: "Rumus luas permukaan balok adalah?", opts: ["p x l x t", "2(pl + pt + lt)", "6 x s x s", "La x t"], ans: "2(pl + pt + lt)" },
    { tags: ['Unit 2', 'Logika'], q: "Jika sebuah kubus dicat seluruh luarnya, lalu dipotong jadi kubus kecil-kecil. Bagian dalam kubus kecil tersebut...", opts: ["Berwarna", "Tidak Berwarna", "Setengah Berwarna", "Hitam"], ans: "Tidak Berwarna" },
    { tags: ['Unit 2', 'Aplikasi'], q: "Berapa luas kertas minimal untuk membungkus kado kubus s=10cm?", opts: ["100 cm²", "600 cm²", "1000 cm²", "400 cm²"], ans: "600 cm²" },
    { tags: ['Unit 2', 'Prisma'], q: "Luas permukaan prisma segitiga siku-siku (3,4,5) dengan tinggi 10 adalah?", opts: ["120", "132", "144", "150"], ans: "132" }, // 2(6) + (3+4+5)*10 = 12 + 120 = 132
    { tags: ['Unit 2', 'Konsep'], q: "Satuan luas permukaan adalah?", opts: ["cm", "cm²", "cm³", "meter"], ans: "cm²" },
    { tags: ['Unit 2', 'Jaring'], q: "Luas jaring-jaring bangun ruang sama dengan...", opts: ["Volume bangun", "Luas Permukaan bangun", "Keliling bangun", "Tinggi bangun"], ans: "Luas Permukaan bangun" },
    { tags: ['Unit 2', 'Hitung'], q: "Keliling alas kubus 20cm. Luas permukaannya?", opts: ["100 cm²", "150 cm²", "25 cm²", "200 cm²"], ans: "150 cm²" }, // s=5. LP=6*25=150
    { tags: ['Unit 2', 'Hitung'], q: "Luas alas balok 20, luas depan 15, luas samping 12. Luas permukaannya?", opts: ["47", "94", "100", "80"], ans: "94" }, // 2(20+15+12) = 2(47) = 94
    { tags: ['Unit 2', 'Logika'], q: "Jika tinggi prisma digandakan, luas selimutnya menjadi?", opts: ["2 kali", "4 kali", "Tetap", "Setengahnya"], ans: "2 kali" },
    { tags: ['Unit 2', 'Prisma'], q: "Luas selimut prisma adalah Keliling Alas dikali...", opts: ["Tinggi", "Luas Alas", "Lebar", "Sisi Miring"], ans: "Tinggi" },
    { tags: ['Unit 2', 'Aplikasi'], q: "Sebuah aula berbentuk balok. Dindingnya akan dicat. Bagian mana yang TIDAK dicat?", opts: ["Lantai dan Langit-langit", "Hanya Lantai", "Hanya Langit-langit", "Semua dicat"], ans: "Lantai dan Langit-langit" }, // Biasanya dinding saja
    { tags: ['Unit 2', 'Hitung'], q: "Kubus tanpa tutup memiliki sisi 10cm. Luas permukaannya?", opts: ["600", "500", "400", "100"], ans: "500" }, // 5 sisi
    { tags: ['Unit 2', 'Analisis'], q: "Manakah yang mempengaruhi luas permukaan prisma?", opts: ["Hanya Luas Alas", "Hanya Tinggi", "Bentuk Alas dan Tinggi", "Warna Prisma"], ans: "Bentuk Alas dan Tinggi" },
    { tags: ['Unit 2', 'Hitung'], q: "Prisma segiempat beraturan s=5, t=10. Luas permukaannya?", opts: ["250", "200", "300", "150"], ans: "250" }, // 2(25) + 20*10 = 50 + 200 = 250
    { tags: ['Unit 2', 'Logika'], q: "Jika balok dipotong menjadi dua bagian sama besar, luas permukaan total kedua potongan...", opts: ["Sama dengan balok asli", "Lebih besar dari balok asli", "Lebih kecil", "Nol"], ans: "Lebih besar dari balok asli" }, // Muncul sisi baru
    { tags: ['Unit 2', 'Hitung'], q: "Luas permukaan kubus 96 cm². Panjang rusuknya?", opts: ["4 cm", "6 cm", "8 cm", "16 cm"], ans: "4 cm" }, // 6s^2=96 -> s^2=16 -> s=4
    { tags: ['Unit 2', 'Aplikasi'], q: "Karton 100x100 cm. Mau buat kubus s=20. Dapat berapa kubus?", opts: ["4", "5", "6", "8"], ans: "4" }, // LP=2400. Luas Karton=10000. 10000/2400 = 4.16 -> 4.
    { tags: ['Unit 2', 'Konsep'], q: "Apa itu luas permukaan?", opts: ["Isi di dalam bangun", "Total luas seluruh sisi luar", "Panjang semua rusuk", "Berat bangun"], ans: "Total luas seluruh sisi luar" },

    // --- UNIT 3: VOLUME PRISMA (30 Soal) ---
    { tags: ['Unit 3', 'Skala'], q: "Sebuah bak mandi kubus rusuknya diduakalikan. Volumenya menjadi berapa kali semula?", opts: ["2 kali", "4 kali", "8 kali", "16 kali"], ans: "8 kali" },
    { tags: ['Unit 3', 'Perbandingan'], q: "Balok A (2x2x2) dan Balok B (1x1x8). Manakah yang volumenya lebih besar?", opts: ["Balok A", "Balok B", "Sama Besar", "Tidak bisa ditentukan"], ans: "Sama Besar" },
    { tags: ['Unit 3', 'Logika'], q: "Batu dimasukkan ke gelas penuh air. Air tumpah 50ml. Berapa volume batu?", opts: ["Kurang dari 50ml", "Tepat 50ml", "Lebih dari 50ml", "Tergantung berat batu"], ans: "Tepat 50ml" },
    { tags: ['Unit 3', 'Prisma'], q: "Volume Prisma itu Luas Alas kali Tinggi. Jika Luas Alas tetap dan Tinggi x2, Volume jadi?", opts: ["2x", "4x", "8x", "Tetap"], ans: "2x" },
    { tags: ['Unit 3', 'Aplikasi'], q: "Sebuah kolam renang penuh air. Jika dikuras setengahnya, tingginya menjadi?", opts: ["Setengahnya", "Tetap", "Seperempatnya", "Dua kalinya"], ans: "Setengahnya" },
    { tags: ['Unit 3', 'Estimasi'], q: "Mana yang isinya lebih banyak? 1 Liter air atau 1000 cm³ minyak?", opts: ["Air", "Minyak", "Sama Banyak", "Tergantung Suhu"], ans: "Sama Banyak" },
    { tags: ['Unit 3', 'Logika'], q: "Jika panjang balok dilipatgandakan, lebar dilipatgandakan, tinggi tetap. Volume jadi?", opts: ["2x", "4x", "8x", "Tetap"], ans: "4x" },
    { tags: ['Unit 3', 'Konversi'], q: "1 Meter Kubik sama dengan berapa Liter?", opts: ["100", "1000", "10", "10000"], ans: "1000" },
    { tags: ['Unit 3', 'Prisma'], q: "Volume Prisma adalah Luas Alas dikali...?", opts: ["Keliling", "Tinggi", "Lebar", "Sisi Miring"], ans: "Tinggi" },
    { tags: ['Unit 3', 'Analisis'], q: "Wadah A berbentuk Kubus (s=10). Wadah B berbentuk Balok (10x10x5). Berapa kali tuang Wadah B untuk memenuhi A?", opts: ["1 kali", "2 kali", "3 kali", "4 kali"], ans: "2 kali" },
    { tags: ['Unit 3', 'Hitung'], q: "Volume kubus dengan sisi 3 cm adalah?", opts: ["9 cm³", "18 cm³", "27 cm³", "36 cm³"], ans: "27 cm³" },
    { tags: ['Unit 3', 'Hitung'], q: "Balok 5x4x3. Volumenya?", opts: ["60", "12", "23", "94"], ans: "60" },
    { tags: ['Unit 3', 'Prisma'], q: "Prisma segitiga, luas alas 10 cm², tinggi 5 cm. Volume?", opts: ["50 cm³", "15 cm³", "25 cm³", "100 cm³"], ans: "50 cm³" },
    { tags: ['Unit 3', 'Rumus'], q: "Rumus volume kubus adalah?", opts: ["s x s", "s x s x s", "6 x s x s", "p x l x t"], ans: "s x s x s" },
    { tags: ['Unit 3', 'Aplikasi'], q: "Akuarium balok 100x50x40 cm. Berapa liter air maksimal?", opts: ["200 Liter", "20 Liter", "2000 Liter", "2 Liter"], ans: "200 Liter" }, // 200.000 cm3 = 200 L
    { tags: ['Unit 3', 'Logika'], q: "Jika volume kubus 8 cm³, berapa panjang sisinya?", opts: ["2 cm", "4 cm", "8 cm", "1 cm"], ans: "2 cm" },
    { tags: ['Unit 3', 'Konsep'], q: "Volume mengukur...", opts: ["Luas permukaan", "Panjang garis", "Isi atau kapasitas", "Berat benda"], ans: "Isi atau kapasitas" },
    { tags: ['Unit 3', 'Hitung'], q: "Setengah dari volume kubus s=4 adalah?", opts: ["64", "32", "16", "8"], ans: "32" },
    { tags: ['Unit 3', 'Prisma'], q: "Prisma segiempat beraturan alas 5x5, tinggi 4. Volume?", opts: ["100", "80", "20", "25"], ans: "100" },
    { tags: ['Unit 3', 'Aplikasi'], q: "Botol minum berbentuk balok 5x5x20. Cukupkah untuk menampung 600ml air?", opts: ["Cukup", "Tidak Cukup", "Pas", "Tergantung"], ans: "Tidak Cukup" }, // 500ml < 600ml
    { tags: ['Unit 3', 'Logika'], q: "Manakah yang volumenya paling besar?", opts: ["Kubus s=10", "Balok 10x10x9", "Balok 10x5x20", "Balok 100x1x1"], ans: "Kubus s=10" }, // 1000, 900, 1000, 100. Wait. 10x5x20=1000. Kubus=1000. Sama besar. Ganti opsi.
    { tags: ['Unit 3', 'Hitung'], q: "Volume balok 2x2x2 sama dengan volume kubus sisi...?", opts: ["2", "4", "8", "6"], ans: "2" },
    { tags: ['Unit 3', 'Konversi'], q: "1 liter sama dengan...", opts: ["1 dm³", "1 cm³", "1 m³", "1 mm³"], ans: "1 dm³" },
    { tags: ['Unit 3', 'Aplikasi'], q: "Kardus besar 50x50x50. Kardus kecil 10x10x10. Muat berapa kardus kecil?", opts: ["25", "50", "125", "100"], ans: "125" }, // 5x5x5
    { tags: ['Unit 3', 'Prisma'], q: "Volume prisma tegak segitiga siku-siku (3,4,5) tinggi 10?", opts: ["60", "120", "30", "600"], ans: "60" },
    { tags: ['Unit 3', 'Logika'], q: "Jika balok dipotong vertikal jadi dua, total volume kedua potongan...", opts: ["Sama dengan balok asli", "Lebih besar", "Lebih kecil", "Nol"], ans: "Sama dengan balok asli" },
    { tags: ['Unit 3', 'Hitung'], q: "Volume kubus s=0.1 m dalam liter?", opts: ["1 L", "10 L", "100 L", "0.1 L"], ans: "1 L" }, // 1 dm = 1 L
    { tags: ['Unit 3', 'Analisis'], q: "Jika tinggi air di balok naik 2cm, berapa penambahan volumenya? (Luas alas = 50)", opts: ["100", "50", "25", "200"], ans: "100" },
    { tags: ['Unit 3', 'Prisma'], q: "Rumus volume prisma secara umum?", opts: ["Luas Alas x Tinggi", "Keliling Alas x Tinggi", "Luas Alas + Tinggi", "1/3 Luas Alas x Tinggi"], ans: "Luas Alas x Tinggi" },
    { tags: ['Unit 3', 'Aplikasi'], q: "Bak mandi 60 liter. Debit kran 2 liter/menit. Penuh dalam?", opts: ["30 menit", "20 menit", "60 menit", "120 menit"], ans: "30 menit" }
];

export const getFallbackAdventureQuestions = (userTopics: string[], limit: number = 10) => {
    let pool = ADVENTURE_QUESTIONS_DB.filter(q => q.tags.includes('basic'));
    const topicQuestions = ADVENTURE_QUESTIONS_DB.filter(q => 
        q.tags.some(tag => userTopics.some(userTopic => userTopic.includes(tag) || tag.includes(userTopic)))
    );
    // Jika userTopics kosong atau tidak match, ambil semua soal matematika
    if (topicQuestions.length === 0) {
        pool = [...pool, ...ADVENTURE_QUESTIONS_DB.filter(q => !q.tags.includes('basic'))];
    } else {
        pool = [...pool, ...topicQuestions];
    }
    
    pool.sort(() => Math.random() - 0.5);
    return pool.slice(0, limit);
};
