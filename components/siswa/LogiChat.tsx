import React, { useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, StopCircle, Loader2, Sparkles, Lightbulb } from 'lucide-react';
import { Button } from '../shared/Button';
import { useChat } from '../../controllers/useChat'; // Import Controller
import { useAppContext } from '../../lib/AppContext';

// --- VIEW LAYER ---
// Hanya bertanggung jawab untuk Rendering UI

const SUGGESTION_CHIPS = [
  "Rumus Pythagoras dong! 📐",
  "Cara hitung Luas Lingkaran? ⭕",
  "Tebak-tebakan Matematika! 🎲",
  "Jelaskan Aljabar dasar 📚",
  "Apa itu Bilangan Prima? 🤔"
];

/**
 * Komponen antarmuka obrolan (chat) dengan AI (Logi AI).
 * Menangani tampilan pesan, input pengguna, dan saran pertanyaan.
 * Logika obrolan dikelola oleh custom hook `useChat`.
 * 
 * @returns {JSX.Element} Elemen antarmuka obrolan LogiChat.
 */
export const LogiChat: React.FC = () => {
  const { userData } = useAppContext();
  
  // Menggunakan Custom Hook (Controller)
  const { 
    messages, input, setInput, isLoading, showChips, 
    sendMessage, resetChat 
  } = useChat(userData);
  
  const dummyEndRef = useRef<HTMLDivElement>(null);

  // Auto Scroll (UI Logic)
  useEffect(() => {
    dummyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /**
   * Menangani pengiriman form chat.
   * Mencegah perilaku default form dan mengirim pesan.
   * @param {React.FormEvent} e - Event submit form.
   */
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  /**
   * Komponen helper untuk merender teks Markdown sederhana.
   * Mengubah sintaks Markdown dasar (bold, italic, math) menjadi elemen HTML.
   * @param {{ text: string }} props - Properti komponen yang berisi teks Markdown.
   * @returns {JSX.Element} Elemen div yang berisi HTML yang dirender.
   */
  const SimpleMarkdown = ({ text }: { text: string }) => {
    const htmlContent = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\$\$(.*?)\$\$/g, '<div class="bg-slate-100 p-3 my-2 rounded-xl text-center font-mono text-sm border-2 border-slate-200 overflow-x-auto text-slate-700 shadow-sm">$1</div>')
      .replace(/\$(.*?)\$/g, '<span class="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs border border-slate-200 font-bold text-macaw-dark">$1</span>')
      .replace(/\n/g, '<br />');
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border-2 border-slate-200 overflow-hidden mt-4 relative">
      
      {/* HEADER */}
      <div className="bg-white border-b-2 border-slate-100 p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="bg-feather p-2.5 rounded-2xl text-white shadow-feather-light shadow-md transform rotate-3">
            <Bot size={28} />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-700 text-lg leading-none">Logi AI</h2>
            <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Online • {userData?.grade ? `Kelas ${userData.grade}` : 'Umum'}</p>
            </div>
          </div>
        </div>
        <button onClick={resetChat} className="text-slate-300 hover:text-cardinal hover:bg-red-50 p-2.5 rounded-xl transition-all" title="Hapus Chat">
          <Trash2 size={20} />
        </button>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 scroll-smooth">
        {messages.map((msg, idx) => {
          const isBot = msg.role === 'model';
          return (
            <div key={idx} className={`flex gap-3 animate-in slide-in-from-bottom-2 duration-300 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${isBot ? 'bg-feather text-white border-feather-dark shadow-feather-light' : 'bg-white text-slate-400 border-slate-200'}`}>
                {isBot ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm border-b-4 ${
                isBot 
                  ? 'bg-white text-slate-700 rounded-tl-none border-2 border-slate-200 border-b-slate-300' 
                  : 'bg-macaw text-white rounded-tr-none border-2 border-macaw border-b-macaw-dark'
              }`}>
                <SimpleMarkdown text={msg.text} />
              </div>
            </div>
          );
        })}
        
        {isLoading && (
          <div className="flex gap-3 items-center text-slate-400 text-xs ml-14 animate-pulse font-bold">
            <Loader2 size={16} className="animate-spin text-macaw" />
            Logi sedang mengetik...
          </div>
        )}
        <div ref={dummyEndRef} />
      </div>

      {/* SUGGESTION CHIPS */}
      {showChips && !isLoading && (
          <div className="px-4 pb-2 bg-slate-50">
              <div className="flex items-center gap-2 mb-2 px-1">
                  <Sparkles size={14} className="text-bee-dark" />
                  <span className="text-xs font-bold text-slate-400 uppercase">Saran Pertanyaan</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {SUGGESTION_CHIPS.map((chip, idx) => (
                      <button 
                        key={idx}
                        onClick={() => sendMessage(chip)}
                        className="whitespace-nowrap px-4 py-2 bg-white border-2 border-slate-200 border-b-4 rounded-xl text-slate-600 text-xs font-bold hover:border-macaw hover:text-macaw active:border-b-2 active:translate-y-[2px] transition-all"
                      >
                          {chip}
                      </button>
                  ))}
              </div>
          </div>
      )}

      {/* INPUT AREA */}
      <form onSubmit={handleFormSubmit} className="p-4 bg-white border-t-2 border-slate-100 flex gap-2">
        <div className="relative flex-1">
             <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pertanyaan matematikamu..." 
              className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl pl-10 pr-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-macaw focus:ring-0 focus:bg-white transition-colors placeholder-slate-400"
              disabled={isLoading}
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Lightbulb size={18} />
            </div>
        </div>
       
        <Button type="submit" disabled={!input.trim() || isLoading} className="w-14 px-0 flex items-center justify-center rounded-2xl shadow-macaw-light" variant={isLoading ? 'secondary' : 'primary'}>
           {isLoading ? <StopCircle size={24} /> : <Send size={24} />}
        </Button>
      </form>

    </div>
  );
};