import { MaterialContent } from './index';

export const u1_l2: MaterialContent = {
  id: 'u1-l2',
  title: 'Unsur-Unsur Bangun Ruang',
  intro: 'Mari kita analisis unsur-unsur pembentuk sebuah bangun ruang.',
  objectives: [
    'Siswa dapat mengidentifikasi titik sudut, rusuk, sisi, dan diagonal pada balok.',
    'Siswa dapat menemukan pola hubungan antar unsur bangun ruang (Rumus Euler).'
  ],
  sections: [
    {
      id: 'intro',
      type: 'text',
      htmlContent: `
        <h2 class="text-2xl font-bold text-indigo-900 mb-4">Analisis Balok</h2>
        <p class="mb-4 text-slate-700 leading-relaxed">
          Di bawah ini terdapat sebuah <strong>Balok</strong>. Balok adalah salah satu jenis prisma segiempat. 
          Gunakan laboratorium 3D di bawah ini untuk mengamati berbagai unsurnya. Kamu bisa menyalakan atau mematikan setiap unsur untuk melihatnya lebih jelas.
        </p>
      `
    },
    {
      id: 'cube-demo',
      type: '3d-demo',
      modelType: 'elements'
    },
    {
      id: 'inquiry-vertex',
      type: 'inquiry-input',
      question: 'Berdasarkan pengamatanmu, ada berapa jumlah Titik Sudut (bulatan merah) pada balok tersebut?',
      placeholder: 'Masukkan angka...',
      correctAnswer: 8,
      feedback: 'Tepat sekali! Balok memiliki 8 titik sudut (4 di bawah dan 4 di atas).',
      hideWhenVisible: 'inquiry-edge'
    },
    {
      id: 'inquiry-edge',
      type: 'inquiry-input',
      question: 'Sekarang, hitunglah jumlah Rusuk (garis biru gelap) pada balok.',
      placeholder: 'Masukkan angka...',
      correctAnswer: 12,
      feedback: 'Benar! Ada 12 rusuk: 4 rusuk panjang (p), 4 rusuk lebar (l), dan 4 rusuk tinggi (t).',
      hideWhenVisible: 'inquiry-face'
    },
    {
      id: 'inquiry-face',
      type: 'inquiry-input',
      question: 'Berapa jumlah Sisi (bidang datar berwarna biru muda) yang membatasi balok?',
      placeholder: 'Masukkan angka...',
      correctAnswer: 6,
      feedback: 'Betul! Balok dibatasi oleh 6 sisi (depan-belakang, kiri-kanan, atas-bawah).',
      hideWhenVisible: 'inquiry-facediag'
    },
    {
      id: 'inquiry-facediag',
      type: 'inquiry-input',
      question: 'Coba nyalakan "Diagonal Bidang". Berapa total garis diagonal yang ada pada seluruh sisi balok?',
      placeholder: 'Masukkan angka...',
      correctAnswer: 12,
      feedback: 'Luar biasa! Setiap sisi (ada 6 sisi) memiliki 2 diagonal bidang, sehingga totalnya 6 x 2 = 12.',
      hideWhenVisible: 'inquiry-spacediag'
    },
    {
      id: 'inquiry-spacediag',
      type: 'inquiry-input',
      question: 'Nyalakan "Diagonal Ruang". Berapa jumlah garis yang melintasi ruang dalam balok dari satu titik sudut ke titik sudut seberangnya?',
      placeholder: 'Masukkan angka...',
      correctAnswer: 4,
      feedback: 'Mantap! Ada 4 diagonal ruang yang saling berpotongan di tengah balok.',
      hideWhenVisible: 'inquiry-diagplane'
    },
    {
      id: 'inquiry-diagplane',
      type: 'inquiry-input',
      question: 'Terakhir, nyalakan "Bidang Diagonal". Berapa banyak bidang diagonal yang dapat terbentuk di dalam balok?',
      placeholder: 'Masukkan angka...',
      correctAnswer: 6,
      feedback: 'Hebat! Ada 6 bidang diagonal yang membelah balok menjadi dua prisma segitiga.',
      hideWhenVisible: 'euler-intro'
    },
    {
      id: 'euler-intro',
      type: 'text',
      htmlContent: `
        <h2 class="text-2xl font-bold text-indigo-900 mb-4 mt-8">Menemukan Pola Tersembunyi</h2>
        <p class="mb-4 text-slate-700 leading-relaxed">
          Kamu sudah berhasil menghitung unsur-unsur balok. Sekarang, mari kita perhatikan tiga unsur utama: <strong>Titik Sudut</strong>, <strong>Sisi</strong>, dan <strong>Rusuk</strong>.
        </p>
        <div class="bg-indigo-50 p-4 rounded-2xl border-2 border-indigo-100 mb-6 flex justify-around text-center">
            <div>
                <div class="text-sm font-bold text-indigo-400 uppercase">Titik Sudut</div>
                <div class="text-3xl font-black text-indigo-600">8</div>
            </div>
            <div>
                <div class="text-sm font-bold text-indigo-400 uppercase">Sisi</div>
                <div class="text-3xl font-black text-indigo-600">6</div>
            </div>
            <div>
                <div class="text-sm font-bold text-indigo-400 uppercase">Rusuk</div>
                <div class="text-3xl font-black text-indigo-600">12</div>
            </div>
        </div>
      `
    },
    {
      id: 'inquiry-euler-1',
      type: 'multiple-choice',
      question: 'Jika kamu menjumlahkan Titik Sudut dan Sisi pada balok, berapakah hasilnya?',
      options: ['12', '14', '16', '20'],
      correctAnswer: '14',
      feedback: 'Benar! 8 (Titik Sudut) + 6 (Sisi) = 14.',
      hideWhenVisible: 'inquiry-euler-2'
    },
    {
      id: 'inquiry-euler-2',
      type: 'multiple-choice',
      question: 'Bandingkan hasil penjumlahan tadi (14) dengan jumlah Rusuk (12). Berapa selisihnya?',
      options: ['0', '1', '2', '4'],
      correctAnswer: '2',
      feedback: 'Tepat sekali! 14 - 12 = 2. Apakah ini hanya kebetulan?',
      hideWhenVisible: 'euler-limas'
    },
    {
      id: 'euler-limas',
      type: 'text',
      htmlContent: `
        <p class="mb-4 text-slate-700 leading-relaxed">
          Mari kita uji pola ini pada bangun lain, misalnya <strong>Limas Segiempat</strong> (seperti piramida).
        </p>
        <ul class="list-disc pl-6 mb-6 space-y-2 text-slate-700">
          <li><strong>Titik Sudut:</strong> 5 (4 di alas, 1 di puncak)</li>
          <li><strong>Sisi:</strong> 5 (1 alas, 4 sisi tegak)</li>
          <li><strong>Rusuk:</strong> 8 (4 di alas, 4 rusuk tegak)</li>
        </ul>
      `
    },
    {
      id: 'inquiry-euler-3',
      type: 'multiple-choice',
      question: 'Coba terapkan pola yang sama: (Titik Sudut + Sisi) - Rusuk. Berapakah hasilnya untuk Limas Segiempat?',
      options: ['0', '1', '2', '3'],
      correctAnswer: '2',
      feedback: 'Luar biasa! (5 + 5) - 8 = 2. Hasilnya tetap 2!',
      hideWhenVisible: 'euler-prisma'
    },
    {
      id: 'euler-prisma',
      type: 'text',
      htmlContent: `
        <p class="mb-4 text-slate-700 leading-relaxed">
          Satu lagi, mari kita coba pada <strong>Prisma Segitiga</strong> (seperti tenda).
        </p>
        <ul class="list-disc pl-6 mb-6 space-y-2 text-slate-700">
          <li><strong>Titik Sudut:</strong> 6 (3 di depan, 3 di belakang)</li>
          <li><strong>Sisi:</strong> 5 (2 segitiga, 3 persegi panjang)</li>
          <li><strong>Rusuk:</strong> 9 (3 depan, 3 belakang, 3 penghubung)</li>
        </ul>
      `
    },
    {
      id: 'inquiry-euler-4',
      type: 'multiple-choice',
      question: 'Hitung lagi dengan pola yang sama: (Titik Sudut + Sisi) - Rusuk. Berapakah hasilnya untuk Prisma Segitiga?',
      options: ['0', '1', '2', '3'],
      correctAnswer: '2',
      feedback: 'Luar biasa! (6 + 5) - 9 = 2. Hasilnya selalu 2!',
      hideWhenVisible: 'euler-playground'
    },
    {
      id: 'euler-playground',
      type: 'logic-playground',
      question: 'Dari pengamatanmu pada Balok, Limas Segiempat, dan Prisma Segitiga, susunlah rumus umum yang menghubungkan Titik Sudut, Sisi, dan Rusuk!',
      playgroundConfig: {
        availableBlocks: ['Titik Sudut', 'Sisi', 'Rusuk', '+', '-', '=', '2'],
        correctAnswers: [
          ['Titik Sudut', '+', 'Sisi', '-', 'Rusuk', '=', '2'],
          ['Sisi', '+', 'Titik Sudut', '-', 'Rusuk', '=', '2'],
          ['Titik Sudut', '-', 'Rusuk', '+', 'Sisi', '=', '2'],
          ['Sisi', '-', 'Rusuk', '+', 'Titik Sudut', '=', '2']
        ]
      },
      feedback: 'Luar biasa! Kamu telah berhasil menyusun rumus umumnya.'
    },
    {
      id: 'euler-conclusion',
      type: 'text',
      htmlContent: `
        <div class="bg-indigo-50 p-8 rounded-3xl border-2 border-indigo-100 my-8">
            <h3 class="text-2xl font-black mb-4 text-center text-indigo-900 uppercase tracking-widest">Kesimpulan: Rumus Euler</h3>
            <p class="text-center mb-6 text-indigo-700 font-medium text-lg">
                Rumus yang baru saja kamu temukan disebut sebagai <strong>Rumus Euler</strong>. Rumus ini berlaku untuk bangun ruang sisi datar.
            </p>
            
            <div class="flex items-center justify-center gap-4 text-3xl md:text-5xl font-black mb-6">
                <div class="flex flex-col items-center">
                    <span class="text-red-500">V</span>
                    <span class="text-xs font-bold text-red-400 mt-2 uppercase tracking-wider">Titik Sudut</span>
                </div>
                <span class="text-slate-400">-</span>
                <div class="flex flex-col items-center">
                    <span class="text-slate-700">E</span>
                    <span class="text-xs font-bold text-slate-500 mt-2 uppercase tracking-wider">Rusuk</span>
                </div>
                <span class="text-slate-400">+</span>
                <div class="flex flex-col items-center">
                    <span class="text-blue-500">F</span>
                    <span class="text-xs font-bold text-blue-400 mt-2 uppercase tracking-wider">Sisi</span>
                </div>
                <span class="text-slate-400">=</span>
                <span class="text-yellow-500">2</span>
            </div>
            
            <div class="bg-white p-4 rounded-xl border border-indigo-100">
                <p class="text-sm text-center font-medium text-indigo-500">
                    *V = Vertices (Titik Sudut), E = Edges (Rusuk), F = Faces (Sisi)
                </p>
            </div>
        </div>
      `
    }
  ],
  practiceQuestions: [
    {
      id: 'q-u1-l2-1',
      type: 'multiple-choice',
      question: '[PLACEHOLDER] Latihan Soal Unsur-Unsur Bangun Ruang. Soal ini akan dikembangkan lebih lanjut.',
      options: ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'],
      correctAnswer: 'Opsi A',
      explanation: 'Ini adalah penjelasan placeholder.',
      feedbackCorrect: 'Jawaban Anda benar! (Feedback placeholder)',
      feedbackIncorrect: 'Jawaban Anda salah. Silakan coba lagi. (Feedback placeholder)'
    }
  ]
};
