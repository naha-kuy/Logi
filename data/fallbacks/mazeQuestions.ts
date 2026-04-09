// Format: { tags: string[], q: string, opts: string[], ans: number }
// ans adalah index (0-3)

export const MAZE_QUESTIONS_DB = [
    // --- BASIC / GENERAL (10 Soal) ---
    { tags: ['basic'], q: "1, 1, 2, 3, 5, ...?", opts: ["7", "8", "9", "6"], ans: 1 }, 
    { tags: ['basic'], q: "2 + 2 x 2 = ?", opts: ["6", "8", "4", "10"], ans: 0 },
    { tags: ['basic'], q: "Angka prima genap?", opts: ["4", "2", "0", "9"], ans: 1 },
    { tags: ['basic'], q: "1 jam - 10 menit = ?", opts: ["50 m", "90 m", "100 m", "60 m"], ans: 0 },
    { tags: ['basic'], q: "50% dari 100?", opts: ["50", "10", "25", "5"], ans: 0 },
    { tags: ['basic'], q: "Akar dari 144?", opts: ["10", "11", "12", "13"], ans: 2 },
    { tags: ['basic'], q: "3 pangkat 3?", opts: ["9", "27", "6", "18"], ans: 1 },
    { tags: ['basic'], q: "Sudut siku-siku?", opts: ["45°", "90°", "180°", "360°"], ans: 1 },
    { tags: ['basic'], q: "100 dibagi 0?", opts: ["0", "100", "Tak terdefinisi", "1"], ans: 2 },
    { tags: ['basic'], q: "Jumlah jari 2 tangan?", opts: ["8", "10", "12", "20"], ans: 1 },

    // --- UNIT 1: KLASIFIKASI (10 Soal) ---
    { tags: ['Unit 1', 'Kubus'], q: "Sisi pada Kubus ada?", opts: ["4", "6", "8", "12"], ans: 1 },
    { tags: ['Unit 1', 'Prisma'], q: "Alas Prisma Segitiga?", opts: ["Segitiga", "Persegi", "Lingkaran", "Trapesium"], ans: 0 },
    { tags: ['Unit 1', 'Prisma'], q: "Alas & Tutup Prisma?", opts: ["Sama", "Beda", "Tegak Lurus", "Tidak Ada"], ans: 0 },
    { tags: ['Unit 1', 'Rusuk'], q: "Rusuk Kubus ada?", opts: ["8", "10", "12", "6"], ans: 2 },
    { tags: ['Unit 1', 'Titik Sudut'], q: "Titik sudut Balok?", opts: ["6", "8", "10", "12"], ans: 1 },
    { tags: ['Unit 1', 'Sisi'], q: "Sisi tegak Prisma Segitiga?", opts: ["2", "3", "4", "5"], ans: 1 },
    { tags: ['Unit 1', 'Prisma'], q: "Prisma Segilima punya sisi?", opts: ["5", "6", "7", "8"], ans: 2 },
    { tags: ['Unit 1', 'Balok'], q: "Balok punya rusuk?", opts: ["8", "10", "12", "6"], ans: 2 },
    { tags: ['Unit 1', 'Kubus'], q: "Kubus punya titik sudut?", opts: ["6", "8", "10", "12"], ans: 1 },
    { tags: ['Unit 1', 'Prisma'], q: "Alas Prisma Segiempat?", opts: ["Lingkaran", "Segitiga", "Persegi", "Layang-layang"], ans: 2 },

    // --- UNIT 2: LUAS PERMUKAAN (10 Soal) ---
    { tags: ['Unit 2', 'LP Kubus'], q: "Luas Kubus sisi 5?", opts: ["150", "125", "25", "100"], ans: 0 }, 
    { tags: ['Unit 2', 'LP Balok'], q: "Rumus LP Balok?", opts: ["p x l x t", "2(pl+pt+lt)", "s x s", "p + l + t"], ans: 1 }, 
    { tags: ['Unit 2', 'Skala'], q: "Jika sisi x2, Luas jadi?", opts: ["2x", "4x", "8x", "Tetap"], ans: 1 },
    { tags: ['Unit 2', 'LP Kubus'], q: "Rumus LP Kubus?", opts: ["s³", "6s²", "4s", "s²"], ans: 1 },
    { tags: ['Unit 2', 'LP Prisma'], q: "LP Prisma = 2.La + ...?", opts: ["Ka x t", "La x t", "Ka + t", "La + t"], ans: 0 },
    { tags: ['Unit 2', 'LP Prisma'], q: "LP Prisma Segitiga?", opts: ["2La + Ka.t", "La.t", "1/3 La.t", "La + Ka"], ans: 0 },
    { tags: ['Unit 2', 'Hitung'], q: "LP Kubus s=1?", opts: ["1", "6", "4", "12"], ans: 1 },
    { tags: ['Unit 2', 'Hitung'], q: "LP Balok 1x1x2?", opts: ["10", "8", "12", "6"], ans: 0 }, // 2(1+2+2) = 10
    { tags: ['Unit 2', 'Konsep'], q: "Satuan Luas?", opts: ["cm", "cm²", "cm³", "kg"], ans: 1 },
    { tags: ['Unit 2', 'Jaring'], q: "Luas Jaring = Luas...?", opts: ["Permukaan", "Volume", "Alas", "Tutup"], ans: 0 },

    // --- UNIT 3: VOLUME (10 Soal) ---
    { tags: ['Unit 3', 'Volume'], q: "Vol Kubus sisi 4?", opts: ["16", "64", "32", "128"], ans: 1 },
    { tags: ['Unit 3', 'Prisma'], q: "Vol Prisma = ... x Tinggi?", opts: ["Luas Alas", "Keliling Alas", "Luas Selimut", "Sisi"], ans: 0 },
    { tags: ['Unit 3', 'Skala'], q: "Jika sisi x2, Vol jadi?", opts: ["2x", "4x", "8x", "16x"], ans: 2 },
    { tags: ['Unit 3', 'Rumus'], q: "Vol Balok?", opts: ["p+l+t", "p x l x t", "2(p+l)", "p/l/t"], ans: 1 },
    { tags: ['Unit 3', 'Rumus'], q: "Vol Prisma?", opts: ["La x t", "1/3 La x t", "Ka x t", "La + t"], ans: 0 },
    { tags: ['Unit 3', 'Hitung'], q: "Vol Kubus s=10?", opts: ["100", "1000", "10", "30"], ans: 1 },
    { tags: ['Unit 3', 'Hitung'], q: "Vol Balok 2x3x1?", opts: ["5", "6", "12", "8"], ans: 1 },
    { tags: ['Unit 3', 'Konsep'], q: "Satuan Volume?", opts: ["m", "m²", "m³", "Ha"], ans: 2 },
    { tags: ['Unit 3', 'Prisma'], q: "Vol Prisma La=30, t=10?", opts: ["300", "100", "90", "30"], ans: 0 },
    { tags: ['Unit 3', 'Prisma'], q: "Vol Prisma La=10, t=5?", opts: ["50", "15", "2", "500"], ans: 0 }
];

export const getFallbackMazeQuestions = (userTopics: string[], limit: number = 10) => {
    let pool = MAZE_QUESTIONS_DB.filter(q => q.tags.includes('basic'));
    const topicQuestions = MAZE_QUESTIONS_DB.filter(q => 
        q.tags.some(tag => userTopics.some(userTopic => userTopic.includes(tag) || tag.includes(userTopic)))
    );
    // Jika userTopics kosong atau tidak match, ambil semua soal matematika
    if (topicQuestions.length === 0) {
        pool = [...pool, ...MAZE_QUESTIONS_DB.filter(q => !q.tags.includes('basic'))];
    } else {
        pool = [...pool, ...topicQuestions];
    }

    pool.sort(() => Math.random() - 0.5);
    return pool.slice(0, limit);
};
