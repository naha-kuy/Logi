import { Question } from '../../models/types';

/**
 * ============================================================================
 * TEMPAT INPUT MANUAL: SOAL PRETEST
 * ============================================================================
 * Di sinilah Anda memasukkan soal-soal Pretest secara manual.
 * 
 * Panduan:
 * 1. 'question': Teks pertanyaan.
 * 2. 'options': Array berisi pilihan ganda (misal: ['A', 'B', 'C', 'D']).
 * 3. 'correctAnswer': Jawaban yang benar (harus persis sama dengan salah satu 'options').
 * 4. 'optionFeedback': Objek yang berisi feedback UNIK untuk SETIAP opsi.
 *    Kuncinya (key) harus sama persis dengan teks di 'options'.
 * 
 * Contoh sudah disediakan di bawah ini. Silakan ubah atau tambah soal baru!
 */

export const MANUAL_PRETEST_QUESTIONS: (Question & { difficulty: string })[] = [
  {
    id: "pretest-manual-1",
    difficulty: "easy",
    type: "multiple-choice",
    question: "[PLACEHOLDER PRETEST 1] Manakah di bawah ini yang merupakan bangun ruang sisi datar?",
    options: ["Bola", "Tabung", "Kubus", "Kerucut"],
    correctAnswer: "Kubus",
    explanation: "Kubus memiliki 6 sisi yang semuanya berbentuk persegi (datar).",
    optionFeedback: {
      "Bola": "Kurang tepat. Bola hanya memiliki satu sisi lengkung tanpa sudut.",
      "Tabung": "Kurang tepat. Tabung memiliki selimut yang melengkung.",
      "Kubus": "Benar sekali! Kubus dibatasi oleh 6 sisi datar berbentuk persegi.",
      "Kerucut": "Kurang tepat. Kerucut memiliki selimut yang melengkung."
    }
  },
  {
    id: "pretest-manual-2",
    difficulty: "medium",
    type: "multiple-choice",
    question: "[PLACEHOLDER PRETEST 2] Berapakah volume balok dengan panjang 5cm, lebar 3cm, dan tinggi 2cm?",
    options: ["10 cm³", "15 cm³", "30 cm³", "25 cm³"],
    correctAnswer: "30 cm³",
    explanation: "Volume balok = p × l × t = 5 × 3 × 2 = 30 cm³.",
    optionFeedback: {
      "10 cm³": "Salah. Kamu mungkin hanya mengalikan panjang dan tinggi (5 × 2). Jangan lupa kalikan lebarnya juga!",
      "15 cm³": "Salah. Kamu mungkin hanya mengalikan panjang dan lebar (5 × 3). Jangan lupa kalikan tingginya!",
      "30 cm³": "Tepat! Volume balok dihitung dengan mengalikan panjang, lebar, dan tinggi (5 × 3 × 2 = 30).",
      "25 cm³": "Salah. Coba periksa kembali perkalianmu (5 × 3 × 2)."
    }
  },
  {
    id: "pretest-manual-3",
    difficulty: "hard",
    type: "multiple-choice",
    question: "[PLACEHOLDER PRETEST 3] Sebuah tabung memiliki jari-jari 7 cm dan tinggi 10 cm. Berapakah luas permukaan tabung tersebut? (Gunakan π = 22/7)",
    options: ["440 cm²", "748 cm²", "154 cm²", "308 cm²"],
    correctAnswer: "748 cm²",
    explanation: "Luas permukaan tabung = 2πr(r + t) = 2 × (22/7) × 7 × (7 + 10) = 44 × 17 = 748 cm².",
    optionFeedback: {
      "440 cm²": "Salah. Ini hanya luas selimut tabungnya saja (2πrt). Jangan lupa tambahkan luas 2 alas lingkarannya.",
      "748 cm²": "Luar biasa! Kamu menghitung luas selimut dan kedua alasnya dengan benar.",
      "154 cm²": "Salah. Ini hanya luas satu alas lingkarannya saja (πr²).",
      "308 cm²": "Salah. Ini luas dua alas lingkarannya. Kamu lupa menambahkan luas selimutnya."
    }
  }
  // Tambahkan soal pretest lainnya di sini...
];
