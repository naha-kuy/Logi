import React, { useState, useEffect, useRef } from 'react';
import { Lesson } from '../../types'; 
import { X, CheckCircle, XCircle, Construction, ArrowLeft, BookOpen, ChevronRight, PlayCircle, RotateCcw, Trophy, Star, HelpCircle, Send } from 'lucide-react'; 
import { Button } from '../shared/Button';
import { Skeleton } from '../shared/Skeleton';
import { getMaterial, MaterialContent, LessonSection } from '../../data/materials/index';
import { CubeConstruction } from '../shared/CubeConstruction';
import { ShapeGallery } from '../shared/ShapeGallery';
import { VolumeLab } from '../shared/VolumeLab';
import { LogicPlayground } from '../shared/LogicPlayground';

interface LessonViewProps {
  lesson: Lesson;
  onComplete: (score: number) => void;
  onExit: () => void;
}

/**
 * Komponen utama untuk menampilkan materi pelajaran dan kuis latihan.
 * Mendukung berbagai jenis konten: teks, demo 3D, pertanyaan interaktif (inquiry), dan kuis pilihan ganda.
 * 
 * @param {LessonViewProps} props - Properti komponen LessonView.
 * @param {Lesson} props.lesson - Data pelajaran yang akan ditampilkan.
 * @param {(score: number) => void} props.onComplete - Callback yang dipanggil saat pelajaran/kuis selesai, mengirimkan skor akhir.
 * @param {() => void} props.onExit - Callback untuk keluar dari tampilan pelajaran.
 * @returns {JSX.Element} Elemen tampilan pelajaran.
 */
export const LessonView: React.FC<LessonViewProps> = ({ lesson, onComplete, onExit }) => {
  const [material, setMaterial] = useState<MaterialContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'reading' | 'quiz' | 'result'>('reading');
  
  // Inquiry State
  const [visibleSectionIndex, setVisibleSectionIndex] = useState(0);
  const [inquiryAnswers, setInquiryAnswers] = useState<Record<string, string>>({});
  const [inquiryFeedback, setInquiryFeedback] = useState<Record<string, 'correct' | 'incorrect' | null>>({});
  const [sectionOptions, setSectionOptions] = useState<Record<string, string[]>>({});

  // Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  
  const contentRef = useRef<HTMLDivElement>(null);

  /**
   * Mengacak urutan elemen dalam array (Fisher-Yates shuffle).
   * Digunakan untuk mengacak opsi jawaban pada soal pilihan ganda.
   * @param array Array yang akan diacak.
   * @returns Array baru dengan urutan elemen yang sudah diacak.
   */
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const positiveFeedbacks = ['Mantap!', 'Luar biasa!', 'Kamu benar!', 'Hebat!', 'Tepat sekali!'];

  useEffect(() => {
    let isMounted = true;
    const fetchContent = async () => {
        setLoading(true);
        const data = await getMaterial(lesson.id);
        if (isMounted) {
            setMaterial(data);
            setLoading(false);
            resetQuiz();
            
            // Shuffle section options
            if (data?.sections) {
                const newSectionOptions: Record<string, string[]> = {};
                data.sections.forEach(s => {
                    if (s.type === 'multiple-choice' && s.options) {
                        newSectionOptions[s.id] = shuffleArray(s.options);
                    }
                });
                setSectionOptions(newSectionOptions);
            }

            // Initialize visible sections: show until first inquiry or all if none
            if (data?.sections) {
                let firstInquiry = data.sections.findIndex(s => s.type === 'inquiry-input' || s.type === 'multiple-choice');
                setVisibleSectionIndex(firstInquiry === -1 ? data.sections.length - 1 : firstInquiry);
            }
        }
    };
    fetchContent();
    return () => { isMounted = false; };
  }, [lesson.id]);

  /**
   * Mereset status kuis kembali ke awal, termasuk indeks soal, opsi yang dipilih,
   * dan jumlah jawaban benar.
   */
  const resetQuiz = () => {
      setViewMode('reading');
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setIsChecked(false);
      setCorrectCount(0);
  };

  // Update shuffled options when question changes
  useEffect(() => {
      if (viewMode === 'quiz' && material?.practiceQuestions) {
          const currentQ = material.practiceQuestions[currentQuestionIndex];
          if (currentQ && currentQ.options) {
              setShuffledOptions(shuffleArray(currentQ.options));
          }
      }
  }, [currentQuestionIndex, viewMode, material]);

  // KaTeX Rendering
  useEffect(() => {
    if (viewMode === 'reading' && material && !loading) {
        // @ts-ignore
        if (window.renderMathInElement) {
            try {
                // @ts-ignore
                window.renderMathInElement(document.body, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false}
                    ],
                    throwOnError: false
                });
            } catch (e) { console.warn("KaTeX error:", e); }
        }
    }
  }, [viewMode, material, loading, visibleSectionIndex]);

  /**
   * Menangani pengiriman jawaban untuk bagian inquiry (pertanyaan interaktif).
   * Memvalidasi jawaban, memberikan umpan balik, dan membuka bagian selanjutnya jika benar.
   * @param sectionId ID dari bagian inquiry yang sedang dijawab.
   * @param correctAnswer Jawaban yang benar untuk divalidasi.
   */
  const handleInquirySubmit = (sectionId: string, correctAnswer: string | number) => {
      const userAnswer = inquiryAnswers[sectionId]?.trim().toLowerCase();
      const isCorrect = userAnswer === String(correctAnswer).toLowerCase();
      
      setInquiryFeedback(prev => ({ ...prev, [sectionId]: isCorrect ? 'correct' : 'incorrect' }));

      if (isCorrect) {
          setFeedbackMessage(positiveFeedbacks[Math.floor(Math.random() * positiveFeedbacks.length)]);
      }
  };

  const handleNextSection = (sectionId: string) => {
      if (material) {
          const currentIndex = material.sections.findIndex(s => s.id === sectionId);
          const nextInquiryIndex = material.sections.findIndex((s, i) => i > currentIndex && (s.type === 'inquiry-input' || s.type === 'multiple-choice' || s.type === 'logic-playground'));
          setVisibleSectionIndex(nextInquiryIndex === -1 ? material.sections.length - 1 : nextInquiryIndex);
      }
  };

  if (loading) {
      return (
          <div className="fixed inset-0 bg-white z-50 flex flex-col p-6 animate-in fade-in">
             <Skeleton className="w-full h-full rounded-2xl" />
          </div>
      );
  }

  if (!material) {
    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center">
            <Construction size={48} className="text-slate-300 mb-4" />
            <h2 className="text-2xl font-bold text-slate-700">Konten Tidak Ditemukan</h2>
            <Button onClick={onExit} variant="outline" className="mt-4">Kembali</Button>
        </div>
    );
  }

  // --- RESULT VIEW ---
  if (viewMode === 'result') {
      const totalQuestions = material.practiceQuestions.length;
      const score = Math.round((correctCount / totalQuestions) * 100);
      const isPassed = score === 100; 

      return (
          <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 ${isPassed ? 'bg-green-100 text-green-500 animate-bounce' : 'bg-red-100 text-red-500'}`}>
                  {isPassed ? <Trophy size={64} fill="currentColor" /> : <XCircle size={64} />}
              </div>
              
              <h2 className="text-3xl font-black text-slate-800 mb-2">{isPassed ? 'LULUS!' : 'BELUM LULUS'}</h2>
              
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 mb-8 w-full max-w-sm">
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Skor Kamu</div>
                  <div className={`text-6xl font-black mb-4 ${isPassed ? 'text-green-500' : 'text-red-500'}`}>{score}</div>
                  
                  <div className="flex justify-between text-sm font-bold text-slate-600 border-t-2 border-slate-200 pt-4">
                      <span>Benar: {correctCount}/{totalQuestions}</span>
                      <span>Syarat: 100</span>
                  </div>
              </div>

              {isPassed ? (
                  <div className="space-y-4 w-full max-w-sm">
                      <p className="text-slate-500 font-bold mb-4">Selamat! Kamu berhasil membuka materi selanjutnya.</p>
                      <Button onClick={() => onComplete(score)} size="lg" className="w-full bg-feather border-feather-dark" icon={<CheckCircle size={24}/>}>
                          SELESAI & LANJUT
                      </Button>
                  </div>
              ) : (
                  <div className="space-y-4 w-full max-w-sm">
                      <p className="text-slate-500 font-bold mb-4">Kamu harus menjawab benar semua soal untuk lanjut. Yuk coba lagi!</p>
                      <Button onClick={() => { setViewMode('reading'); setCurrentQuestionIndex(0); setCorrectCount(0); setSelectedOption(null); setIsChecked(false); }} size="lg" variant="outline" className="w-full" icon={<BookOpen size={20}/>}>
                          BACA MATERI
                      </Button>
                      <Button onClick={() => { setViewMode('quiz'); setCurrentQuestionIndex(0); setCorrectCount(0); setSelectedOption(null); setIsChecked(false); }} size="lg" variant="danger" className="w-full" icon={<RotateCcw size={20}/>}>
                          COBA KUIS LAGI
                      </Button>
                  </div>
              )}
          </div>
      );
  }

  // --- READING VIEW ---
  if (viewMode === 'reading') {
      return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="px-6 py-4 border-b-2 border-slate-100 flex items-center justify-between bg-white/90 backdrop-blur-sm sticky top-0 z-10">
                <button onClick={onExit} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-50"><X size={24} /></button>
                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Materi Pembelajaran</span>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50">
                <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="inline-block p-3 bg-feather-light/20 text-feather-dark rounded-2xl mb-2"><BookOpen size={32} /></div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 leading-tight">{material.title}</h1>
                        <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">{material.intro}</p>
                    </div>

                    {/* Objectives */}
                    <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
                        <h3 className="text-slate-400 font-bold uppercase text-xs mb-4 tracking-wider">Tujuan Pembelajaran (ABCD)</h3>
                        <ul className="space-y-3">
                            {material.objectives.map((obj, idx) => (
                                <li key={idx} className="flex gap-3 text-slate-700 font-bold text-sm md:text-base">
                                    <div className="shrink-0 w-6 h-6 rounded-full bg-macaw text-white flex items-center justify-center text-xs font-extrabold mt-0.5">{idx + 1}</div>
                                    {obj}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Sections */}
                    <div className="space-y-8">
                        {material.sections.map((section, idx) => {
                            if (idx > visibleSectionIndex) return null;
                            
                            if (section.hideWhenVisible) {
                                const hideIndex = material.sections.findIndex(s => s.id === section.hideWhenVisible);
                                if (hideIndex !== -1 && visibleSectionIndex >= hideIndex) {
                                    return null;
                                }
                            }

                            return (
                                <div key={section.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    {/* Text Content */}
                                    {section.type === 'text' && section.htmlContent && (
                                        <div 
                                            className="prose prose-slate prose-lg max-w-none bg-white p-6 md:p-8 rounded-3xl border-2 border-slate-200 shadow-sm"
                                            dangerouslySetInnerHTML={{ __html: section.htmlContent }}
                                        />
                                    )}

                                    {/* 3D Demo */}
                                    {section.type === '3d-demo' && (
                                        <div className="my-6">
                                            {section.modelType === 'gallery' && <ShapeGallery />}
                                            {section.modelType === 'elements' && <CubeConstruction />}
                                            {section.modelType === 'volume' && <VolumeLab 
                                                shape={(section.modelConfig?.shape as any) || 'balok'} 
                                                mode={section.modelConfig?.mode || 'fixed'}
                                                p={section.modelConfig?.p}
                                                l={section.modelConfig?.l}
                                                t={section.modelConfig?.t}
                                                segments={section.modelConfig?.segments}
                                            />}
                                        </div>
                                    )}

                                    {/* Inquiry Input */}
                                    {section.type === 'inquiry-input' && (
                                        <div className="bg-indigo-50 border-2 border-indigo-100 p-6 rounded-3xl space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-indigo-500 text-white p-2 rounded-xl shrink-0"><HelpCircle size={24} /></div>
                                                <div>
                                                    <h3 className="font-bold text-indigo-900 text-lg mb-1">Tantangan Inquiry</h3>
                                                    <p className="text-indigo-700 font-medium">{section.question}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-2 mt-4">
                                                <input 
                                                    type="text" 
                                                    placeholder={section.placeholder || "Ketik jawabanmu..."}
                                                    className="flex-1 border-2 border-indigo-200 rounded-xl px-4 py-3 font-bold text-indigo-900 focus:outline-none focus:border-indigo-500 transition-colors"
                                                    value={inquiryAnswers[section.id] || ''}
                                                    onChange={(e) => setInquiryAnswers(prev => ({ ...prev, [section.id]: e.target.value }))}
                                                    disabled={inquiryFeedback[section.id] === 'correct'}
                                                />
                                                <Button 
                                                    onClick={() => handleInquirySubmit(section.id, section.correctAnswer!)}
                                                    disabled={!inquiryAnswers[section.id] || inquiryFeedback[section.id] === 'correct'}
                                                    className={inquiryFeedback[section.id] === 'correct' ? 'bg-green-500 border-green-600' : 'bg-indigo-600 border-indigo-800'}
                                                    icon={inquiryFeedback[section.id] === 'correct' ? <CheckCircle /> : <Send />}
                                                >
                                                    {inquiryFeedback[section.id] === 'correct' ? 'Benar!' : 'Cek'}
                                                </Button>
                                            </div>

                                            {inquiryFeedback[section.id] === 'incorrect' && (
                                                <div className="bg-red-100 text-red-600 p-3 rounded-xl text-sm font-bold animate-in shake">
                                                    Jawaban kurang tepat. Coba lagi ya!
                                                </div>
                                            )}

                                            {inquiryFeedback[section.id] === 'correct' && (
                                                <div className="bg-green-100 text-green-700 p-4 rounded-xl font-medium animate-in fade-in slide-in-from-top-2">
                                                    {section.feedback && (
                                                        <>
                                                            <span className="font-bold block mb-1">Penjelasan:</span>
                                                            <div className="mb-4">{section.feedback}</div>
                                                        </>
                                                    )}
                                                    <Button 
                                                        onClick={() => handleNextSection(section.id)}
                                                        className="w-full bg-green-600 hover:bg-green-700 border-green-800"
                                                        icon={<ChevronRight />}
                                                    >
                                                        Selanjutnya
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Multiple Choice Inquiry */}
                                    {section.type === 'multiple-choice' && (
                                        <div className="bg-indigo-50 border-2 border-indigo-100 p-6 rounded-3xl space-y-4">
                                            <div className="flex items-start gap-3 mb-4">
                                                <div className="bg-indigo-500 text-white p-2 rounded-xl shrink-0"><HelpCircle size={24} /></div>
                                                <div>
                                                    <h3 className="font-bold text-indigo-900 text-lg mb-1">Tantangan Pemahaman</h3>
                                                    <p className="text-indigo-700 font-medium">{section.question}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {(sectionOptions[section.id] || section.options)?.map((option, optIdx) => (
                                                    <button
                                                        key={optIdx}
                                                        onClick={() => setInquiryAnswers(prev => ({ ...prev, [section.id]: option }))}
                                                        disabled={inquiryFeedback[section.id] === 'correct'}
                                                        className={`p-4 rounded-xl border-2 text-left font-bold transition-all ${
                                                            inquiryAnswers[section.id] === option 
                                                                ? 'bg-indigo-600 text-white border-indigo-800 shadow-md transform scale-[1.02]' 
                                                                : 'bg-white text-slate-600 border-indigo-100 hover:border-indigo-300'
                                                        } ${inquiryFeedback[section.id] === 'correct' && inquiryAnswers[section.id] !== option ? 'opacity-50' : ''}`}
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="flex justify-between items-center mt-4">
                                                {inquiryFeedback[section.id] === 'correct' ? (
                                                    <div className="text-green-600 font-bold text-lg flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                                                        <CheckCircle size={24} />
                                                        {feedbackMessage || 'Benar!'}
                                                    </div>
                                                ) : (
                                                    <div></div>
                                                )}
                                                <Button 
                                                    onClick={() => handleInquirySubmit(section.id, section.correctAnswer!)}
                                                    disabled={!inquiryAnswers[section.id] || inquiryFeedback[section.id] === 'correct'}
                                                    className={inquiryFeedback[section.id] === 'correct' ? 'bg-green-500 border-green-600 opacity-0 pointer-events-none' : 'bg-indigo-600 border-indigo-800'}
                                                    icon={<Send />}
                                                >
                                                    Cek Jawaban
                                                </Button>
                                            </div>

                                            {inquiryFeedback[section.id] === 'incorrect' && (
                                                <div className="bg-red-100 text-red-600 p-3 rounded-xl text-sm font-bold animate-in shake mt-2">
                                                    Jawaban kurang tepat. Coba lagi ya!
                                                </div>
                                            )}

                                            {inquiryFeedback[section.id] === 'correct' && (
                                                <div className="bg-green-100 text-green-700 p-4 rounded-xl font-medium animate-in fade-in slide-in-from-top-2 mt-2">
                                                    {section.feedback && (
                                                        <>
                                                            <span className="font-bold block mb-1">Penjelasan:</span>
                                                            <div className="mb-4">{section.feedback}</div>
                                                        </>
                                                    )}
                                                    <Button 
                                                        onClick={() => handleNextSection(section.id)}
                                                        className="w-full bg-green-600 hover:bg-green-700 border-green-800"
                                                        icon={<ChevronRight />}
                                                    >
                                                        Selanjutnya
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Logic Playground */}
                                    {section.type === 'logic-playground' && section.playgroundConfig && (
                                        <div className="my-6">
                                            <LogicPlayground 
                                                availableBlocks={section.playgroundConfig.availableBlocks}
                                                correctAnswers={section.playgroundConfig.correctAnswers}
                                                feedbackText={section.feedback}
                                                onCorrect={() => {
                                                    setInquiryFeedback(prev => ({ ...prev, [section.id]: 'correct' }));
                                                }}
                                            />
                                            {inquiryFeedback[section.id] === 'correct' && (
                                                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                                    <Button 
                                                        onClick={() => handleNextSection(section.id)}
                                                        className="w-full bg-green-600 hover:bg-green-700 border-green-800"
                                                        icon={<ChevronRight />}
                                                    >
                                                        Selanjutnya
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="h-10"></div>
                </div>
            </div>

            <div className="p-4 border-t-2 border-slate-100 bg-white">
                <div className="max-w-3xl mx-auto">
                    {/* Only show "Lanjut" if all sections are visible AND all inquiries are answered correctly */}
                    {visibleSectionIndex >= material.sections.length - 1 && 
                     material.sections.filter(s => s.type === 'inquiry-input' || s.type === 'multiple-choice' || s.type === 'logic-playground').every(s => inquiryFeedback[s.id] === 'correct') ? (
                        material.practiceQuestions && material.practiceQuestions.length > 0 ? (
                            <Button onClick={() => setViewMode('quiz')} className="w-full" size="lg" icon={<ChevronRight size={24} />}>LANJUT KE LATIHAN SOAL</Button>
                        ) : (
                            <Button onClick={() => onComplete(100)} className="w-full bg-green-500 hover:bg-green-600 border-green-700" size="lg" icon={<CheckCircle size={24} />}>SELESAI MATERI</Button>
                        )
                    ) : (
                        <div className="text-center text-slate-400 font-bold text-sm italic">
                            Selesaikan tantangan di atas untuk lanjut...
                        </div>
                    )}
                </div>
            </div>
        </div>
      );
  }

  // --- QUIZ VIEW ---
  const questions = material.practiceQuestions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  /**
   * Menangani pengecekan jawaban pada mode kuis (latihan soal).
   * Memperbarui status benar/salah dan menghitung skor.
   */
  const handleCheck = () => {
    if (!selectedOption) return;
    const correct = selectedOption === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    if (correct) {
        setCorrectCount(prev => prev + 1);
    }
    setIsChecked(true);
  };

  /**
   * Melanjutkan ke pertanyaan kuis berikutnya atau menampilkan hasil akhir
   * jika sudah mencapai pertanyaan terakhir.
   */
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsChecked(false);
    } else {
      setViewMode('result');
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="px-4 py-6 flex items-center gap-4 max-w-4xl mx-auto w-full">
        <button onClick={() => setViewMode('reading')} className="text-slate-400 hover:text-slate-600"><ArrowLeft size={28} /></button>
        <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-feather transition-all duration-500 ease-out rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 pt-8 pb-60 text-center md:text-left">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-lg md:text-xl font-bold text-slate-700 leading-relaxed">{currentQuestion.question}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options?.map((option, idx) => (
                <button
                    key={idx}
                    onClick={() => !isChecked && setSelectedOption(option)}
                    disabled={isChecked}
                    className={`p-4 rounded-2xl border-2 border-b-4 text-base font-bold text-left transition-all ${isChecked && option === currentQuestion.correctAnswer ? 'bg-feather-light/20 border-feather text-feather-dark' : isChecked && selectedOption === option && option !== currentQuestion.correctAnswer ? 'bg-cardinal-light/20 border-cardinal text-cardinal' : selectedOption === option ? 'bg-macaw-light/20 border-macaw text-macaw-dark' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm font-extrabold ${selectedOption === option ? 'border-current opacity-100' : 'border-slate-200 text-slate-300'}`}>{String.fromCharCode(65 + idx)}</div>
                        {option}
                    </div>
                </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`fixed bottom-0 left-0 right-0 p-4 md:p-6 border-t-4 transition-colors duration-300 z-50 ${isChecked ? (isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500') : 'bg-white border-slate-200'} max-h-[60vh] overflow-y-auto`}>
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {isChecked ? (
                <div className="flex items-start gap-4 w-full animate-in slide-in-from-bottom-2 fade-in flex-1">
                    {isCorrect ? (
                        <div className="bg-green-500 rounded-full p-2 text-white shrink-0 mt-1 shadow-sm">
                            <CheckCircle size={28} strokeWidth={3} />
                        </div>
                    ) : (
                        <div className="bg-red-500 rounded-full p-2 text-white shrink-0 mt-1 shadow-sm">
                            <XCircle size={28} strokeWidth={3} />
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <h3 className={`font-extrabold text-xl mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                            {isCorrect ? 'Kerja Bagus!' : 'Jawaban Salah'}
                        </h3>
                        <div className={`text-sm md:text-base font-medium leading-relaxed p-3 rounded-xl ${isCorrect ? 'text-green-800 bg-green-100/50' : 'text-red-800 bg-red-100/50'}`}>
                            <span className="font-bold block mb-1 uppercase text-xs tracking-wider opacity-70">Pembahasan:</span>
                            {isCorrect ? (currentQuestion.feedbackCorrect || currentQuestion.explanation) : (currentQuestion.feedbackIncorrect || currentQuestion.explanation)}
                        </div>
                    </div>
                </div>
            ) : <div className="hidden md:block"></div>}
            
            <div className={isChecked ? "shrink-0 w-full md:w-auto self-end md:self-center" : "w-full flex justify-end"}>
                <Button 
                    onClick={isChecked ? handleNext : handleCheck} 
                    disabled={!selectedOption} 
                    className={`w-full md:w-auto min-w-[160px] shadow-[0_4px_0_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all font-extrabold tracking-wider ${
                        !selectedOption 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                        : isChecked 
                            ? (isCorrect ? 'bg-green-500 hover:bg-green-400 border-b-4 border-green-700 text-white' : 'bg-red-500 hover:bg-red-400 border-b-4 border-red-700 text-white')
                            : 'bg-green-500 hover:bg-green-400 border-b-4 border-green-700 text-white'
                    }`} 
                    size="lg"
                >
                    {isChecked ? (currentQuestionIndex === questions.length - 1 ? 'LIHAT HASIL' : 'LANJUT') : 'PERIKSA'}
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};
