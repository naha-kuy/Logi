import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from './Button';
import { Send, RefreshCw, MessageSquare, Lock, Unlock, Reply, X, Trash2 } from 'lucide-react';
import { ForumMessage } from '../../types';
import { Avatar } from './Avatar';
import { useAppContext } from '../../lib/AppContext';

interface ForumProps {
  currentUserId: string;
  userRole: 'guru' | 'siswa';
}

/**
 * Komponen Forum untuk diskusi antar pengguna (siswa dan guru).
 * Mendukung fitur membalas pesan, mengunci forum (khusus guru), dan menghapus semua pesan (khusus guru).
 * 
 * @param {ForumProps} props - Properti komponen Forum.
 * @param {string} props.currentUserId - ID pengguna yang sedang login.
 * @param {'guru' | 'siswa'} props.userRole - Peran pengguna yang sedang login.
 * @returns {JSX.Element} Elemen forum yang dirender.
 */
export const Forum: React.FC<ForumProps> = ({ currentUserId, userRole }) => {
  const { showConfirm, showAlert } = useAppContext();
  const [threads, setThreads] = useState<(ForumMessage & { replies: ForumMessage[] })[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string, username: string, content: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isForumActive, setIsForumActive] = useState(true);
  const [configLoading, setConfigLoading] = useState(true);

  /**
   * Mengambil konfigurasi status forum (aktif/nonaktif) dari database.
   */
  const fetchConfig = async () => {
      try {
          const { data } = await supabase.from('system_settings').select('value').eq('key', 'forum_status').maybeSingle(); 
          if (data) {
              setIsForumActive(data.value.is_active);
          } else {
              setIsForumActive(true);
          }
      } catch (err) {
          // Silent fail for config
      } finally {
          setConfigLoading(false);
      }
  };

  /**
   * Mengambil semua pesan forum dari database dan menyusunnya menjadi struktur thread (induk dan balasan).
   */
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data: msgs, error } = await supabase.from('forum_messages').select('*').order('created_at', { ascending: true });
      if (error) throw error;

      if (msgs) {
        const userIds = [...new Set(msgs.map(m => m.user_id))];
        const { data: users } = await supabase.from('users_data').select('id, username, role, avatar_config').in('id', userIds);

        const enrichedMessages: ForumMessage[] = msgs.map(m => {
          const user = users?.find(u => u.id === m.user_id);
          return {
            ...m,
            username: user?.username || 'Unknown User',
            role: user?.role || 'siswa',
            avatar_config: user?.avatar_config
          };
        });

        const parents: (ForumMessage & { replies: ForumMessage[] })[] = [];
        const replyMap = new Map<string, ForumMessage[]>();

        enrichedMessages.forEach(msg => {
            if (msg.parent_id) {
                if (!replyMap.has(msg.parent_id)) {
                    replyMap.set(msg.parent_id, []);
                }
                replyMap.get(msg.parent_id)?.push(msg);
            } else {
                parents.push({ ...msg, replies: [] });
            }
        });

        parents.forEach(p => {
            if (replyMap.has(p.id)) {
                p.replies = replyMap.get(p.id)!;
            }
        });
        setThreads(parents.reverse());
      } else {
        setThreads([]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg !== 'TypeError: Failed to fetch' && !msg?.includes('fetch')) {
         console.error("Gagal memuat pesan forum:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchMessages();
    const interval = setInterval(() => {
        fetchMessages();
        fetchConfig(); 
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Menyiapkan state untuk membalas pesan tertentu.
   * @param {ForumMessage} msg - Pesan yang akan dibalas.
   */
  const handleReply = (msg: ForumMessage) => {
    setReplyingTo({ id: msg.id, username: msg.username, content: msg.content });
    inputRef.current?.focus();
  };

  /**
   * Mengirim pesan baru atau balasan ke forum.
   * @param {React.FormEvent} e - Event form submit.
   */
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const payload: Record<string, string> = { user_id: currentUserId, content: newMessage.trim() };
      if (replyingTo) payload.parent_id = replyingTo.id;
      const { error } = await supabase.from('forum_messages').insert(payload);
      if (error) throw error;
      setNewMessage('');
      setReplyingTo(null);
      fetchMessages();
    } catch (err) {
      showAlert("Gagal", "Tidak dapat mengirim pesan saat ini.", "danger");
    } finally {
      setSending(false);
    }
  };

  /**
   * Mengubah status forum (aktif/nonaktif). Hanya dapat dilakukan oleh guru.
   */
  const toggleForumStatus = async () => {
      const newStatus = !isForumActive;
      try {
          const { error } = await supabase.from('system_settings').upsert({ key: 'forum_status', value: { is_active: newStatus } });
          if (error) throw error;
          setIsForumActive(newStatus);
      } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
          showAlert("Error", `Gagal mengubah status forum: ${msg}`, "danger");
      }
  };

  /**
   * Menghapus semua pesan di forum. Hanya dapat dilakukan oleh guru setelah konfirmasi.
   */
  const handleClearForum = () => {
      showConfirm(
          "HAPUS SEMUA CHAT?",
          "PERINGATAN GURU: Tindakan ini akan menghapus SELURUH percakapan di forum kelas ini secara PERMANEN.\n\nApakah Anda yakin?",
          async () => {
              setDeleting(true);
              try {
                  const { error } = await supabase.from('forum_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                  if (error) throw error;
                  showAlert("Berhasil", "Forum telah dibersihkan.", "success");
                  setThreads([]); 
                  fetchMessages();
              } catch (err: unknown) {
                  console.error("Delete error:", err);
                  const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
                  showAlert("Gagal", `Tidak dapat membersihkan forum: ${msg}`, "danger");
              } finally {
                  setDeleting(false);
              }
          },
          "danger"
      );
  };

  /**
   * Komponen internal untuk merender satu kartu pesan forum.
   * @param {Object} props - Properti komponen MessageCard.
   * @param {ForumMessage} props.msg - Data pesan yang akan dirender.
   * @param {boolean} [props.isChild=false] - Menandakan apakah pesan ini adalah balasan (child).
   */
  const MessageCard = ({ msg, isChild = false }: { msg: ForumMessage, isChild?: boolean }) => {
      const isMe = msg.user_id === currentUserId;
      const isGuru = msg.role === 'guru';

      return (
        <div className={`flex gap-3 mb-3 ${isChild ? 'ml-12 md:ml-16 mt-1 opacity-95 scale-95 origin-left' : ''}`}>
             <div className="shrink-0 flex flex-col items-center">
                <Avatar config={msg.avatar_config} size={isChild ? 32 : 40} />
                {isGuru && (
                    <span className="mt-1 bg-macaw text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Guru</span>
                )}
            </div>
            <div className="flex-1 min-w-0">
                 <div className="flex items-baseline gap-2 mb-1">
                    <span className={`text-xs font-extrabold ${isGuru ? 'text-macaw-dark' : 'text-slate-700'}`}>
                        {msg.username}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                        {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', day: 'numeric', month: 'short'})}
                    </span>
                </div>
                <div className={`inline-block px-5 py-3 rounded-2xl font-bold text-sm border-b-4 border-2 ${isGuru ? 'bg-bee-light/20 text-slate-800 border-bee border-bee-dark' : isMe ? 'bg-macaw text-white border-macaw-dark' : 'bg-white text-slate-600 border-slate-200'}`}>
                    {msg.content}
                </div>
                
                {isForumActive && !isChild && (
                    <button onClick={() => handleReply(msg)} className="flex items-center gap-1 mt-1 text-xs font-bold text-slate-400 hover:text-macaw transition-colors">
                        <Reply size={12} /> Balas
                    </button>
                )}
            </div>
        </div>
      );
  };

  if (!configLoading && !isForumActive && userRole !== 'guru') {
      return (
          <div className="max-w-2xl mx-auto mt-20 text-center p-8">
              <div className="bg-slate-100 rounded-full w-40 h-40 flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <Lock size={60} />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-700 mb-2">Forum Dinonaktifkan</h2>
              <p className="text-slate-500 font-bold">Guru sedang menonaktifkan fitur diskusi untuk sementara waktu.</p>
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-40px)] flex flex-col pt-6 px-4">
      <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
              <div className="bg-macaw p-3 rounded-2xl text-white shadow-macaw-light shadow-lg"><MessageSquare size={24} /></div>
              <div>
                <h2 className="font-extrabold text-xl md:text-2xl text-slate-700">Diskusi Kelas</h2>
                <div className="flex items-center gap-2">
                    {!isForumActive && userRole === 'guru' && <span className="text-cardinal text-[10px] font-bold uppercase bg-cardinal-light/20 px-2 py-0.5 rounded">Nonaktif</span>}
                    <span className="text-slate-400 text-xs font-bold">{threads.length} Topik</span>
                </div>
              </div>
          </div>
          <div className="flex gap-2">
            {userRole === 'guru' && (
                <>
                    <Button variant="danger" size="sm" onClick={handleClearForum} disabled={deleting} title="Hapus Semua Chat" className="px-3 border-cardinal-dark bg-cardinal hover:bg-cardinal-dark">
                        {deleting ? <RefreshCw className="animate-spin" size={18} /> : <Trash2 size={18} />}
                    </Button>
                    <div className="w-[1px] bg-slate-200 h-8 mx-1"></div>
                    <Button variant={isForumActive ? 'ghost' : 'primary'} size="sm" onClick={toggleForumStatus} className={isForumActive ? 'text-slate-400 border-slate-200' : ''} icon={isForumActive ? <Lock size={16}/> : <Unlock size={16}/>}>
                        {isForumActive ? 'Kunci' : 'Buka'}
                    </Button>
                </>
            )}
            <button onClick={() => { fetchMessages(); fetchConfig(); }} className="p-2 md:p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-400 hover:text-macaw hover:bg-white transition-all">
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
      </div>

      <div className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-3xl overflow-hidden flex flex-col shadow-inner relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 scroll-smooth">
            {threads.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-300">
                    <MessageSquare size={60} className="mb-4 opacity-50" />
                    <p className="font-bold text-lg">Belum ada diskusi.</p>
                    <p className="text-sm">Mulai percakapan baru sekarang!</p>
                </div>
            ) : (
                threads.map((parent) => (
                    <div key={parent.id} className="relative group">
                        <MessageCard msg={parent} />
                        {parent.replies.length > 0 && <div className="absolute left-[20px] top-[45px] bottom-4 w-[2px] bg-slate-200 -z-10"></div>}
                        <div className="space-y-2 mt-2">
                            {parent.replies.map(reply => (
                                <div key={reply.id} className="relative">
                                     <div className="absolute left-[20px] top-[-10px] w-6 h-6 border-b-[2px] border-l-[2px] border-slate-200 rounded-bl-xl -z-10"></div>
                                     <MessageCard msg={reply} isChild={true} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
            <div className="h-4"></div>
        </div>

        {replyingTo && (
            <div className="absolute bottom-[90px] left-4 right-4 bg-slate-800 text-white p-3 rounded-xl flex justify-between items-center shadow-2xl z-20 animate-in slide-in-from-bottom-2 fade-in">
                <div className="flex items-center gap-3 overflow-hidden">
                    <Reply size={20} className="text-macaw shrink-0" />
                    <div className="text-sm truncate">
                        <span className="block font-bold text-xs text-macaw mb-0.5">Membalas {replyingTo.username}</span>
                        <span className="opacity-80 truncate text-xs block">{replyingTo.content}</span>
                    </div>
                </div>
                <button onClick={() => setReplyingTo(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={16} /></button>
            </div>
        )}

        <div className="p-4 bg-white border-t-2 border-slate-200 z-30">
            <form onSubmit={handleSend} className="flex gap-3 items-end">
                <input ref={inputRef} type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={isForumActive ? (replyingTo ? `Tulis balasan...` : "Tulis pertanyaan atau diskusi...") : "Forum dikunci..."} className={`flex-1 px-5 py-4 bg-slate-100 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-macaw focus:bg-white font-bold text-slate-700 placeholder-slate-400 transition-all ${replyingTo ? 'pl-4 border-l-4 border-l-macaw' : ''}`} disabled={sending || !isForumActive} />
                <Button type="submit" disabled={sending || !newMessage.trim() || !isForumActive} className="h-[58px] px-6 shadow-xl">
                    <Send size={28} className={sending ? 'animate-pulse' : ''} />
                </Button>
            </form>
        </div>
      </div>
    </div>
  );
};