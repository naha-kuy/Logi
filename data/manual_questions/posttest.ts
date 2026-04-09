import { Question } from '../../models/types';

/**
 * ============================================================================
 * TEMPAT INPUT MANUAL: SOAL POST-TEST (UJIAN AKHIR)
 * ============================================================================
 * Di sinilah Anda memasukkan soal-soal Post-test secara manual.
 * 
 * Panduan:
 * 1. 'question': Teks pertanyaan.
 * 2. 'options': Array berisi pilihan ganda.
 * 3. 'correctAnswer': Jawaban yang benar.
 * 4. 'optionFeedback': Objek yang berisi feedback UNIK untuk SETIAP opsi.
 */

export const MANUAL_POSTTEST_QUESTIONS: Question[] = [
  {
    id: "posttest-manual-1",
    type: "multiple-choice",
    question: "[PLACEHOLDER POSTTEST 1] Sebuah prisma segitiga memiliki luas alas 20 cm² dan tinggi 10 cm. Berapakah volumenya?",
    options: ["200 cm³", "100 cm³", "300 cm³", "150 cm³"],
    correctAnswer: "200 cm³",
    explanation: "Volume prisma = Luas Alas × Tinggi = 20 × 10 = 200 cm³.",
    optionFeedback: {
      "200 cm³": "Luar biasa! Kamu ingat rumus volume prisma (Luas Alas × Tinggi).",
      "100 cm³": "Kurang tepat. Kamu mungkin membagi duanya lagi. Ingat, luas alasnya sudah diketahui 20 cm².",
      "300 cm³": "Salah. Coba kalikan 20 dengan 10 secara teliti.",
      "150 cm³": "Salah. Gunakan rumus Luas Alas × Tinggi."
    }
  },
  {
    id: "posttest-manual-2",
    type: "multiple-choice",
    question: "[PLACEHOLDER POSTTEST 2] Manakah rumus yang benar untuk menghitung luas permukaan kubus dengan panjang rusuk 's'?",
    options: ["s × s × s", "4 × s", "6 × s²", "s²"],
    correctAnswer: "6 × s²",
    explanation: "Kubus memiliki 6 sisi persegi yang identik. Luas satu persegi adalah s², jadi luas permukaannya 6 × s².",
    optionFeedback: {
      "s × s × s": "Ini adalah rumus Volume, bukan Luas Permukaan.",
      "4 × s": "Ini adalah keliling satu sisi persegi.",
      "6 × s²": "Benar! Ada 6 sisi persegi, dan masing-masing luasnya s².",
      "s²": "Ini hanya luas satu sisi saja. Kubus punya 6 sisi!"
    }
  },
  {
    id: "posttest-manual-3",
    type: "multiple-choice",
    question: "[PLACEHOLDER POSTTEST 3] Volume sebuah kerucut adalah 314 cm³. Jika jari-jari alasnya 5 cm, berapakah tingginya? (Gunakan π = 3.14)",
    options: ["12 cm", "4 cm", "10 cm", "15 cm"],
    correctAnswer: "12 cm",
    explanation: "V = 1/3 × π × r² × t => 314 = 1/3 × 3.14 × 25 × t => 314 = (78.5/3) × t => t = (314 × 3) / 78.5 = 12 cm.",
    optionFeedback: {
      "12 cm": "Sempurna! Kamu berhasil membalik rumus volume kerucut untuk mencari tingginya.",
      "4 cm": "Salah. Kamu mungkin lupa mengalikan dengan 3 di akhir perhitungan.",
      "10 cm": "Kurang tepat. Coba hitung kembali pembagiannya.",
      "15 cm": "Salah. Pastikan kamu menggunakan rumus V = 1/3 × π × r² × t."
    }
  }
  // Tambahkan soal post-test lainnya di sini...
];
