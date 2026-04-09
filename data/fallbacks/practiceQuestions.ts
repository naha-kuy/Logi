import { Question } from '../../models/types';

// Soal lengkap dengan format Question type
export const PRACTICE_QUESTIONS_DB: (Question & { tags: string[] })[] = [
    // --- DEBUGGING / ERROR ANALYSIS ---
    {
        id: 'p-basic-1',
        tags: ['basic', 'Logic'],
        type: 'multiple-choice',
        question: 'Budi menulis: "5 + 3 x 2 = 16". Di mana letak kesalahan logika Budi?',
        options: [
            'Tidak ada salah, hasilnya benar',
            'Budi menjumlahkan dulu baru mengali (5+3)x2',
            'Budi salah hitung perkalian',
            'Budi menggunakan sistem bilangan biner'
        ],
        correctAnswer: 'Budi menjumlahkan dulu baru mengali (5+3)x2',
        explanation: 'Hirarki operasi (PEMDAS): Perkalian harus didahulukan. Seharusnya 3x2=6, lalu 5+6=11.'
    },

    // --- UNIT 3: VOLUME ---
    {
        id: 'p-u3-1',
        tags: ['Unit 3', 'Volume', 'Kubus'],
        type: 'multiple-choice',
        question: 'Sebuah kubus besar (s=10) dipotong-potong menjadi kubus kecil (s=2). Berapa jumlah kubus kecil maksimal yang didapat?',
        options: ['5', '25', '100', '125'],
        correctAnswer: '125',
        explanation: 'Volume Besar = 1000. Volume Kecil = 8. Jumlah = 1000/8 = 125. Atau gunakan rasio sisi: (10/2)^3 = 5^3 = 125.'
    },

    // --- UNIT 2: LUAS PERMUKAAN ---
    {
        id: 'p-u2-1',
        tags: ['Unit 2', 'Luas Permukaan', 'Balok'],
        type: 'multiple-choice',
        question: 'Sebuah balok memiliki panjang 10, lebar 5, dan tinggi 2. Luas permukaannya adalah?',
        options: ['100', '160', '132', '80'],
        correctAnswer: '160',
        explanation: 'LP = 2(pl + pt + lt) = 2(50 + 20 + 10) = 2(80) = 160.'
    },

    // --- CT / ALGORITHMIC ---
    {
        id: 'p-ct-1',
        tags: ['Logic', 'Algorithmic'],
        type: 'multiple-choice',
        question: 'Terdapat 3 tumpukan koin: A(5), B(3), C(0). Kamu ingin memindahkan semua ke C. Aturan: hanya boleh pindah 1 koin per langkah. Langkah minimal?',
        options: ['5 langkah', '8 langkah', '3 langkah', '15 langkah'],
        correctAnswer: '8 langkah',
        explanation: 'Total koin ada 5+3=8. Setiap koin butuh dipindah minimal 1 kali ke C. Jadi 8 langkah.'
    }
];

export const getFallbackPracticeQuestions = (userTopics: string[], limit: number = 5) => {
    let pool = PRACTICE_QUESTIONS_DB.filter(q => q.tags.includes('basic'));
    
    const topicQuestions = PRACTICE_QUESTIONS_DB.filter(q => 
        q.tags.some(tag => userTopics.some(userTopic => userTopic.includes(tag) || tag.includes(userTopic)))
    );

    pool = [...pool, ...topicQuestions];
    
    // Hapus duplikat berdasarkan ID
    const uniquePool = Array.from(new Map(pool.map(item => [item.id, item])).values());
    
    uniquePool.sort(() => Math.random() - 0.5);
    return uniquePool.slice(0, limit);
};