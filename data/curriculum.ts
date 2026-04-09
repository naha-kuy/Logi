import { Unit } from '../models/types';

/**
 * --- DATA LAYER ---
 * Definisi Kurikulum: Fokus Volume & Computational Thinking (Inquiry Based)
 * Berisi struktur unit dan pelajaran yang tersedia dalam aplikasi.
 */
export const CURRICULUM_DATA: Unit[] = [
  {
    id: 'u1', 
    title: 'Unit 1: Perkenalan Bangun Ruang', 
    description: 'Mengenal Dunia 3D', 
    color: 'bg-feather', 
    lessons: [
      { id: 'u1-l1', title: 'Jenis Bangun Ruang', description: 'Sisi Datar vs Sisi Lengkung', xpReward: 10, isCompleted: false, isLocked: false, questions: [] }, 
      { id: 'u1-l2', title: 'Unsur-Unsur Bangun Ruang', description: 'Sisi, Rusuk, dan Titik Sudut', xpReward: 15, isCompleted: false, isLocked: false, questions: [] }
    ]
  },
  {
    id: 'u2',
    title: 'Unit 2: Volume Bangun Ruang',
    description: 'Menghitung Isi Ruang',
    color: 'bg-macaw',
    lessons: [
      { id: 'u2-l1', title: 'Volume Balok & Kubus', description: 'Menemukan rumus dasar volume', xpReward: 15, isCompleted: false, isLocked: false, questions: [] },
      { id: 'u2-l2-prisma', title: 'Volume Prisma', description: 'Generalisasi rumus volume', xpReward: 15, isCompleted: false, isLocked: false, questions: [] }
    ]
  }
];

/**
 * Fungsi helper untuk mendapatkan daftar topik (judul pelajaran) yang telah diselesaikan.
 * Mengambil maksimal 5 topik terakhir yang diselesaikan.
 * Jika belum ada yang diselesaikan, mengembalikan topik dasar default.
 * 
 * @param {string[]} completedIds - Array ID pelajaran yang telah diselesaikan oleh pengguna.
 * @returns {string[]} Array string berisi judul-judul topik yang telah diselesaikan.
 */
export const getCompletedTopics = (completedIds: string[]): string[] => {
  const topics: string[] = [];
  
  CURRICULUM_DATA.forEach(unit => {
    unit.lessons.forEach(lesson => {
      if (completedIds.includes(lesson.id)) {
        topics.push(lesson.title);
      }
    });
  });
  
  if (topics.length === 0) {
    return ['Logika Dasar', 'Pola Bilangan'];
  }
  
  return topics.slice(-5);
};
