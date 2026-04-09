import { GoogleGenAI } from "@google/genai";
import { UserData, Question } from "../models/types";
import { CellType, AdventureTileType } from "../models/types";

// Import Fallback Data
import { getRandomMazeMap } from "../data/fallbacks/mazeMaps";
import { getRandomAdventureMap } from "../data/fallbacks/adventureMaps";
import { getFallbackMazeQuestions } from "../data/fallbacks/mazeQuestions";
import { getFallbackAdventureQuestions } from "../data/fallbacks/adventureQuestions";
import { getFallbackPracticeQuestions } from "../data/fallbacks/practiceQuestions";
import { getRandomPretestQuestions } from "../data/fallbacks/pretestQuestions";

/**
 * --- SERVICE LAYER ---
 * Mengatur komunikasi dengan Google Gemini API
 * File ini berisi fungsi-fungsi untuk menghasilkan konten dinamis menggunakan AI,
 * seperti soal latihan, peta game, dan respons chatbot.
 */

// API KEYS (Menggunakan Environment Variable)
// Mendukung VITE_GEMINI_API_KEY untuk pengembangan lokal di luar AI Studio,
// dan process.env.GEMINI_API_KEY untuk kompatibilitas di dalam AI Studio.
const getGeminiApiKey = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  return "";
};

const apiKey = getGeminiApiKey();

export const ai = new GoogleGenAI({ apiKey });
export const practiceAi = new GoogleGenAI({ apiKey });
export const mazeQAi = new GoogleGenAI({ apiKey });
export const mazeMapAi = new GoogleGenAI({ apiKey });
export const adventureQAi = new GoogleGenAI({ apiKey });
export const adventureMapAi = new GoogleGenAI({ apiKey });

// Model
export const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * HELPER: Safe Generator (Adapted for @google/genai)
 * Menjalankan request ke Gemini API dengan timeout dan penanganan error.
 * Jika gagal atau timeout, akan mengembalikan data fallback.
 * 
 * @param {GoogleGenAI} client - Instance client Gemini API.
 * @param {string} prompt - Teks prompt untuk dikirim ke model.
 * @param {any} fallbackData - Data cadangan jika request gagal.
 * @param {boolean} [isJson=true] - Apakah mengharapkan respons dalam format JSON.
 * @returns {Promise<any>} Hasil dari AI atau data fallback.
 */
async function safeGenerateContent(client: GoogleGenAI, prompt: string, fallbackData: unknown, isJson = true) {
  try {
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), 10000)); // 10s Timeout
    
    const apiCall = client.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: isJson ? { responseMimeType: "application/json" } : undefined
    });

    const response: unknown = await Promise.race([apiCall, timeoutPromise]);
    let text = (response as any).text;
    
    text = text.replace(/```json|```/g, '').trim();

    if (isJson) {
        if (!text) throw new Error("Empty response");
        return JSON.parse(text);
    }
    return text;
  } catch (error) {
    console.warn(`AI Generation Failed (${MODEL_NAME}). Using Smart Fallback. Reason:`, error);
    // Return Fallback jika AI gagal/timeout
    return fallbackData; 
  }
}

/**
 * Menghasilkan instruksi konteks kelas untuk prompt AI.
 * @param {string} grade - Kelas siswa (misal: "8").
 * @returns {string} String instruksi konteks kelas.
 */
const getGradeInstruction = (grade: string) => {
  return `KONTEKS: Siswa Kelas ${grade} SMP (Standar Kompetisi/Olimpiade & Computational Thinking).`;
};

/**
 * Menghasilkan instruksi tingkat kesulitan berdasarkan level pengguna.
 * @param {number} level - Level pengguna saat ini.
 * @returns {string} String instruksi tingkat kesulitan.
 */
const getDifficultyInstruction = (level: number) => {
  if (level <= 5) {
    return "TINGKAT KESULITAN: MENENGAH (LOGIKA DASAR).";
  } else if (level <= 15) {
    return "TINGKAT KESULITAN: SULIT (ALGORITMIK). Soal cerita yang memerlukan 'Decomposition'.";
  } else {
    return "TINGKAT KESULITAN: EXPERT (COMPUTATIONAL THINKING).";
  }
};

/**
 * GENERATOR 1: SOAL MAZE
 * Menghasilkan soal-soal matematika logika untuk game Maze menggunakan AI.
 * 
 * @param {string} grade - Kelas siswa.
 * @param {string[]} topics - Daftar topik yang sudah dipelajari.
 * @param {number} level - Level pengguna.
 * @returns {Promise<{q: string, opts: string[], ans: number}[]>} Array soal pilihan ganda.
 */
export const generateMazeQuestionsAI = async (grade: string, topics: string[], level: number): Promise<{q: string, opts: string[], ans: number}[]> => {
  // Use Smart Fallback filtered by topics
  const fallback = getFallbackMazeQuestions(topics, 10);

  const topicsList = topics.join(', ');
  const gradeInst = getGradeInstruction(grade);
  const diffInst = getDifficultyInstruction(level);
  
  const prompt = `
    Buatkan 10 soal matematika SINGKAT TAPI MEMBUTUHKAN LOGIKA (Computational Thinking) untuk game labirin.
    ${gradeInst} ${diffInst}
    Topik: [${topicsList}].
    Syarat: Maksimal 8 kata. Output JSON Array: [{ "q": "...", "opts": ["..."], "ans": 0 }]
  `;

  return safeGenerateContent(mazeQAi, prompt, fallback);
};

/**
 * GENERATOR 2: MAP MAZE
 * Menghasilkan layout peta 2D untuk game Maze menggunakan AI.
 * 
 * @returns {Promise<CellType[][]>} Array 2D yang merepresentasikan peta labirin.
 */
export const generateMazeMapAI = async (): Promise<CellType[][]> => {
  // Use Smart Fallback Map
  const fallback = getRandomMazeMap();

  const prompt = `
    Generate 2D Maze 21x35 matrix. 0=path, 1=wall, 2=door, 3=finish, 4=start.
    Rules: Start at (1,1). Finish at (19,33). At least 8 doors (value 2).
    Output valid JSON array of arrays only.
  `;
  
  // Note: We create a simpler safeGenerate wrapper here because maps are complex arrays
  try {
     const result = await mazeMapAi.models.generateContent({
         model: MODEL_NAME,
         contents: prompt,
         config: { responseMimeType: "application/json" }
     });
     const text = result.text?.replace(/```json|```/g, '').trim() || "[]";
     const map = JSON.parse(text);
     if (!Array.isArray(map) || map.length < 5) throw new Error("Invalid map");
     return map;
  } catch (e) {
     console.warn("Maze Map AI Failed, using fallback.");
     return fallback;
  }
};

/**
 * GENERATOR 3: SOAL ADVENTURE
 * Menghasilkan soal-soal matematika kontekstual (HOTS) untuk game Adventure menggunakan AI.
 * 
 * @param {string} grade - Kelas siswa.
 * @param {string[]} topics - Daftar topik yang sudah dipelajari.
 * @param {number} level - Level pengguna.
 * @returns {Promise<{q: string, opts: string[], ans: string}[]>} Array soal cerita pilihan ganda.
 */
export const generateAdventureQuestionsAI = async (grade: string, topics: string[], level: number): Promise<{q: string, opts: string[], ans: string}[]> => {
  const fallback = getFallbackAdventureQuestions(topics, 5);

  const topicsList = topics.join(', ');
  const gradeInst = getGradeInstruction(grade);
  const diffInst = getDifficultyInstruction(level);

  const prompt = `
    Buatkan 5 soal matematika KONTEKSTUAL (Soal Cerita) HOTS.
    ${gradeInst} ${diffInst}
    Materi: [${topicsList}].
    Output JSON Array: [{ "q": "...", "opts": ["..."], "ans": "string_jawaban_benar" }]
  `;

  return safeGenerateContent(adventureQAi, prompt, fallback);
};

/**
 * GENERATOR 4: MAP ADVENTURE
 * Menghasilkan layout peta ASCII untuk game Adventure menggunakan AI.
 * 
 * @returns {Promise<string[]>} Array string yang merepresentasikan peta petualangan.
 */
export const generateAdventureMapAI = async (): Promise<string[]> => {
  const fallback = getRandomAdventureMap();

  const prompt = `
    Generate ASCII map 40 rows x 60 cols. '#' is wall, '.' is floor.
    Create a school layout with rooms and corridors.
    Output JSON Array of strings.
  `;

  try {
     const result = await adventureMapAi.models.generateContent({
         model: MODEL_NAME,
         contents: prompt,
         config: { responseMimeType: "application/json" }
     });
     const text = result.text?.replace(/```json|```/g, '').trim() || "[]";
     const map = JSON.parse(text);
     if (!Array.isArray(map) || map.length < 10) throw new Error("Invalid map");
     return map;
  } catch (e) {
     console.warn("Adventure Map AI Failed, using fallback.");
     return fallback;
  }
};

/**
 * GENERATOR 5: PRACTICE QUESTIONS
 * Menghasilkan soal latihan pilihan ganda tipe HOTS menggunakan AI.
 * 
 * @param {string[]} topics - Daftar topik materi.
 * @param {string} grade - Kelas siswa.
 * @param {number} level - Level pengguna.
 * @returns {Promise<Question[]>} Array soal latihan.
 */
export const generatePracticeQuestions = async (topics: string[], grade: string, level: number): Promise<Question[]> => {
    const fallback = getFallbackPracticeQuestions(topics, 5);

    const topicsList = topics.join(', ');
    const gradeInst = getGradeInstruction(grade);
    
    const prompt = `
      Buatkan 5 soal matematika PILIHAN GANDA TIPE HOTS.
      ${gradeInst}
      TOPIK: [${topicsList}].
      Output JSON Array: [{"id": "...", "type": "multiple-choice", "question": "...", "options": ["...",...], "correctAnswer": "...", "explanation": "..."}]
    `;

    return safeGenerateContent(practiceAi, prompt, fallback);
};

/**
 * GENERATOR 7: PRETEST (ASESMEN AWAL)
 * Menghasilkan soal pretest untuk asesmen awal kemampuan siswa menggunakan AI.
 * 
 * @param {string} grade - Kelas siswa.
 * @returns {Promise<(Question & { difficulty: string })[]>} Array soal pretest dengan tingkat kesulitan.
 */
export const generatePretestQuestions = async (grade: string): Promise<(Question & { difficulty: string })[]> => {
    // Fallback khusus pretest (random 10 questions)
    const fallback = getRandomPretestQuestions(10);

    const gradeInst = getGradeInstruction(grade);
    
    const prompt = `
      Buatkan 10 soal Pretest Matematika SMP untuk Asesmen Awal.
      Tingkat Kesulitan: Campuran (3 Mudah, 4 Sedang, 3 Sulit/HOTS).
      ${gradeInst}
      TOPIK: Geometri Bangun Datar, Bangun Ruang, Bilangan, Aljabar Dasar.
      
      Output JSON Array: [{
        "id": "pt-ai-...", 
        "difficulty": "easy" | "medium" | "hard",
        "type": "multiple-choice", 
        "question": "...", 
        "options": ["..."], 
        "correctAnswer": "...", 
        "explanation": "..."
      }]
    `;

    // Menggunakan practiceAi karena API Key sama (Zona Latihan)
    return safeGenerateContent(practiceAi, prompt, fallback);
};

/**
 * Menghasilkan instruksi sistem (system prompt) untuk chatbot Logi.
 * 
 * @param {UserData} user - Data pengguna saat ini.
 * @returns {string} String instruksi sistem untuk AI.
 */
export const getSystemInstruction = (user: UserData) => {
  const grade = user.grade || '8';
  const name = user.username || 'Sobat';
  return `Kamu adalah Logi, Tutor Matematika untuk ${name} kelas ${grade}. Gunakan LaTeX untuk rumus. Jawab singkat dan seru.`;
};