import { LessonSection } from '../materials/index';

/**
 * ============================================================================
 * TEMPAT INPUT MANUAL: SOAL BAB TIAP MATERI (LESSON QUIZZES)
 * ============================================================================
 * Di sinilah Anda memasukkan soal-soal kuis yang muncul di tengah/akhir materi.
 * 
 * Formatnya adalah Dictionary/Objek, di mana kuncinya (key) adalah ID Materi (misal: 'u1-l1').
 * Isinya adalah array dari `LessonSection` bertipe 'multiple-choice'.
 */

export const MANUAL_LESSON_QUIZZES: Record<string, LessonSection[]> = {
  // Contoh untuk Materi Unit 1 Lesson 1 (Jenis Bangun Ruang)
  'u1-l1': [
    {
      id: 'quiz-manual-u1l1-1',
      type: 'multiple-choice',
      question: '[PLACEHOLDER SOAL BAB U1-L1] Perhatikan benda di sekitarmu. Sebuah dadu permainan ular tangga termasuk bentuk bangun apa?',
      options: ['Balok', 'Kubus', 'Bola', 'Tabung'],
      correctAnswer: 'Kubus',
      optionFeedback: {
        'Balok': 'Kurang tepat. Sisi dadu semuanya sama panjang, sedangkan balok bisa berbeda.',
        'Kubus': 'Tepat sekali! Dadu memiliki 6 sisi persegi yang sama, sehingga disebut Kubus.',
        'Bola': 'Salah. Dadu memiliki sudut dan sisi datar, tidak melengkung seperti bola.',
        'Tabung': 'Salah. Tabung memiliki alas lingkaran, dadu tidak.'
      }
    },
    {
      id: 'quiz-manual-u1l1-2',
      type: 'multiple-choice',
      question: '[PLACEHOLDER SOAL BAB U1-L1] Kaleng minuman bersoda biasanya berbentuk apa?',
      options: ['Prisma Segitiga', 'Kerucut', 'Tabung', 'Limas'],
      correctAnswer: 'Tabung',
      optionFeedback: {
        'Prisma Segitiga': 'Salah. Prisma segitiga alasnya bersudut, kaleng alasnya bundar.',
        'Kerucut': 'Kurang tepat. Kerucut mengecil di ujung (seperti topi ulang tahun).',
        'Tabung': 'Benar! Kaleng memiliki alas dan tutup berbentuk lingkaran yang sejajar.',
        'Limas': 'Salah. Limas memiliki titik puncak, kaleng tidak.'
      }
    }
  ],

  // Contoh untuk Materi Unit 1 Lesson 2 (Unsur Bangun Ruang)
  'u1-l2': [
    {
      id: 'quiz-manual-u1l2-1',
      type: 'multiple-choice',
      question: '[PLACEHOLDER SOAL BAB U1-L2] Berapakah jumlah titik sudut pada sebuah balok?',
      options: ['6', '8', '12', '4'],
      correctAnswer: '8',
      optionFeedback: {
        '6': 'Itu adalah jumlah sisinya, bukan titik sudut.',
        '8': 'Benar! Balok memiliki 4 titik sudut di alas dan 4 di tutup.',
        '12': 'Itu adalah jumlah rusuknya.',
        '4': 'Kurang tepat. Coba hitung alas dan tutupnya.'
      }
    }
  ],

  // Contoh untuk Materi Unit 2 Lesson 1 (Jaring-jaring)
  'u2-l1': [
    {
      id: 'quiz-manual-u2l1-1',
      type: 'multiple-choice',
      question: '[PLACEHOLDER SOAL BAB U2-L1] Jika sebuah kubus dibongkar, bentuk jaring-jaringnya akan terdiri dari berapa buah persegi?',
      options: ['4', '5', '6', '8'],
      correctAnswer: '6',
      optionFeedback: {
        '4': 'Salah. Kubus memiliki alas, tutup, dan 4 sisi tegak.',
        '5': 'Salah. Ini jaring-jaring kubus tanpa tutup.',
        '6': 'Tepat sekali! Kubus dibentuk dari 6 buah persegi yang identik.',
        '8': 'Salah. 8 adalah jumlah titik sudutnya, bukan sisinya.'
      }
    }
  ],

  // Contoh untuk Materi Unit 2 Lesson 2 (Luas Permukaan)
  'u2-l2': [
    {
      id: 'quiz-manual-u2l2-1',
      type: 'multiple-choice',
      question: '[PLACEHOLDER SOAL BAB U2-L2] Luas permukaan balok dengan p=4, l=3, t=2 adalah...',
      options: ['24', '52', '48', '26'],
      correctAnswer: '52',
      optionFeedback: {
        '24': 'Salah. Itu adalah volumenya (4 × 3 × 2).',
        '52': 'Benar! 2×(pl + pt + lt) = 2×(12 + 8 + 6) = 2×26 = 52.',
        '48': 'Salah. Coba hitung kembali penjumlahannya.',
        '26': 'Salah. Kamu lupa mengalikannya dengan 2 di akhir.'
      }
    }
  ]
  
  // Tambahkan ID materi lainnya ('u1-l3', 'u2-l1', dst) di sini...
};
