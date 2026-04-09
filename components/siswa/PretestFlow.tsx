import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { generatePretestQuestions } from '../../services/gemini';
import { MANUAL_PRETEST_QUESTIONS } from '../../data/manual_questions/pretest';
import { Question } from '../../models/types';
import { Button } from '../shared/Button';
import { Loader2, CheckCircle, XCircle, BrainCircuit, ArrowRight, Play } from 'lucide-react';
import { useAppContext } from '../../lib/AppContext';

interface PretestFlowProps {
  grade: string;
  onComplete: () => void;
}

/**
 * Komponen alur pretest (tes awal) untuk siswa baru.
 * Menghasilkan soal adaptif menggunakan AI untuk menentukan level awal siswa.
 * 
 * @param {PretestFlowProps} props - Properti komponen PretestFlow.
 * @param {string} props.grade - Kelas siswa (misal: "7", "8", "9").
 * @param {() => void} props.onComplete - Callback yang dipanggil saat pretest selesai.
 * @returns {JSX.Element} Elemen antarmuka alur pretest.
 */
export const PretestFlow: React.FC<PretestFlowProps> = ({ grade, onComplete }) => {
  const { userData, setUserData } = useAppContext();
  const [step, setStep] = useState<'intro' | 'loading' | 'quiz' | 'result'>('intro');
  const [questions, setQuestions] = useState<(Question & { difficulty: string })[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [score, setScore] = useState(0);
  
  /**
   * Mengambil soal pretest dari input manual
   * dan mengubah state ke mode kuis.
   */
  const loadQuestions = async () => {
    setStep('loading');
    // Menggunakan soal manual
    setQuestions(MANUAL_PRETEST_QUESTIONS);
    setStep('quiz');
  };

  /**
   * Memeriksa jawaban yang dipilih pengguna terhadap jawaban yang benar.
   * Memberikan feedback dan menghitung skor berdasarkan tingkat kesulitan soal.
   */
  const checkAnswer = () => {
    if (!selectedOption) return;
    const currentQ = questions[currentIdx];
    const isCorrect = selectedOption === currentQ.correctAnswer;
    
    setFeedbackState(isCorrect ? 'correct' : 'incorrect');
    
    // Scoring sederhana: Easy=1, Medium=2, Hard=3
    if (isCorrect) {
        let points = 1;
        if (currentQ.difficulty === 'medium') points = 2;
        if (currentQ.difficulty === 'hard') points = 3;
        setScore(prev => prev + points);
    }
  };

  /**
   * Melanjutkan ke pertanyaan berikutnya atau menyelesaikan pretest
   * jika sudah mencapai pertanyaan terakhir.
   */
  const nextQuestion = () => {
    setFeedbackState('none');
    setSelectedOption(null);
    if (currentIdx < questions.length - 1) {
        setCurrentIdx(prev => prev + 1);
    } else {
        finishPretest();
    }
  };

  /**
   * Menyelesaikan pretest, menghitung level awal dan EXP berdasarkan skor,
   * lalu menyimpan hasilnya ke database dan memperbarui context pengguna.
   */
  const finishPretest = async () => {
      setStep('result');
      
      // Hitung Level Awal berdasarkan Score
      // Max Score estimasi: ~20 poin. 
      // Score > 15 -> Level 5
      // Score > 10 -> Level 3
      // Score < 10 -> Level 1
      let startLevel = 1;
      let startExp = 0;
      
      if (score >= 15) { startLevel = 5; startExp = 1200; }
      else if (score >= 10) { startLevel = 3; startExp = 500; }
      else if (score >= 5) { startLevel = 2; startExp = 100; }

      // Update Database
      if (userData) {
          await supabase.from('users_data').update({
              has_completed_pretest: true,
              level: startLevel,
              exp: startExp
          }).eq('id', userData.id);
          
          await supabase.from('activity_logs').insert({
              user_id: userData.id,
              username: userData.username,
              action_type: 'pretest_complete',
              details: `Menyelesaikan Pretest (Skor ${score}). Mulai di Level ${startLevel}.`
          });

          // Update Local Context
          setUserData({ ...userData, has_completed_pretest: true, level: startLevel, exp: startExp });
      }
  };

  // --- RENDERERS ---

  if (step === 'intro') {
      return (
          <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
              <div className="w-32 h-32 bg-feather-light/20 rounded-full flex items-center justify-center mb-8 text-feather animate-bounce-slow">
                  <BrainCircuit size={64} />
              </div>
              <h1 className="text-4xl font-extrabold text-slate-800 mb-4">Tes Kemampuan Awal</h1>
              <p className="text-slate-500 font-bold text-lg max-w-md mb-8">
                  Jawab beberapa pertanyaan singkat agar Logi bisa menyesuaikan materi dengan levelmu!
              </p>
              <Button onClick={loadQuestions} size="lg" className="w-full max-w-sm" icon={<Play size={24}/>}>
                  MULAI TES
              </Button>
          </div>
      );
  }

  if (step === 'loading') {
      return (
          <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-macaw mb-4" size={48} />
              <h2 className="text-xl font-bold text-slate-700">Menyiapkan Soal Adaptif...</h2>
          </div>
      );
  }

  if (step === 'quiz') {
      const q = questions[currentIdx];
      const progress = ((currentIdx + 1) / questions.length) * 100;

      return (
          <div className="fixed inset-0 z-[200] bg-white flex flex-col">
              {/* Header Progress */}
              <div className="p-6">
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-feather transition-all duration-500" style={{ width: `${progress}%` }}></div>
                  </div>
              </div>

              {/* Soal */}
              <div className="flex-1 overflow-y-auto px-6 pb-32">
                  <div className="max-w-2xl mx-auto mt-4">
                      <h2 className="text-2xl font-bold text-slate-700 mb-8 leading-relaxed">
                          {q.question}
                      </h2>
                      <div className="space-y-3">
                          {q.options?.map((opt, i) => (
                              <button 
                                key={i}
                                onClick={() => !feedbackState.includes('rect') && setSelectedOption(opt)}
                                disabled={feedbackState !== 'none'}
                                className={`w-full p-4 rounded-2xl border-2 border-b-4 text-left font-bold text-lg transition-all 
                                    ${selectedOption === opt 
                                        ? 'border-macaw bg-macaw-light/20 text-macaw-dark' 
                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}
                                    ${feedbackState !== 'none' && opt === q.correctAnswer ? '!bg-green-100 !border-green-500 !text-green-700' : ''}
                                    ${feedbackState === 'incorrect' && selectedOption === opt ? '!bg-red-100 !border-red-500 !text-red-700' : ''}
                                `}
                              >
                                  <div className="flex items-center gap-4">
                                      <div className="w-8 h-8 border-2 rounded-lg flex items-center justify-center text-sm opacity-50 border-current">
                                          {String.fromCharCode(65+i)}
                                      </div>
                                      {opt}
                                  </div>
                              </button>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Footer Feedback */}
              <div className={`fixed bottom-0 left-0 right-0 p-6 border-t-2 transition-colors duration-300 ${feedbackState === 'correct' ? 'bg-green-100 border-green-200' : feedbackState === 'incorrect' ? 'bg-red-100 border-red-200' : 'bg-white border-slate-100'}`}>
                  <div className="max-w-2xl mx-auto flex justify-between items-center">
                      {feedbackState === 'none' ? (
                          <Button onClick={checkAnswer} disabled={!selectedOption} size="lg" className="w-full">PERIKSA</Button>
                      ) : (
                          <div className="w-full flex items-center justify-between animate-in slide-in-from-bottom-2">
                              <div className="flex items-center gap-4">
                                  {feedbackState === 'correct' 
                                    ? <div className="bg-white p-2 rounded-full text-green-500"><CheckCircle size={32}/></div> 
                                    : <div className="bg-white p-2 rounded-full text-red-500"><XCircle size={32}/></div>
                                  }
                                  <div>
                                      <h3 className={`font-black text-xl ${feedbackState === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
                                          {feedbackState === 'correct' ? 'Kerja Bagus!' : 'Jawaban Benar:'}
                                      </h3>
                                      {feedbackState === 'incorrect' && (
                                          <p className="text-red-600 font-bold">{q.correctAnswer}</p>
                                      )}
                                  </div>
                              </div>
                              <Button onClick={nextQuestion} variant={feedbackState === 'correct' ? 'primary' : 'danger'} size="lg">
                                  LANJUT <ArrowRight className="ml-2" size={20} />
                              </Button>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  }

  // Result
  return (
      <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-6 text-center animate-in zoom-in">
          <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mb-6 text-yellow-500 animate-bounce">
              <CheckCircle size={64} />
          </div>
          <h1 className="text-4xl font-black text-slate-800 mb-2">Tes Selesai!</h1>
          <p className="text-slate-500 font-bold text-lg mb-8">
              Berdasarkan hasil tes, Logi merekomendasikan kamu mulai di...
          </p>
          <div className="bg-slate-50 border-4 border-slate-100 p-8 rounded-3xl mb-8">
              <span className="text-slate-400 font-bold uppercase text-sm tracking-widest">Starting Level</span>
              <div className="text-6xl font-black text-feather mt-2">{score >= 10 ? (score >= 15 ? 5 : 3) : 1}</div>
          </div>
          <Button onClick={onComplete} size="lg" className="w-full max-w-sm bg-feather border-feather-dark">
              MASUK DASHBOARD
          </Button>
      </div>
  );
};