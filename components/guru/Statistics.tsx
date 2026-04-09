import React, { useState, useEffect } from 'react';
import { supabase, UserData } from '../../lib/supabase';
import { CURRICULUM_DATA } from '../../data/curriculum';
import { BarChart2, PieChart, Users, Loader2 } from 'lucide-react';

/**
 * Komponen untuk menampilkan statistik kelas kepada guru.
 * Menampilkan distribusi level siswa dan persentase ketuntasan materi per unit.
 * 
 * @returns {JSX.Element} Elemen antarmuka statistik kelas.
 */
export const Statistics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [levelStats, setLevelStats] = useState<{ label: string, count: number, color: string }[]>([]);
  const [unitStats, setUnitStats] = useState<{ label: string, percentage: number, color: string }[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      // Fetch all student data (assuming Role = siswa)
      const { data: students, error } = await supabase
        .from('users_data')
        .select('level, completed_lessons')
        .eq('role', 'siswa');

      if (error) throw error;

      if (students) {
        setTotalStudents(students.length);
        processLevelStats(students);
        processUnitStats(students);
      }
    } catch (err) {
      console.error("Gagal memuat statistik:", err);
    } finally {
      setLoading(false);
    }
  };

  const processLevelStats = (students: Partial<UserData>[]) => {
    // Buckets: 1-3, 4-6, 7-9, 10+
    const counts = [0, 0, 0, 0];
    
    students.forEach(s => {
      const lvl = s.level || 1;
      if (lvl <= 3) counts[0]++;
      else if (lvl <= 6) counts[1]++;
      else if (lvl <= 9) counts[2]++;
      else counts[3]++;
    });

    setLevelStats([
      { label: 'Level 1-3', count: counts[0], color: 'bg-feather' },
      { label: 'Level 4-6', count: counts[1], color: 'bg-macaw' },
      { label: 'Level 7-9', count: counts[2], color: 'bg-bee' },
      { label: 'Level 10+', count: counts[3], color: 'bg-cardinal' },
    ]);
  };

  const processUnitStats = (students: Partial<UserData>[]) => {
    if (students.length === 0) return;

    // Map units to calculate completion
    const stats = CURRICULUM_DATA.map(unit => {
      const unitLessonIds = unit.lessons.map(l => l.id);
      const totalLessonsInUnit = unitLessonIds.length;
      
      let totalCompletedByAll = 0;

      students.forEach(student => {
        const completed = student.completed_lessons || [];
        // Count how many lessons of this unit are in student's completed list
        const studentCompletedCount = unitLessonIds.filter(id => completed.includes(id)).length;
        totalCompletedByAll += studentCompletedCount;
      });

      // Average % = (Total Completed by All Students) / (Total Students * Lessons in Unit) * 100
      const maxPossibleCompletion = students.length * totalLessonsInUnit;
      const percentage = maxPossibleCompletion === 0 ? 0 : Math.round((totalCompletedByAll / maxPossibleCompletion) * 100);

      return {
        label: unit.title.split(':')[0], // "Unit 1", etc.
        percentage,
        color: unit.color.replace('bg-', 'bg-') // Reuse unit color
      };
    });

    setUnitStats(stats);
  };

  const maxCount = Math.max(...levelStats.map(s => s.count), 1); // Avoid div by zero

  if (loading) {
      return (
          <div className="h-96 flex flex-col items-center justify-center text-slate-400">
              <Loader2 size={48} className="animate-spin mb-4" />
              <p className="font-bold">Menganalisis Data...</p>
          </div>
      );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
       <div className="flex items-center gap-4 mb-2">
           <div className="bg-slate-100 p-3 rounded-2xl text-slate-600">
               <BarChart2 size={32} />
           </div>
           <div>
               <h2 className="text-2xl font-bold text-slate-800">Statistik Kelas</h2>
               <p className="text-slate-500 font-bold text-sm">Total Siswa: {totalStudents}</p>
           </div>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Grafik Batang Vertikal - Level */}
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                 <Users size={120} />
             </div>
             <h3 className="font-extrabold text-slate-700 mb-8 flex items-center gap-2">
                 <span className="w-2 h-6 bg-macaw rounded-full"></span>
                 Distribusi Level
             </h3>
             
             {totalStudents === 0 ? (
                 <div className="h-[250px] flex items-center justify-center text-slate-400 font-bold">Belum ada data siswa.</div>
             ) : (
                 <div className="h-[300px] flex items-end justify-around gap-4 pb-2 border-b-2 border-slate-100 px-4">
                    {levelStats.map((stat, idx) => (
                      <div key={idx} className="flex flex-col items-center w-full group relative">
                        <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {stat.count} Siswa ({Math.round((stat.count/totalStudents)*100)}%)
                        </div>
                        <div 
                          className={`w-full max-w-[60px] rounded-t-xl transition-all duration-1000 ease-out hover:opacity-80 relative ${stat.color}`}
                          style={{ height: `${(stat.count / maxCount) * 100}%`, minHeight: '10px' }}
                        >
                            {/* Pattern overlay */}
                            <div className="absolute inset-0 bg-white/10" style={{backgroundImage: 'radial-gradient(circle, transparent 20%, #000000 20%, #000000 40%, transparent 40%, transparent)', backgroundSize: '10px 10px', opacity: 0.05}}></div>
                        </div>
                        <div className="mt-4 text-[10px] md:text-xs font-extrabold text-slate-400 text-center uppercase tracking-wider">{stat.label}</div>
                      </div>
                    ))}
                 </div>
             )}
          </div>

          {/* Grafik Progress Bars Horizontal - Unit Completion */}
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                 <PieChart size={120} />
             </div>
             <h3 className="font-extrabold text-slate-700 mb-8 flex items-center gap-2">
                 <span className="w-2 h-6 bg-feather rounded-full"></span>
                 Ketuntasan Materi
             </h3>
             
             <div className="space-y-6 h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {unitStats.map((stat, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                      <span>{stat.label}</span>
                      <span className={stat.percentage === 100 ? 'text-feather' : 'text-slate-400'}>{stat.percentage}%</span>
                    </div>
                    <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2 ${stat.color}`}
                        style={{ width: `${stat.percentage}%` }}
                      >
                          {stat.percentage > 10 && <div className="w-1 h-1 bg-white/50 rounded-full"></div>}
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>

       </div>
    </div>
  );
};