import { useState, useRef, useEffect } from 'react';
import { Chat } from "@google/genai";
import { ai, getSystemInstruction, MODEL_NAME } from '../services/gemini';
import { UserData } from '../models/types';

/**
 * --- CONTROLLER LAYER ---
 * Mengatur logika bisnis untuk Chatbot (State, API calls, Streaming)
 */

/**
 * Merepresentasikan pesan dalam antarmuka obrolan.
 */
export interface UIMessage {
  role: 'user' | 'model';
  text: string;
}

/**
 * Hook kustom untuk mengelola logika obrolan (chat) dengan asisten AI (Logi).
 * Menangani inisialisasi sesi obrolan, pengiriman pesan, dan penerimaan respons secara streaming.
 * 
 * @param {UserData | null} userData - Data pengguna yang sedang login, digunakan untuk personalisasi asisten.
 * @returns {Object} Objek yang berisi state dan fungsi untuk mengontrol antarmuka obrolan.
 */
export const useChat = (userData: UserData | null) => {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChips, setShowChips] = useState(true);
  
  const chatRef = useRef<Chat | null>(null);
  const isInitialized = useRef(false);

  // Inisialisasi
  useEffect(() => {
    if (userData && !isInitialized.current) {
      initChatSession();
      isInitialized.current = true;
    }
  }, [userData]);

  const initChatSession = () => {
    if (!userData) return;
    try {
      // Inisialisasi Model dengan System Instruction
      const model = ai.chats.create({
        model: MODEL_NAME,
        config: {
            systemInstruction: getSystemInstruction(userData),
            temperature: 0.7
        }
      });

      // Start Chat
      chatRef.current = model;
      
      setMessages([{ 
        role: 'model', 
        text: `Halo ${userData.username}! 👋 Aku Logi. \n\nSiap belajar matematika level Kelas ${userData.grade}? Tanyakan apa saja! 🚀` 
      }]);
    } catch (e) {
      console.error("Failed to init chat:", e);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || !chatRef.current || isLoading) return;

    // UI Updates State
    setInput('');
    setShowChips(false);
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', text }]);
    setMessages(prev => [...prev, { role: 'model', text: '' }]); // Placeholder

    try {
      const result = await chatRef.current.sendMessageStream({ message: text });
      let accumulatedText = '';

      for await (const chunk of result) {
        const chunkText = (chunk as any).text;
        accumulatedText += chunkText;
        updateLastMessage(accumulatedText);
      }
    } catch (error) {
      console.error("Chat error:", error);
      updateLastMessage("Maaf, koneksi terputus. Coba lagi ya! 😵");
    } finally {
      setIsLoading(false);
    }
  };

  const updateLastMessage = (text: string) => {
    setMessages(prev => {
      const newHistory = [...prev];
      newHistory[newHistory.length - 1] = { role: 'model', text };
      return newHistory;
    });
  };

  const resetChat = () => {
    setMessages([]);
    setShowChips(true);
    initChatSession();
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    showChips,
    sendMessage,
    resetChat
  };
};