import { useState, useEffect, useCallback } from 'react';
import { UserData, Question } from '../models/types';
import { generatePracticeQuestions } from '../services/gemini';
import { getCompletedTopics } from '../data/curriculum';
import { supabase } from '../services/supabase';
import { getLevelFromXP } from '../lib/levelSystem';

/**
 * --- CONTROLLER LAYER ---
 * Mengatur Logika Bisnis Zona Latihan
 */

/**
 * Hook kustom untuk mengelola logika bisnis Zona Latihan (Practice Zone).
 * Menangani alur latihan soal, pembuatan soal via AI, penilaian, dan pembaruan progres pengguna.
 * 
 * @param {UserData} userData - Data pengguna yang sedang login.
 * @param {() => void} onBack - Callback untuk kembali ke menu sebelumnya.
 * @returns {Object} Objek yang berisi state dan fungsi untuk mengontrol antarmuka Zona Latihan.
 */
export const usePractice = (userData: UserData, onBack: () => void) => {
  const [gameState, setGameState] = useState<'intro' | 'loading' | 'playing' | 'summary'>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [results, setResults] = useState<{isCorrect: boolean, correctAnswer: string}[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  
  // Start Session
  const startSession = async () => {
    setGameState('loading');
    
    // 1. Ambil topik berdasarkan progress user
    const topics = getCompletedTopics(userData.completed_lessons);
    
    // 2. Generate Soal via Gemini Service (Adaptif berdasarkan topik DAN Level)
    const generatedQuestions = await generatePracticeQuestions(topics, userData.grade || '8', userData.level || 1);
    
    setQuestions(generatedQuestions);
    setScore(0);
    setCorrectCount(0);
    setCurrentIdx(0);
    setResults([]);
    setGameState('playing');
  };

  // Submit Answer
  const handleCheck = () => {
    if (!selectedOption) return;
    
    const currentQ = questions[currentIdx];
    const isCorrect = selectedOption === currentQ.correctAnswer;
    
    // Scoring Logic: 50 points per correct answer
    if (isCorrect) {
      setScore(prev => prev + 50);
      setCorrectCount(prev => prev + 1);
    }

    setResults(prev => [...prev, { isCorrect, correctAnswer: currentQ.correctAnswer }]);
    setIsChecked(true);
  };

  // Next Question
  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsChecked(false);
    } else {
      finishSession();
    }
  };

  // Finish Logic
  const finishSession = async () => {
    let finalScore = score;
    // Bonus Logic: +50 if all correct
    if (correctCount === questions.length && questions.length > 0) {
        finalScore += 50;
    }

    setScore(finalScore);
    setGameState('summary');

    // DB Update
    try {
        const { data: currentUser } = await supabase.from('users_data').select('exp, level').eq('id', userData.id).single();
        if (currentUser) {
            const newExp = currentUser.exp + finalScore;
            const newLevel = getLevelFromXP(newExp);
            
            await supabase.from('users_data').update({ exp: newExp, level: newLevel }).eq('id', userData.id);
            await supabase.from('activity_logs').insert({ 
                user_id: userData.id, 
                username: userData.username, 
                action_type: 'lesson_complete', 
                details: `Latihan Soal: +${finalScore} XP` 
            });

            if (newLevel > currentUser.level) {
                 await supabase.from('activity_logs').insert({ 
                    user_id: userData.id, 
                    username: userData.username, 
                    action_type: 'level_up', 
                    details: `Naik ke Level ${newLevel}` 
                });
            }
        }
    } catch (err) {
        console.error("Gagal menyimpan progress latihan:", err);
    }
  };

  return {
    gameState,
    questions,
    currentIdx,
    score,
    correctCount,
    selectedOption,
    isChecked,
    results,
    setSelectedOption,
    startSession,
    handleCheck,
    handleNext,
    onBack
  };
};