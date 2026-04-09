import { MaterialContent } from './index';

export const u2_l1: MaterialContent = {
  id: 'u2-l1',
  title: 'Banyak Kubus Satuan (Volume)',
  intro: 'Menemukan rumus banyak kubus satuan melalui eksperimen pengisian ruang.',
  objectives: [
    'Siswa dapat memahami konsep volume sebagai banyaknya kubus satuan yang mengisi bangun ruang.',
    'Siswa dapat menemukan rumus banyak kubus satuan balok secara mandiri.',
    'Siswa dapat menghitung banyak kubus satuan balok dengan dimensi yang berbeda.'
  ],
  sections: [
    {
      id: 'intro',
      type: 'text',
      htmlContent: `
        <p>Apa itu <strong>Volume</strong>? Volume adalah ukuran seberapa banyak ruang yang bisa ditempati oleh suatu benda.</p>
        <p>Bayangkan kamu punya kotak kosong. Berapa banyak kubus kecil (satuan) yang bisa kamu masukkan sampai kotak itu penuh?</p>
        <p>Mari kita coba isi kotak berbentuk <strong>Kubus</strong> di bawah ini.</p>
      `
    },
    {
      id: 'kubus-1',
      type: '3d-demo',
      modelType: 'volume',
      modelConfig: {
          shape: 'balok',
          mode: 'fixed',
          p: 3,
          l: 3,
          t: 3
      }
    },
    {
      id: 'inquiry-kubus-p',
      type: 'inquiry-input',
      question: 'Perhatikan kubus di atas. Berapa jumlah kubus satuan sepanjang sisi PANJANG (mendatar)?',
      placeholder: 'Masukkan angka...',
      correctAnswer: 3,
      feedback: 'Mantap! Panjangnya adalah 3 satuan.',
      hideWhenVisible: 'inquiry-kubus-l'
    },
    {
      id: 'inquiry-kubus-l',
      type: 'inquiry-input',
      question: 'Berapa jumlah kubus satuan sepanjang sisi LEBAR (ke belakang)?',
      placeholder: 'Masukkan angka...',
      correctAnswer: 3,
      feedback: 'Mantap! Lebarnya adalah 3 satuan.',
      hideWhenVisible: 'inquiry-kubus-t'
    },
    {
      id: 'inquiry-kubus-t',
      type: 'inquiry-input',
      question: 'Berapa jumlah kubus satuan sepanjang sisi TINGGI (tegak)?',
      placeholder: 'Masukkan angka...',
      correctAnswer: 3,
      feedback: 'Mantap! Tingginya adalah 3 satuan.',
      hideWhenVisible: 'inquiry-kubus-total'
    },
    {
      id: 'inquiry-kubus-total',
      type: 'inquiry-input',
      question: 'Sekarang, hitung TOTAL semua kubus satuan yang mengisi penuh kubus tersebut.',
      placeholder: 'Masukkan angka...',
      correctAnswer: 27,
      feedback: 'Luar biasa! Totalnya ada 27 kubus satuan.',
      hideWhenVisible: 'balok-1-intro'
    },
    {
      id: 'balok-1-intro',
      type: 'text',
      htmlContent: `
        <p>Bagus sekali! Sekarang mari kita lihat <strong>Balok</strong> dengan ukuran yang berbeda.</p>
      `
    },
    {
      id: 'balok-1',
      type: '3d-demo',
      modelType: 'volume',
      modelConfig: {
          shape: 'balok',
          mode: 'fixed',
          p: 4,
          l: 3,
          t: 2
      }
    },
    {
      id: 'inquiry-balok-p',
      type: 'inquiry-input',
      question: 'Berapa jumlah kubus satuan sepanjang sisi PANJANG (mendatar) pada balok ini?',
      placeholder: 'Masukkan angka...',
      correctAnswer: 4,
      feedback: 'Mantap! Panjangnya adalah 4 satuan.',
      hideWhenVisible: 'inquiry-balok-l'
    },
    {
      id: 'inquiry-balok-l',
      type: 'inquiry-input',
      question: 'Berapa jumlah kubus satuan sepanjang sisi LEBAR (ke belakang)?',
      placeholder: 'Masukkan angka...',
      correctAnswer: 3,
      feedback: 'Mantap! Lebarnya adalah 3 satuan.',
      hideWhenVisible: 'inquiry-balok-t'
    },
    {
      id: 'inquiry-balok-t',
      type: 'inquiry-input',
      question: 'Berapa jumlah kubus satuan sepanjang sisi TINGGI (tegak)?',
      placeholder: 'Masukkan angka...',
      correctAnswer: 2,
      feedback: 'Mantap! Tingginya adalah 2 satuan.',
      hideWhenVisible: 'inquiry-balok-total'
    },
    {
      id: 'inquiry-balok-total',
      type: 'inquiry-input',
      question: 'Hitung TOTAL semua kubus satuan yang mengisi penuh balok tersebut.',
      placeholder: 'Masukkan angka...',
      correctAnswer: 24,
      feedback: 'Luar biasa! Totalnya ada 24 kubus satuan.',
      hideWhenVisible: 'lab-mandiri'
    },
    {
      id: 'lab-mandiri',
      type: 'text',
      htmlContent: `
        <p>Sekarang giliranmu! Cobalah membuat balokmu sendiri di <strong>Lab Mandiri</strong> di bawah ini.</p>
        <p>Masukkan nilai panjang (p), lebar (l), dan tinggi (t), lalu tekan <strong>BANGUN SEKARANG</strong>.</p>
      `
    },
    {
      id: 'lab-demo',
      type: '3d-demo',
      modelType: 'volume',
      modelConfig: {
          shape: 'balok',
          mode: 'lab',
          p: 3,
          l: 3,
          t: 3
      }
    },
    {
      id: 'inquiry-pola',
      type: 'multiple-choice',
      question: 'Dari percobaan-percobaan di atas, apakah kamu melihat pola hubungan antara panjang (p), lebar (l), tinggi (t) dengan total kubus satuan?',
      options: [
        'Total kubus = p + l + t',
        'Total kubus = p × l × t',
        'Total kubus = (p + l) × t'
      ],
      correctAnswer: 'Total kubus = p × l × t',
      feedback: 'Tepat sekali! Total kubus satuan selalu sama dengan hasil kali panjang, lebar, dan tingginya.',
      hideWhenVisible: 'volume-playground'
    },
    {
      id: 'volume-playground',
      type: 'logic-playground',
      question: 'Susunlah rumus Volume Balok berdasarkan pola yang kamu temukan!',
      playgroundConfig: {
        availableBlocks: ['Volume Balok', '=', 'p', 'l', 't', '×', '+'],
        correctAnswers: [
          ['Volume Balok', '=', 'p', '×', 'l', '×', 't'],
          ['Volume Balok', '=', 'p', '×', 't', '×', 'l'],
          ['Volume Balok', '=', 'l', '×', 'p', '×', 't'],
          ['Volume Balok', '=', 'l', '×', 't', '×', 'p'],
          ['Volume Balok', '=', 't', '×', 'p', '×', 'l'],
          ['Volume Balok', '=', 't', '×', 'l', '×', 'p']
        ]
      },
      feedback: 'Luar biasa! Kamu telah berhasil menyusun rumus Volume Balok. Ingat, perkalian bersifat komutatif, jadi urutan p, l, dan t bisa ditukar-tukar.'
    },
    {
      id: 'volume-playground-kubus',
      type: 'logic-playground',
      question: 'Sekarang, susunlah rumus Volume Kubus! Ingat, pada kubus p = l = t = s (sisi).',
      playgroundConfig: {
        availableBlocks: ['Volume Kubus', '=', 's', 's', 's', '×', '+'],
        correctAnswers: [
          ['Volume Kubus', '=', 's', '×', 's', '×', 's']
        ]
      },
      feedback: 'Hebat! Karena semua sisi kubus sama panjang, rumusnya menjadi s × s × s.'
    },
    {
      id: 'formula',
      type: 'text',
      htmlContent: `
        <h3>Kesimpulan Rumus Volume</h3>
        <p>Dari percobaan dan penyusunan rumus di atas, kita bisa menyimpulkan:</p>
        <div class="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500 my-4">
            <p class="text-xl font-bold text-center">Volume Balok = $p \\times l \\times t$</p>
        </div>
        <div class="bg-indigo-50 p-4 rounded-xl border-l-4 border-indigo-500 my-4">
            <p class="text-xl font-bold text-center">Volume Kubus = $s \\times s \\times s = s^3$</p>
        </div>
      `
    }
  ],
  practiceQuestions: [
    {
      id: 'q-u2-l1-1',
      type: 'multiple-choice',
      question: '[PLACEHOLDER] Latihan Soal Volume Balok & Kubus. Soal ini akan dikembangkan lebih lanjut.',
      options: ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'],
      correctAnswer: 'Opsi A',
      explanation: 'Ini adalah penjelasan placeholder.',
      feedbackCorrect: 'Jawaban Anda benar! (Feedback placeholder)',
      feedbackIncorrect: 'Jawaban Anda salah. Silakan coba lagi. (Feedback placeholder)'
    }
  ]
};
