import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { MANUAL_POSTTEST_QUESTIONS } from '../../data/manual_questions/posttest';
import { Question } from '../../models/types';
import { Button } from '../shared/Button';
import { Loader2, CheckCircle, XCircle, Trophy, ArrowRight, Play } from 'lucide-react';
import { useAppContext } from '../../lib/AppContext';

interface PosttestFlowProps {
  onComplete: () => void;
  onClose: () => void;
}

/**
 * Komponen alur post-test (ujian akhir) untuk siswa.
 * Menampilkan soal-soal akhir untuk mengukur pemahaman siswa setelah menyelesaikan semua materi.
 */
export const PosttestFlow: React.FC<PosttestFlowProps> = ({ onComplete, onClose }) => {
  const { userData, setUserData } = useAppContext();
  const [step, setStep] = useState<'intro' | 'loading' | 'quiz' | 'result'>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [score, setScore] = useState(0);
  
  const loadQuestions = async () => {
    setStep('loading');
    setQuestions(MANUAL_POSTTEST_QUESTIONS);
    setStep('quiz');
  };

  const checkAnswer = () => {
    if (!selectedOption) return;
    const currentQ = questions[currentIdx];
    const isCorrect = selectedOption === currentQ.correctAnswer;
    
    setFeedbackState(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
        // Simple scoring: 10 points per correct answer
        setScore(prev => prev + 10);
    }
  };

  const nextQuestion = () => {
    setFeedbackState('none');
    setSelectedOption(null);
    if (currentIdx < questions.length - 1) {
        setCurrentIdx(prev => prev + 1);
    } else {
        finishPosttest();
    }
  };

  const finishPosttest = async () => {
      setStep('result');
      
      const finalScore = score + (feedbackState === 'correct' ? 10 : 0); // Account for last question if not already added in checkAnswer (it is added, so we just use score)
      // Wait, checkAnswer updates score immediately, but state might not be reflected if we use it here.
      // Actually, score is updated in checkAnswer, so it's fine.
      
      // Update Database
      if (userData) {
          await supabase.from('users_data').update({
              has_completed_posttest: true,
              posttest_score: score
          }).eq('id', userData.id);
          
          await supabase.from('activity_logs').insert({
              user_id: userData.id,
              username: userData.username,
              action_type: 'posttest_complete',
              details: `Menyelesaikan Post-test (Skor ${score}).`
          });

          // Update Local Context
          setUserData({ ...userData, has_completed_posttest: true, posttest_score: score });
      }
  };

  if (step === 'intro') {
      return (
          <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
              <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-2 bg-slate-100 rounded-full transition-colors">
                  <XCircle size={32} />
              </button>
              <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mb-8 text-yellow-500 animate-bounce-slow">
                  <Trophy size={64} />
              </div>
              <h1 className="text-4xl font-extrabold text-slate-800 mb-4">Ujian Akhir (Post-test)</h1>
              <p className="text-slate-500 font-bold text-lg max-w-md mb-8">
                  Selamat! Kamu telah menyelesaikan semua materi. Sekarang saatnya menguji pemahamanmu secara keseluruhan.
              </p>
              <Button onClick={loadQuestions} size="lg" className="w-full max-w-sm bg-yellow-500 hover:bg-yellow-600 border-yellow-600 text-white" icon={<Play size={24}/>}>
                  MULAI UJIAN
              </Button>
          </div>
      );
  }

  if (step === 'loading') {
      return (
          <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-yellow-500 mb-4" size={48} />
              <h2 className="text-xl font-bold text-slate-700">Menyiapkan Soal Ujian...</h2>
          </div>
      );
  }

  if (step === 'quiz') {
      const q = questions[currentIdx];
      const progress = ((currentIdx + 1) / questions.length) * 100;

      return (
          <div className="fixed inset-0 z-[200] bg-white flex flex-col">
              {/* Header Progress */}
              <div className="p-6 flex items-center gap-4">
                  <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                      <XCircle size={28} />
                  </button>
                  <div className="h-4 flex-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
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
                                        ? 'border-yellow-500 bg-yellow-50 text-yellow-700' 
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
                          <Button onClick={checkAnswer} disabled={!selectedOption} size="lg" className="w-full bg-yellow-500 hover:bg-yellow-600 border-yellow-600 text-white">PERIKSA</Button>
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
              <Trophy size={64} />
          </div>
          <h1 className="text-4xl font-black text-slate-800 mb-2">Ujian Selesai!</h1>
          <p className="text-slate-500 font-bold text-lg mb-8">
              Luar biasa! Kamu telah menyelesaikan seluruh rangkaian pembelajaran.
          </p>
          <div className="bg-slate-50 border-4 border-slate-100 p-8 rounded-3xl mb-8">
              <span className="text-slate-400 font-bold uppercase text-sm tracking-widest">Skor Akhir</span>
              <div className="text-6xl font-black text-yellow-500 mt-2">{score}</div>
          </div>
          <Button onClick={onComplete} size="lg" className="w-full max-w-sm bg-yellow-500 hover:bg-yellow-600 border-yellow-600 text-white">
              KEMBALI KE DASHBOARD
          </Button>
      </div>
  );
};
