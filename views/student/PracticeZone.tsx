import React, { useEffect, useRef } from 'react';
import { UserData } from '../../models/types';
import { usePractice } from '../../controllers/usePractice';
import { Button } from '../../components/shared/Button';
import { BrainCircuit, Play, CheckCircle, XCircle, ChevronRight, ArrowLeft, Trophy, Star } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface PracticeZoneProps {
  userData: UserData;
  onBack: () => void;
}

export const PracticeZone: React.FC<PracticeZoneProps> = ({ userData, onBack }) => {
  // Gunakan Controller
  const {
    gameState,
    questions,
    currentIdx,
    score,
    correctCount,
    selectedOption,
    isChecked,
    setSelectedOption,
    startSession,
    handleCheck,
    handleNext
  } = usePractice(userData, onBack);

  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-render KaTeX saat soal berubah
  useEffect(() => {
    if ((gameState === 'playing' || isChecked) && contentRef.current) {
        // @ts-ignore
        if (window.renderMathInElement) {
            try {
                // @ts-ignore
                window.renderMathInElement(contentRef.current, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false}
                    ],
                    throwOnError: false
                });
            } catch (e) { console.warn("KaTeX render error", e); }
        }
    }
  }, [currentIdx, gameState, isChecked, selectedOption]);

  // --- RENDER STATES ---

  if (gameState === 'intro') {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border-4 border-cardinal-light/30 p-8 text-center animate-in zoom-in-95">
          <div className="w-24 h-24 bg-cardinal-light/20 rounded-full flex items-center justify-center mx-auto mb-6 text-cardinal">
            <BrainCircuit size={48} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-700 mb-2">Zona Latihan</h1>
          <p className="text-slate-500 font-medium mb-8 text-lg">
            Asah kemampuanmu dengan soal-soal adaptif yang disesuaikan dengan materi yang sudah kamu pelajari.
          </p>
          
          <div className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-100 text-left space-y-4 mb-8">
             <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg text-green-600"><CheckCircle size={20}/></div>
                <span className="font-bold text-slate-600">5 Soal per Sesi</span>
             </div>
             <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Star size={20}/></div>
                <span className="font-bold text-slate-600">+50 XP setiap jawaban benar</span>
             </div>
             <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600"><Trophy size={20}/></div>
                <span className="font-bold text-slate-600">Bonus +50 XP jika Benar Semua (Perfect)</span>
             </div>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={onBack} size="lg" className="flex-1">Kembali</Button>
            <Button onClick={startSession} variant="danger" size="lg" icon={<Play size={24}/>} className="flex-[2] shadow-cardinal-light shadow-lg">MULAI LATIHAN</Button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-cardinal mb-4" size={48} />
        <h2 className="text-xl font-extrabold text-slate-700">Menyiapkan Soal...</h2>
        <p className="text-slate-400 font-bold text-sm">Logi sedang meracik soal khusus untukmu</p>
      </div>
    );
  }

  if (gameState === 'summary') {
    const isPerfect = correctCount === 5;
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border-b-8 border-cardinal-dark p-8 text-center animate-in zoom-in">
           {isPerfect ? (
               <div className="inline-block p-4 rounded-full bg-yellow-100 text-yellow-500 mb-6 animate-bounce">
                   <Trophy size={64} fill="currentColor" />
               </div>
           ) : (
               <div className="inline-block p-4 rounded-full bg-slate-100 text-slate-400 mb-6">
                   <Star size={64} fill="currentColor" />
               </div>
           )}
           
           <h2 className="text-3xl font-black text-slate-800 mb-1">{isPerfect ? 'LUAR BIASA!' : 'Latihan Selesai!'}</h2>
           <p className="text-slate-500 font-bold mb-6">Kamu menjawab {correctCount} dari {questions.length} soal dengan benar.</p>
           
           <div className="bg-cardinal-light/10 border-2 border-cardinal rounded-2xl p-6 mb-8">
               <div className="text-sm font-bold text-cardinal uppercase tracking-widest mb-1">Total XP Diperoleh</div>
               <div className="text-5xl font-black text-cardinal-dark">+{score} XP</div>
               {isPerfect && <div className="text-xs font-bold text-yellow-600 mt-2 bg-yellow-100 inline-block px-2 py-1 rounded">TERMASUK BONUS PERFECT +50</div>}
           </div>

           <Button onClick={onBack} className="w-full" size="lg" variant="primary">KEMBALI KE DASHBOARD</Button>
        </div>
      </div>
    );
  }

  // PLAYING STATE
  const currentQ = questions[currentIdx];
  const progress = ((currentIdx) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" ref={contentRef}>
        {/* Header */}
        <div className="bg-white border-b-2 border-slate-200 p-4 sticky top-0 z-10">
            <div className="max-w-4xl mx-auto flex items-center gap-4">
                <button onClick={onBack} className="text-slate-400 hover:text-slate-600"><ArrowLeft size={24}/></button>
                <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-cardinal transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="font-black text-cardinal text-lg">{score} XP</div>
            </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 md:p-10 mb-6 shadow-sm min-h-[200px] flex items-center justify-center">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-700 text-center leading-relaxed">
                        {currentQ.question}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQ.options?.map((opt, idx) => {
                        const isSelected = selectedOption === opt;
                        const isCorrectAnswer = opt === currentQ.correctAnswer;
                        
                        let buttonStyle = "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"; // Default
                        if (isChecked) {
                            if (isCorrectAnswer) buttonStyle = "bg-green-100 border-green-500 text-green-800";
                            else if (isSelected && !isCorrectAnswer) buttonStyle = "bg-red-100 border-red-500 text-red-800 opacity-50";
                            else buttonStyle = "bg-slate-50 border-slate-100 text-slate-400";
                        } else if (isSelected) {
                            buttonStyle = "bg-cardinal-light/20 border-cardinal text-cardinal-dark";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => !isChecked && setSelectedOption(opt)}
                                disabled={isChecked}
                                className={`p-4 rounded-2xl border-b-4 border-2 text-lg font-bold text-left transition-all active:scale-[0.98] ${buttonStyle}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg border-2 border-current flex items-center justify-center text-sm opacity-70">
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span>{opt}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Bottom Action Bar */}
        <div className={`p-4 border-t-2 transition-colors duration-300 ${isChecked ? (selectedOption === currentQ.correctAnswer ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200') : 'bg-white border-slate-200'}`}>
            <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                {isChecked ? (
                    <div className="flex items-start gap-4 animate-in slide-in-from-bottom-2">
                        {selectedOption === currentQ.correctAnswer 
                            ? <div className="bg-green-500 text-white p-2 rounded-full"><CheckCircle size={32}/></div>
                            : <div className="bg-red-500 text-white p-2 rounded-full"><XCircle size={32}/></div>
                        }
                        <div>
                            <h3 className={`font-black text-xl ${selectedOption === currentQ.correctAnswer ? 'text-green-700' : 'text-red-700'}`}>
                                {selectedOption === currentQ.correctAnswer ? 'Benar Sekali!' : 'Kurang Tepat'}
                            </h3>
                            <div className="text-slate-600 text-sm font-bold mt-1">
                                <span className="uppercase text-xs opacity-70 block mb-1">Pembahasan:</span>
                                {currentQ.explanation}
                            </div>
                        </div>
                    </div>
                ) : <div className="hidden md:block"></div>}
                
                <Button 
                    onClick={isChecked ? handleNext : handleCheck} 
                    disabled={!selectedOption} 
                    size="lg" 
                    className={`w-full md:w-auto min-w-[200px] ${isChecked ? (selectedOption === currentQ.correctAnswer ? 'bg-green-500 border-green-700' : 'bg-red-500 border-red-700') : 'bg-cardinal border-cardinal-dark'}`}
                    variant={isChecked ? 'primary' : 'danger'} // Hack to force styles via className
                >
                    {isChecked ? (currentIdx === questions.length - 1 ? 'LIHAT HASIL' : 'LANJUT') : 'PERIKSA JAWABAN'}
                </Button>
            </div>
        </div>
    </div>
  );
};