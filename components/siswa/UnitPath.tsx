import React, { useState, useMemo } from 'react';
import { Unit, Lesson } from '../../types';
import { Star, Check, Lock, List, X, BookOpen, ChevronDown, GraduationCap } from 'lucide-react';
import { useAppContext } from '../../lib/AppContext';

interface UnitPathProps {
  units: Unit[];
  completedLessonIds: string[];
  onStartLesson: (lesson: Lesson) => void;
  onStartPosttest?: () => void;
}

/**
 * Komponen untuk menampilkan peta perjalanan belajar (Unit Path) siswa.
 * Menampilkan daftar unit dan materi (lesson) dalam bentuk visual seperti peta.
 * Menangani logika penguncian materi.
 * 
 * @param {UnitPathProps} props - Properti komponen UnitPath.
 * @param {Unit[]} props.units - Daftar unit pembelajaran.
 * @param {string[]} props.completedLessonIds - Daftar ID materi yang sudah diselesaikan.
 * @param {(lesson: Lesson) => void} props.onStartLesson - Callback yang dipanggil saat siswa memilih untuk memulai materi.
 * @param {() => void} props.onStartPosttest - Callback yang dipanggil saat siswa memilih untuk memulai post-test.
 * @returns {JSX.Element} Elemen antarmuka peta perjalanan belajar.
 */
export const UnitPath: React.FC<UnitPathProps> = ({ units, completedLessonIds, onStartLesson, onStartPosttest }) => {
  const { userData } = useAppContext();
  const [showOverview, setShowOverview] = useState(false);

  // Flatten all lessons into a single array to determine order
  const allLessons = useMemo(() => {
    const lessons: { unitId: string, lesson: Lesson }[] = [];
    units.forEach(unit => {
      unit.lessons.forEach(lesson => {
        lessons.push({ unitId: unit.id, lesson });
      });
    });
    return lessons;
  }, [units]);

  // Logic: Lesson is locked if the PREVIOUS lesson is not in completedLessonIds
  // Exception: The very first lesson is always unlocked.
  /**
   * Menentukan apakah sebuah materi terkunci atau tidak.
   * Materi terkunci jika materi sebelumnya belum diselesaikan.
   * 
   * @param {string} lessonId - ID materi yang akan dicek.
   * @returns {boolean} True jika materi terkunci, false jika terbuka.
   */
  const isLessonLocked = (lessonId: string) => {
    const currentIndex = allLessons.findIndex(item => item.lesson.id === lessonId);
    if (currentIndex <= 0) return false; // Materi pertama selalu terbuka
    
    const prevLessonId = allLessons[currentIndex - 1].lesson.id;
    return !completedLessonIds.includes(prevLessonId);
  };

  const isLessonCompleted = (id: string) => completedLessonIds.includes(id);
  
  const isAllCompleted = allLessons.every(item => isLessonCompleted(item.lesson.id));
  const hasCompletedPosttest = userData?.has_completed_posttest;

  return (
    <div className="max-w-2xl mx-auto pb-20 pt-6 px-4 md:px-0 relative">
      {units.map((unit, unitIdx) => {
        return (
            <div key={unit.id} className="mb-12 relative">
            <div className={`rounded-xl p-6 mb-8 text-white shadow-lg ${unit.color} flex justify-between items-center transform transition-transform relative overflow-hidden`}>
                <div>
                    <h2 className="text-2xl font-bold">{unit.title}</h2>
                    <p className="opacity-90">{unit.description}</p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg relative z-10">
                    <Star className="text-white fill-white" />
                </div>
            </div>

            <div className="flex flex-col items-center gap-6 relative">
                {/* Connecting Line (Visual Only) */}
                <div className="absolute top-4 bottom-4 w-2 bg-slate-200 rounded-full -z-10"></div>

                {unit.lessons.map((lesson, lessonIndex) => {
                const completed = isLessonCompleted(lesson.id);
                const locked = isLessonLocked(lesson.id);
                
                // Zig-zag layout
                const offset = lessonIndex % 2 === 0 ? '0px' : (lessonIndex % 4 === 1 ? '40px' : '-40px');

                return (
                    <div key={lesson.id} className="relative flex flex-col items-center transition-all duration-500" style={{ transform: `translateX(${offset})` }}>
                    <button
                        onClick={() => !locked && onStartLesson(lesson)}
                        disabled={locked}
                        className={`
                        w-20 h-20 rounded-full flex items-center justify-center relative transition-transform active:scale-95 group border-b-4 shadow-xl
                        ${locked 
                            ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed grayscale' 
                            : completed 
                            ? 'bg-yellow-400 border-yellow-500 text-white ring-4 ring-yellow-100' 
                            : 'bg-white border-slate-200 text-slate-400 ring-4 ring-slate-100 hover:border-feather hover:text-feather hover:ring-feather/20'
                        }
                        ${!locked && !completed ? 'animate-bounce-slow' : ''}
                        `}
                    >
                        {locked 
                        ? <Lock size={28} /> 
                        : completed 
                            ? <Check size={32} strokeWidth={4} /> 
                            : <Star size={32} fill="currentColor" className={locked ? '' : 'text-yellow-400'} />
                        }
                        
                        {!locked && (
                            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded -top-8 whitespace-nowrap z-20 pointer-events-none">
                                {completed ? 'Ulangi Materi' : 'Mulai Belajar'}
                            </div>
                        )}
                    </button>
                    <div className={`mt-3 px-3 py-1.5 rounded-lg border shadow-sm text-xs font-bold text-center max-w-[140px] z-10 ${locked ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-white text-slate-700 border-slate-200'}`}>
                        {lesson.title}
                    </div>
                    </div>
                );
                })}
            </div>
            </div>
        );
      })}

      {/* POST-TEST SECTION */}
      <div className="mt-16 mb-12 relative flex flex-col items-center">
        <div className="w-2 h-16 bg-slate-200 rounded-full mb-4"></div>
        <div className={`rounded-3xl p-8 w-full max-w-md text-center shadow-xl border-4 transition-all duration-500 ${isAllCompleted ? 'bg-gradient-to-b from-macaw to-macaw-dark border-macaw-light text-white' : 'bg-slate-100 border-slate-200 text-slate-400 grayscale'}`}>
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-inner ${isAllCompleted ? 'bg-white/20' : 'bg-slate-200'}`}>
                {hasCompletedPosttest ? (
                    <Check size={40} className="text-white" strokeWidth={3} />
                ) : isAllCompleted ? (
                    <GraduationCap size={40} className="text-white" />
                ) : (
                    <Lock size={40} className="text-slate-400" />
                )}
            </div>
            <h2 className="text-2xl font-black mb-2">Ujian Akhir (Post-test)</h2>
            <p className={`text-sm mb-6 font-medium ${isAllCompleted ? 'text-macaw-light opacity-90' : 'text-slate-500'}`}>
                {hasCompletedPosttest 
                    ? `Luar biasa! Kamu telah menyelesaikan Post-test dengan skor ${userData?.posttest_score || 0}.` 
                    : isAllCompleted 
                    ? 'Buktikan kemampuanmu! Selesaikan ujian akhir ini untuk menamatkan perjalanan belajarmu.' 
                    : 'Selesaikan semua materi di atas untuk membuka Ujian Akhir.'}
            </p>
            <button
                onClick={() => isAllCompleted && onStartPosttest && onStartPosttest()}
                disabled={!isAllCompleted}
                className={`w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wide transition-all active:scale-95 border-b-4 ${
                    isAllCompleted 
                    ? 'bg-white text-macaw border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-lg' 
                    : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                }`}
            >
                {hasCompletedPosttest ? 'Ulangi Post-test' : isAllCompleted ? 'Mulai Post-test' : 'Terkunci'}
            </button>
        </div>
      </div>

      <button onClick={() => setShowOverview(true)} className="fixed bottom-6 right-6 bg-white text-slate-700 border-2 border-slate-200 p-3 rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all z-40 group" title="Lihat Silabus">
        <List size={28} className="text-macaw" />
        <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Overview Materi
        </span>
      </button>

      {showOverview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowOverview(false)}></div>
            <div className="bg-white rounded-3xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 relative">
                <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="bg-macaw p-2 rounded-xl text-white">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-xl text-slate-700">Silabus Pembelajaran</h3>
                            <p className="text-slate-400 text-xs font-bold">Total {units.length} Unit</p>
                        </div>
                    </div>
                    <button onClick={() => setShowOverview(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {units.map((unit) => (
                        <div key={unit.id}>
                            <h4 className="font-bold text-slate-600 mb-3 flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${unit.color.replace('bg-', 'bg-')}`}></span>
                                {unit.title}
                            </h4>
                            <div className="space-y-2 pl-5 border-l-2 border-slate-100 ml-1.5">
                                {unit.lessons.map((lesson) => {
                                    const isLocked = isLessonLocked(lesson.id);
                                    return (
                                      <button 
                                        key={lesson.id} 
                                        onClick={() => {
                                            if (!isLocked) {
                                                onStartLesson(lesson);
                                                setShowOverview(false);
                                            }
                                        }}
                                        disabled={isLocked}
                                        className={`flex items-center gap-3 text-sm w-full text-left p-2 rounded-lg transition-colors ${!isLocked ? 'hover:bg-slate-100 cursor-pointer' : 'cursor-not-allowed'}`}
                                      >
                                          <div className={`w-2 h-2 rounded-full shrink-0 ${isLessonCompleted(lesson.id) ? 'bg-green-500' : isLocked ? 'bg-slate-200' : 'bg-yellow-400'}`}></div>
                                          <span className={`${isLessonCompleted(lesson.id) ? 'text-slate-700 font-bold' : isLocked ? 'text-slate-400 italic' : 'text-slate-600 font-bold'}`}>
                                              {lesson.title} {isLocked && <Lock size={10} className="inline ml-1"/>}
                                          </span>
                                      </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t-2 border-slate-100 bg-slate-50 text-center">
                    <button onClick={() => setShowOverview(false)} className="text-macaw font-bold text-sm hover:underline uppercase tracking-wider">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};