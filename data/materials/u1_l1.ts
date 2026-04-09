import { MaterialContent } from './index';

export const u1_l1: MaterialContent = {
  id: 'u1-l1',
  title: 'Jenis Bangun Ruang',
  intro: 'Selamat datang! Mari kita mulai dengan mengenal berbagai bentuk bangun ruang di sekitar kita.',
  objectives: [
    'Siswa dapat membedakan bangun ruang sisi datar dan sisi lengkung.',
    'Siswa dapat menyebutkan contoh-contoh bangun ruang dalam kehidupan sehari-hari.',
    'Siswa dapat mengelompokkan bangun ruang berdasarkan jenis sisinya.'
  ],
  sections: [
    {
      id: 's1',
      type: 'text',
      htmlContent: `
        <h2 class="text-2xl font-bold text-indigo-900 mb-4">Perkenalan Bangun Ruang</h2>
        <p class="mb-4 text-slate-700 leading-relaxed">
          Di dunia ini, benda-benda memiliki bentuk yang beragam. Secara umum, bangun ruang dibagi menjadi dua kelompok besar:
        </p>
        <ul class="list-disc pl-6 mb-6 space-y-2 text-slate-700">
          <li><strong>Bangun Ruang Sisi Datar:</strong> Dibatasi oleh bidang datar (lurus). Contoh: Kubus, Balok, Prisma.</li>
          <li><strong>Bangun Ruang Sisi Lengkung:</strong> Memiliki setidaknya satu sisi yang melengkung. Contoh: Bola, Tabung, Kerucut.</li>
        </ul>
        <p class="mb-4 text-slate-700 font-bold">
          Coba eksplorasi galeri di bawah ini! Klik tab "Sisi Datar" dan "Sisi Lengkung" untuk melihat perbedaannya.
        </p>
      `
    },
    {
      id: 's2',
      type: '3d-demo',
      modelType: 'gallery',
      modelConfig: {
        initialTab: 'datar'
      }
    },
    {
      id: 's3',
      type: 'multiple-choice',
      question: 'Perhatikan benda di sekitarmu. Sebuah dadu permainan ular tangga termasuk bentuk bangun apa?',
      options: ['Balok', 'Kubus', 'Bola', 'Tabung'],
      correctAnswer: 'Kubus',
      feedback: 'Tepat sekali! Dadu memiliki 6 sisi persegi yang sama, sehingga disebut Kubus.'
    },
    {
      id: 's4',
      type: 'multiple-choice',
      question: 'Kaleng minuman bersoda biasanya berbentuk apa?',
      options: ['Prisma Segitiga', 'Kerucut', 'Tabung', 'Limas'],
      correctAnswer: 'Tabung',
      feedback: 'Benar! Kaleng memiliki alas dan tutup berbentuk lingkaran serta selimut yang melengkung, ciri khas Tabung.'
    },
    {
      id: 's5',
      type: 'multiple-choice',
      question: 'Piramida di Mesir adalah contoh nyata dari bangun ruang...',
      options: ['Limas', 'Prisma', 'Kerucut', 'Balok'],
      correctAnswer: 'Limas',
      feedback: 'Betul! Piramida memiliki alas persegi dan sisi tegak berbentuk segitiga yang bertemu di satu titik puncak, itu adalah Limas.'
    }
  ],
  practiceQuestions: [] // Kosongkan karena tantangan sudah ada di dalam lesson
};
