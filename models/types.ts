/**
 * --- MODEL LAYER ---
 * Centralized Type Definitions
 * File ini berisi definisi tipe data TypeScript yang digunakan di seluruh aplikasi.
 */

/**
 * Merepresentasikan sebuah pertanyaan dalam kuis atau tes.
 */
export interface Question {
  id: string;
  type: 'multiple-choice' | 'fill-gap';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  feedbackCorrect?: string;
  feedbackIncorrect?: string;
  // Menambahkan feedback spesifik untuk setiap opsi jawaban (Manual Input)
  optionFeedback?: Record<string, string>;
}

/**
 * Merepresentasikan sebuah pelajaran atau materi di dalam unit.
 */
export interface Lesson {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  questions: Question[];
  isCompleted: boolean;
  isLocked: boolean;
  contentId?: string; 
}

/**
 * Merepresentasikan sebuah unit pembelajaran yang berisi beberapa pelajaran.
 */
export interface Unit {
  id: string;
  title: string;
  description: string;
  color: string;
  lessons: Lesson[];
}

/**
 * Konfigurasi untuk tampilan avatar pengguna.
 */
export interface AvatarConfig {
  bgColor: string;
  eyes: number;
  mouth: number;
}

/**
 * Tipe peran pengguna dalam sistem.
 */
export type UserRole = 'guru' | 'siswa';

/**
 * Merepresentasikan data pengguna (siswa atau guru).
 */
export interface UserData {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  grade: string;
  password_plain?: string;
  is_active: boolean;
  level: number;
  exp: number;
  streak: number;
  completed_lessons: string[];
  has_completed_pretest?: boolean; // New Field
  has_completed_posttest?: boolean; 
  posttest_score?: number;
  avatar_config?: AvatarConfig;
  created_at?: string;
}

/**
 * Merepresentasikan pesan dalam forum diskusi.
 */
export interface ForumMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  username: string;
  role: 'guru' | 'siswa';
  avatar_config?: AvatarConfig;
  parent_id?: string | null;
  replies?: ForumMessage[];
}

/**
 * Merepresentasikan catatan aktivitas pengguna.
 */
export interface ActivityLog {
  id: string;
  user_id: string;
  username: string;
  action_type: 'lesson_complete' | 'level_up' | 'badge_earned' | 'pretest_complete';
  details: string;
  created_at: string;
  avatar_config?: AvatarConfig;
}

/**
 * --- MAZE GAME TYPES ---
 * Tipe data spesifik untuk permainan labirin.
 */

/**
 * Tipe sel dalam peta labirin.
 * 0: Jalan kosong
 * 1: Dinding
 * 2: Pemain
 * 3: Musuh/Rintangan
 * 4: Item/Koin
 * 5: Pintu Keluar
 */
export type CellType = 0 | 1 | 2 | 3 | 4 | 5; 

/**
 * State dari peta labirin.
 */
export interface MazeState {
  map: CellType[][];
  rows: number;
  cols: number;
}

/**
 * Koordinat posisi dalam grid 2D.
 */
export interface Position {
  row: number;
  col: number;
}

/**
 * --- ADVENTURE GAME TYPES ---
 * Tipe data spesifik untuk permainan petualangan.
 */

/**
 * Tipe ubin (tile) dalam peta petualangan.
 * 0: Rumput/Jalan
 * 1: Pohon/Rintangan
 * 2: Pemain
 * 3: NPC
 * 4: Tujuan/Pintu Keluar
 */
export type AdventureTileType = 0 | 1 | 2 | 3 | 4; 

/**
 * Merepresentasikan karakter non-pemain (NPC) dalam permainan petualangan.
 */
export interface NPC {
  id: number;
  row: number;
  col: number;
  name: string;
  isAnswered: boolean;
}