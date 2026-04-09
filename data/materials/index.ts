import { Question } from '../../types';

/**
 * Tipe bagian (section) dalam sebuah materi pelajaran.
 * Menentukan bagaimana konten akan dirender (teks, demo 3D, input interaktif, dll).
 */
export type SectionType = 'text' | '3d-demo' | 'inquiry-input' | 'multiple-choice' | 'logic-playground';

/**
 * Merepresentasikan satu bagian (section) konten dalam sebuah pelajaran.
 */
export interface LessonSection {
  id: string;
  type: SectionType;
  // Text Content
  htmlContent?: string;
  
  // 3D Content
  modelType?: 'gallery' | 'elements' | 'volume';
  modelConfig?: {
      shape?: 'balok' | 'kubus' | 'prisma' | 'limas';
      mode?: 'fixed' | 'lab';
      p?: number;
      l?: number;
      t?: number;
      segments?: number;
      initialTab?: 'datar' | 'lengkung';
  }; // Flexible config for the specific model
  
  // Inquiry Content
  question?: string;
  options?: string[]; // For multiple-choice
  correctAnswer?: string | number; // Exact match for simplicity
  placeholder?: string;
  feedback?: string; // Shown after correct answer
  optionFeedback?: Record<string, string>; // Specific feedback per option (Manual Input)
  hideWhenVisible?: string; // ID of the section that, when visible, hides this section
  
  // Logic Playground Content
  playgroundConfig?: {
      availableBlocks: string[];
      correctAnswers: string[][];
  };
}

/**
 * Merepresentasikan keseluruhan konten materi untuk satu pelajaran.
 */
export interface MaterialContent {
  id: string;
  title: string;
  intro: string; 
  objectives: string[]; // ABCD Format
  sections: LessonSection[]; // Replaces single 'content' string
  practiceQuestions: Question[]; 
}

const materialRegistry: Record<string, () => Promise<MaterialContent>> = {
  // Unit 1: Perkenalan Bangun Ruang
  'u1-l1': () => import('./u1_l1').then(m => m.u1_l1), // Jenis Bangun Ruang
  'u1-l2': () => import('./u1_l2').then(m => m.u1_l2), // Unsur-Unsur Bangun Ruang
  
  // Unit 2: Volume Bangun Ruang
  'u2-l1': () => import('./u2_l1').then(m => m.u2_l1), // Volume Balok & Kubus
  'u2-l2-prisma': () => import('./u2_l2_prisma').then(m => m.u2_l2_prisma), // Volume Prisma
};

/**
 * Fungsi untuk mengambil konten materi pelajaran berdasarkan ID pelajaran.
 * Memuat modul materi secara dinamis (lazy loading) sesuai kebutuhan.
 * 
 * @param {string} lessonId - ID pelajaran yang ingin dimuat materinya (misal: 'u1-l1').
 * @returns {Promise<MaterialContent | null>} Promise yang menghasilkan konten materi, atau null jika tidak ditemukan/gagal.
 */
export const getMaterial = async (lessonId: string): Promise<MaterialContent | null> => {
  const loader = materialRegistry[lessonId];
  if (!loader) {
      console.warn(`Material loader not found for lesson: ${lessonId}`);
      return null;
  }
  try {
    return await loader();
  } catch (e) {
    console.error(`Gagal memuat materi ${lessonId}`, e);
    return null;
  }
};
