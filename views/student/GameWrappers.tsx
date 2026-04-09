import React, { useState } from 'react';
import { MazeGame } from '../../components/siswa/MazeGame'; 
import { AdventureGame } from '../../components/siswa/AdventureGame'; 
import { GameIntro } from '../../components/shared/GameIntro';
import { LessonView } from '../../components/siswa/LessonView';
import { UnitPath } from '../../components/siswa/UnitPath';
import { PosttestFlow } from '../../components/siswa/PosttestFlow';
import { CURRICULUM_DATA } from '../../data/curriculum';
import { useAppContext } from '../../lib/AppContext';
import { getLevelFromXP } from '../../lib/levelSystem';
import { supabase } from '../../services/supabase';
import { Lesson, UserData } from '../../models/types';

// --- VIEW LAYER (Sub-Components) ---
// Komponen wrapper untuk merapikan App.tsx

export const MazeWrapper = ({ userData, onBack }: { userData: UserData, onBack: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<'solo' | 'coop' | 'duel'>('solo');

  if (isPlaying) {
    return <MazeGame userData={userData} mode={mode} onExit={() => setIsPlaying(false)} />;
  }
  return (
    <GameIntro 
      type="maze" 
      title="Labirin Logika" 
      description="Navigasikan karaktermu melewati lorong labirin yang penuh teka-teki." 
      rules={[
        "Gunakan tombol panah / joystick untuk bergerak.",
        "Cari Kunci untuk membuka gerbang pertanyaan.",
        "Jawab soal matematika dengan benar untuk lanjut.",
        "Hati-hati, jawaban salah akan mengurangi Nyawa.",
        "Temukan Bendera Finish untuk memenangkan permainan!"
      ]} 
      onBack={onBack} 
      onStart={(m) => { setMode(m); setIsPlaying(true); }} 
    />
  );
};

export const AdventureWrapper = ({ userData, onBack }: { userData: UserData, onBack: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<'solo' | 'coop' | 'duel'>('solo');

  if (isPlaying) {
    return <AdventureGame userData={userData} mode={mode} onExit={() => setIsPlaying(false)} />;
  }
  return (
    <GameIntro 
      type="adventure" 
      title="Jelajah Sekolah" 
      description="Eksplorasi gedung sekolah, cari guru (NPC), dan kumpulkan poin sebanyak mungkin!" 
      rules={[
        "Jelajahi area sekolah secara bebas (Open World).",
        "Cari Guru (NPC) yang tersebar di peta.",
        "Dekati mereka dan tekan tombol 'Jawab Soal'.",
        "Kumpulkan Poin XP sebanyak mungkin dalam waktu 3 Menit.",
        "Mode Kelompok: Skor tim akan digabungkan!"
      ]} 
      onBack={onBack} 
      onStart={(m) => { setMode(m); setIsPlaying(true); }} 
    />
  );
};

export const LearnWrapper = ({ userData }: { userData: UserData }) => {
    const { session, setUserData, showToast } = useAppContext();
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [showPosttest, setShowPosttest] = useState(false);

    const handleStartLesson = (lesson: Lesson) => setCurrentLesson(lesson);

    const handleLessonComplete = async (score: number) => {
        if (!currentLesson || !userData || !session) return;
        
        // Logic: Only complete if score >= 80
        if (score < 80) {
            showToast(`Skor kamu ${score}. Minimal 80 untuk lulus. Coba lagi!`, 'error');
            return;
        }

        const xpEarned = currentLesson.xpReward;
        const isFirstTime = !userData.completed_lessons.includes(currentLesson.id);
        const newCompleted = isFirstTime ? [...userData.completed_lessons, currentLesson.id] : userData.completed_lessons;
        const newExp = isFirstTime ? userData.exp + xpEarned : userData.exp; // XP only for first time
        const newLevel = getLevelFromXP(newExp);
        const isLevelUp = newLevel > userData.level;

        // Optimistic Update
        setUserData({ ...userData, exp: newExp, level: newLevel, completed_lessons: newCompleted });

        // Database Update
        await supabase.from('users_data').update({ exp: newExp, level: newLevel, completed_lessons: newCompleted }).eq('id', session.user.id);
        
        if (isFirstTime) {
            await supabase.from('activity_logs').insert({ user_id: userData.id, username: userData.username, action_type: 'lesson_complete', details: `Menyelesaikan ${currentLesson.title}` });
            showToast(`Selamat! Materi Selesai. +${xpEarned} XP`, 'success');
        } else {
            showToast(`Latihan Selesai! Skor: ${score}`, 'success');
        }

        if (isLevelUp) {
            await supabase.from('activity_logs').insert({ user_id: userData.id, username: userData.username, action_type: 'level_up', details: `Naik ke Level ${newLevel}` });
            showToast(`LEVEL UP! Kamu naik ke level ${newLevel}`, 'info');
        }
        
        setCurrentLesson(null);
    };

    if (currentLesson) {
        return <LessonView lesson={currentLesson} onComplete={handleLessonComplete} onExit={() => setCurrentLesson(null)} />;
    }

    if (showPosttest) {
        return <PosttestFlow onComplete={() => setShowPosttest(false)} onClose={() => setShowPosttest(false)} />;
    }

    return <UnitPath units={CURRICULUM_DATA} completedLessonIds={userData.completed_lessons} onStartLesson={handleStartLesson} onStartPosttest={() => setShowPosttest(true)} />;
};