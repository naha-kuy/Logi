import { Question } from '../../models/types';

// Format khusus Pretest: ID, Soal, Opsi, Jawaban, Penjelasan, Difficulty
// Fokus: Kubus, Balok, Prisma
export const PRETEST_QUESTIONS_DB: (Question & { difficulty: 'easy' | 'medium' | 'hard' })[] = [
    // --- EASY (Konsep Dasar - 8 Soal) ---
    {
        id: 'pt-1', difficulty: 'easy', type: 'multiple-choice',
        question: 'Bangun ruang yang memiliki 6 sisi berbentuk persegi yang sama luas adalah...',
        options: ['Balok', 'Kubus', 'Prisma Segitiga', 'Limas'],
        correctAnswer: 'Kubus',
        explanation: 'Kubus adalah bangun ruang sisi datar yang semua sisinya berbentuk persegi identik.'
    },
    {
        id: 'pt-2', difficulty: 'easy', type: 'multiple-choice',
        question: 'Rumus luas segitiga adalah...',
        options: ['p x l', '1/2 x a x t', 's x s', '2 x (p + l)'],
        correctAnswer: '1/2 x a x t',
        explanation: 'Luas segitiga dihitung dengan setengah kali alas kali tinggi.'
    },
    {
        id: 'pt-3', difficulty: 'easy', type: 'multiple-choice',
        question: 'Sebuah balok memiliki panjang 10cm, lebar 5cm, tinggi 2cm. Volumenya adalah?',
        options: ['100 cm³', '17 cm³', '50 cm³', '20 cm³'],
        correctAnswer: '100 cm³',
        explanation: 'Volume Balok = p x l x t = 10 x 5 x 2 = 100.'
    },
    {
        id: 'pt-4', difficulty: 'easy', type: 'multiple-choice',
        question: 'Berapa banyak titik sudut yang dimiliki oleh sebuah Kubus?',
        options: ['6', '8', '12', '4'],
        correctAnswer: '8',
        explanation: 'Kubus memiliki 8 titik sudut (pojok).'
    },
    {
        id: 'pt-5', difficulty: 'easy', type: 'multiple-choice',
        question: 'Alas dari sebuah Prisma Segitiga berbentuk...',
        options: ['Segitiga', 'Persegi', 'Lingkaran', 'Layang-layang'],
        correctAnswer: 'Segitiga',
        explanation: 'Namanya Prisma Segitiga karena alas dan tutupnya berbentuk segitiga.'
    },
    {
        id: 'pt-6', difficulty: 'easy', type: 'multiple-choice',
        question: 'Manakah di bawah ini yang merupakan bangun ruang sisi datar?',
        options: ['Bola', 'Kerucut', 'Tabung', 'Prisma Segienam'],
        correctAnswer: 'Prisma Segienam',
        explanation: 'Prisma Segienam dibatasi oleh bidang-bidang datar, sedangkan yang lain memiliki sisi lengkung.'
    },
    {
        id: 'pt-7', difficulty: 'easy', type: 'multiple-choice',
        question: 'Jumlah sisi (bidang) pada Balok adalah...',
        options: ['4', '6', '8', '12'],
        correctAnswer: '6',
        explanation: 'Balok memiliki 6 sisi: Depan, Belakang, Atas, Bawah, Kiri, Kanan.'
    },
    {
        id: 'pt-8', difficulty: 'easy', type: 'multiple-choice',
        question: 'Prisma yang semua sisinya berbentuk persegi disebut...',
        options: ['Balok', 'Kubus', 'Prisma Segitiga', 'Limas'],
        correctAnswer: 'Kubus',
        explanation: 'Kubus adalah prisma segiempat beraturan yang semua sisinya persegi.'
    },

    // --- MEDIUM (Aplikasi Rumus - 8 Soal) ---
    {
        id: 'pt-9', difficulty: 'medium', type: 'multiple-choice',
        question: 'Keliling alas sebuah kubus adalah 20 cm. Berapa panjang rusuk kubus tersebut?',
        options: ['4 cm', '5 cm', '10 cm', '20 cm'],
        correctAnswer: '5 cm',
        explanation: 'Alas kubus berbentuk persegi. K = 4s. 20 = 4s -> s = 5.'
    },
    {
        id: 'pt-10', difficulty: 'medium', type: 'multiple-choice',
        question: 'Sebuah kubus memiliki luas permukaan 150 cm². Berapa panjang rusuknya?',
        options: ['5 cm', '6 cm', '10 cm', '25 cm'],
        correctAnswer: '5 cm',
        explanation: 'LP = 6s². 150 = 6s² -> s² = 25 -> s = 5.'
    },
    {
        id: 'pt-11', difficulty: 'medium', type: 'multiple-choice',
        question: 'Volume prisma segitiga dengan luas alas 20 cm² dan tinggi 10 cm adalah...',
        options: ['200 cm³', '600 cm³', '100 cm³', '30 cm³'],
        correctAnswer: '200 cm³',
        explanation: 'Volume Prisma = Luas Alas x Tinggi = 20 x 10 = 200.'
    },
    {
        id: 'pt-12', difficulty: 'medium', type: 'multiple-choice',
        question: 'Sebuah balok berukuran 8cm x 5cm x 2cm. Luas permukaannya adalah...',
        options: ['80 cm²', '132 cm²', '160 cm²', '40 cm²'],
        correctAnswer: '132 cm²',
        explanation: 'LP = 2(pl + pt + lt) = 2(40 + 16 + 10) = 2(66) = 132.'
    },
    {
        id: 'pt-13', difficulty: 'medium', type: 'multiple-choice',
        question: 'Sebuah prisma segitiga memiliki alas segitiga siku-siku dengan sisi 3cm, 4cm, 5cm. Tinggi prisma 10cm. Volumenya?',
        options: ['60 cm³', '120 cm³', '30 cm³', '600 cm³'],
        correctAnswer: '60 cm³',
        explanation: 'Luas Alas = 1/2 x 3 x 4 = 6. Volume = 6 x 10 = 60.'
    },
    {
        id: 'pt-14', difficulty: 'medium', type: 'multiple-choice',
        question: 'Berapa banyak rusuk pada Prisma Segitiga?',
        options: ['6', '9', '12', '5'],
        correctAnswer: '9',
        explanation: 'Prisma segi-n memiliki 3n rusuk. Prisma segitiga (n=3) punya 9 rusuk.'
    },
    {
        id: 'pt-15', difficulty: 'medium', type: 'multiple-choice',
        question: 'Luas permukaan kubus dengan rusuk 10 cm adalah...',
        options: ['100 cm²', '600 cm²', '1000 cm²', '400 cm²'],
        correctAnswer: '600 cm²',
        explanation: 'LP = 6s² = 6 x 100 = 600.'
    },
    {
        id: 'pt-16', difficulty: 'medium', type: 'multiple-choice',
        question: 'Jika volume kubus adalah 64 cm³, maka panjang rusuknya adalah...',
        options: ['2 cm', '4 cm', '8 cm', '16 cm'],
        correctAnswer: '4 cm',
        explanation: 'V = s³. 64 = s³ -> s = 4.'
    },

    // --- HARD (Analisis & Logika - 6 Soal) ---
    {
        id: 'pt-17', difficulty: 'hard', type: 'multiple-choice',
        question: 'Jika panjang rusuk kubus diperbesar 2 kali lipat, maka volumenya menjadi... kali lipat.',
        options: ['2', '4', '6', '8'],
        correctAnswer: '8',
        explanation: 'Volume sebanding pangkat 3. 2³ = 8.'
    },
    {
        id: 'pt-18', difficulty: 'hard', type: 'multiple-choice',
        question: 'Dua buah kubus memiliki perbandingan rusuk 1:3. Perbandingan volumenya adalah...',
        options: ['1:3', '1:9', '1:27', '1:6'],
        correctAnswer: '1:27',
        explanation: 'Volume ~ s³. 1³ : 3³ = 1 : 27.'
    },
    {
        id: 'pt-19', difficulty: 'hard', type: 'multiple-choice',
        question: 'Sebuah bak mandi berbentuk balok terisi penuh air. Jika dimasukkan sebuah kubus pejal yang tenggelam sempurna, volume air yang tumpah sama dengan...',
        options: ['Luas permukaan kubus', 'Volume kubus', 'Volume balok', 'Keliling kubus'],
        correctAnswer: 'Volume kubus',
        explanation: 'Hukum Archimedes: Volume zat cair yang dipindahkan = Volume benda yang tercelup.'
    },
    {
        id: 'pt-20', difficulty: 'hard', type: 'multiple-choice',
        question: 'Kawat sepanjang 120 cm akan dibuat kerangka kubus. Panjang rusuk kubus maksimal adalah...',
        options: ['10 cm', '12 cm', '15 cm', '20 cm'],
        correctAnswer: '10 cm',
        explanation: 'Kubus punya 12 rusuk. 12s = 120 -> s = 10.'
    },
    {
        id: 'pt-21', difficulty: 'hard', type: 'multiple-choice',
        question: 'Sebuah kolam renang berbentuk balok. Jika panjang dan lebar kolam masing-masing ditambah 10%, berapa persen kenaikan luas alas kolam?',
        options: ['10%', '20%', '21%', '100%'],
        correctAnswer: '21%',
        explanation: '1.1 x 1.1 = 1.21. Kenaikan 0.21 atau 21%.'
    },
    {
        id: 'pt-22', difficulty: 'hard', type: 'multiple-choice',
        question: 'Sebuah prisma segiempat beraturan (balok dengan alas persegi) memiliki tinggi 2 kali sisi alas. Jika volumenya 128 cm³, sisi alasnya adalah...',
        options: ['2 cm', '4 cm', '8 cm', '16 cm'],
        correctAnswer: '4 cm',
        explanation: 'V = s² * t. t = 2s. V = s² * 2s = 2s³. 128 = 2s³ -> 64 = s³ -> s = 4.'
    }
];

export const getRandomPretestQuestions = (count: number = 5) => {
    // Ambil proporsi: 40% Easy, 40% Medium, 20% Hard
    const easy = PRETEST_QUESTIONS_DB.filter(q => q.difficulty === 'easy');
    const medium = PRETEST_QUESTIONS_DB.filter(q => q.difficulty === 'medium');
    const hard = PRETEST_QUESTIONS_DB.filter(q => q.difficulty === 'hard');

    // Shuffle each category
    const shuffledEasy = easy.sort(() => 0.5 - Math.random());
    const shuffledMedium = medium.sort(() => 0.5 - Math.random());
    const shuffledHard = hard.sort(() => 0.5 - Math.random());

    // Take subsets
    const selected = [
        ...shuffledEasy.slice(0, 3), // 3 Easy
        ...shuffledMedium.slice(0, 4), // 4 Medium
        ...shuffledHard.slice(0, 3) // 3 Hard
    ];

    return selected.sort(() => 0.5 - Math.random());
};
