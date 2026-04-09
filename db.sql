-- ================================================================
-- MASTER DB SETUP - LOGI MATH (SAFE MIGRATION / NO DATA LOSS)
-- Script ini aman dijalankan berulang kali tanpa menghapus data.
-- ================================================================

-- 1. SETUP EXTENSION & FUNGSI HELPER
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- FUNGSI KRUSIAL: IS_GURU
-- Security definer agar bisa bypass RLS saat cek role
CREATE OR REPLACE FUNCTION public.is_guru()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users_data 
    WHERE id = auth.uid() AND role = 'guru'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 2. CREATE TABLES (IF NOT EXISTS)
-- Hanya membuat tabel jika belum ada. Data lama AMAN.
-- ================================================================

-- USERS_DATA
CREATE TABLE IF NOT EXISTS public.users_data (
    id UUID PRIMARY KEY,
    email TEXT,
    username TEXT,
    role TEXT CHECK (role IN ('guru', 'siswa')),
    grade TEXT DEFAULT '8',
    password_plain TEXT, 
    is_active BOOLEAN DEFAULT true,
    level INTEGER DEFAULT 1,
    exp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    completed_lessons TEXT[] DEFAULT '{}',
    avatar_config JSONB DEFAULT '{"bgColor": "#58cc02", "eyes": 0, "mouth": 0}',
    has_completed_pretest BOOLEAN DEFAULT false, -- Pastikan kolom ini ada
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Pastikan index ada
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users_data(role);
CREATE INDEX IF NOT EXISTS idx_users_exp ON public.users_data(exp DESC);
ALTER TABLE public.users_data ENABLE ROW LEVEL SECURITY;

-- ACTIVITY_LOGS
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    username TEXT, 
    action_type TEXT, 
    details TEXT, 
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON public.activity_logs(created_at DESC);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- FORUM_MESSAGES
CREATE TABLE IF NOT EXISTS public.forum_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    parent_id UUID,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.forum_messages REPLICA IDENTITY FULL;
ALTER TABLE public.forum_messages ENABLE ROW LEVEL SECURITY;

-- GAME_ROOMS
CREATE TABLE IF NOT EXISTS public.game_rooms (
    code TEXT PRIMARY KEY, 
    created_by UUID,
    game_type TEXT DEFAULT 'maze',
    player_1_id UUID,
    player_2_id UUID,
    player_1_name TEXT,
    player_2_name TEXT,
    score_p1 INTEGER DEFAULT 0,
    score_p2 INTEGER DEFAULT 0,
    mode TEXT,
    status TEXT DEFAULT 'waiting',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.game_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;

-- SYSTEM_SETTINGS
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
-- Insert default hanya jika belum ada
INSERT INTO public.system_settings (key, value) VALUES ('forum_status', '{"is_active": true}') ON CONFLICT DO NOTHING;

-- ================================================================
-- 3. UPDATE CONSTRAINTS (SAFE ALTER)
-- Bagian ini memperbaiki Foreign Key agar fitur DELETE CASCADE bekerja.
-- Menggunakan blok DO untuk handle error jika constraint belum ada.
-- ================================================================

DO $$ 
BEGIN
  -- 1. Fix users_data -> auth.users
  BEGIN
    ALTER TABLE public.users_data DROP CONSTRAINT IF EXISTS users_data_id_fkey;
    ALTER TABLE public.users_data 
      ADD CONSTRAINT users_data_id_fkey 
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  -- 2. Fix activity_logs -> users_data
  BEGIN
    ALTER TABLE public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;
    ALTER TABLE public.activity_logs 
      ADD CONSTRAINT activity_logs_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public.users_data(id) ON DELETE CASCADE;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  -- 3. Fix forum_messages -> users_data
  BEGIN
    ALTER TABLE public.forum_messages DROP CONSTRAINT IF EXISTS forum_messages_user_id_fkey;
    ALTER TABLE public.forum_messages 
      ADD CONSTRAINT forum_messages_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public.users_data(id) ON DELETE CASCADE;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  -- 4. Fix forum_messages parent -> self
  BEGIN
    ALTER TABLE public.forum_messages DROP CONSTRAINT IF EXISTS forum_messages_parent_id_fkey;
    ALTER TABLE public.forum_messages 
      ADD CONSTRAINT forum_messages_parent_id_fkey 
      FOREIGN KEY (parent_id) REFERENCES public.forum_messages(id) ON DELETE CASCADE;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  -- 5. Fix game_rooms -> users_data (Created By)
  BEGIN
    ALTER TABLE public.game_rooms DROP CONSTRAINT IF EXISTS game_rooms_created_by_fkey;
    ALTER TABLE public.game_rooms 
      ADD CONSTRAINT game_rooms_created_by_fkey 
      FOREIGN KEY (created_by) REFERENCES public.users_data(id) ON DELETE CASCADE;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  -- 6. Fix game_rooms -> users_data (Player 1)
  BEGIN
    ALTER TABLE public.game_rooms DROP CONSTRAINT IF EXISTS game_rooms_player_1_id_fkey;
    ALTER TABLE public.game_rooms 
      ADD CONSTRAINT game_rooms_player_1_id_fkey 
      FOREIGN KEY (player_1_id) REFERENCES public.users_data(id) ON DELETE CASCADE;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  -- 7. Fix game_rooms -> users_data (Player 2 - Set Null)
  BEGIN
    ALTER TABLE public.game_rooms DROP CONSTRAINT IF EXISTS game_rooms_player_2_id_fkey;
    ALTER TABLE public.game_rooms 
      ADD CONSTRAINT game_rooms_player_2_id_fkey 
      FOREIGN KEY (player_2_id) REFERENCES public.users_data(id) ON DELETE SET NULL;
  EXCEPTION WHEN OTHERS THEN NULL; END;

END $$;

-- ================================================================
-- 4. ADD MISSING COLUMNS (SAFE ALTER)
-- ================================================================
DO $$
BEGIN
    BEGIN
        ALTER TABLE public.users_data ADD COLUMN has_completed_pretest BOOLEAN DEFAULT false;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;

-- ================================================================
-- 5. POLICIES (DROP & RECREATE)
-- Menghapus policy tidak menghapus data, hanya aturan aksesnya.
-- Ini memastikan policy terbaru terupdate.
-- ================================================================

-- users_data
DROP POLICY IF EXISTS "Public Read Users" ON public.users_data;
DROP POLICY IF EXISTS "Insert Self" ON public.users_data;
DROP POLICY IF EXISTS "Update Self" ON public.users_data;
DROP POLICY IF EXISTS "Guru Full Control" ON public.users_data;
DROP POLICY IF EXISTS "Public Access Users" ON public.users_data;

CREATE POLICY "Public Read Users" ON public.users_data FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Insert Self" ON public.users_data FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Update Self" ON public.users_data FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Guru Full Control" ON public.users_data FOR ALL USING (public.is_guru());

-- activity_logs
DROP POLICY IF EXISTS "Read Logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Insert Logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Guru Delete Logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Public Access Logs" ON public.activity_logs;

CREATE POLICY "Read Logs" ON public.activity_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Insert Logs" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Guru Delete Logs" ON public.activity_logs FOR DELETE USING (public.is_guru());

-- forum_messages
DROP POLICY IF EXISTS "Read Forum" ON public.forum_messages;
DROP POLICY IF EXISTS "Insert Forum" ON public.forum_messages;
DROP POLICY IF EXISTS "Delete Forum" ON public.forum_messages;
DROP POLICY IF EXISTS "Public Access Forum" ON public.forum_messages;

CREATE POLICY "Read Forum" ON public.forum_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Insert Forum" ON public.forum_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Delete Forum" ON public.forum_messages FOR DELETE USING (auth.uid() = user_id OR public.is_guru());

-- game_rooms
DROP POLICY IF EXISTS "Read Rooms" ON public.game_rooms;
DROP POLICY IF EXISTS "Create Room" ON public.game_rooms;
DROP POLICY IF EXISTS "Update Room" ON public.game_rooms;
DROP POLICY IF EXISTS "Delete Room" ON public.game_rooms;
DROP POLICY IF EXISTS "Public Access Rooms" ON public.game_rooms;

CREATE POLICY "Read Rooms" ON public.game_rooms FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Create Room" ON public.game_rooms FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Update Room" ON public.game_rooms FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Delete Room" ON public.game_rooms FOR DELETE USING (auth.uid() = created_by OR public.is_guru());

-- system_settings
DROP POLICY IF EXISTS "Read Settings" ON public.system_settings;
DROP POLICY IF EXISTS "Guru Update Settings" ON public.system_settings;
DROP POLICY IF EXISTS "Public Access Settings" ON public.system_settings;

CREATE POLICY "Read Settings" ON public.system_settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Guru Update Settings" ON public.system_settings FOR UPDATE USING (public.is_guru());

-- ================================================================
-- 6. REALTIME
-- ================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
  
  -- Add tables safely
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_messages; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.users_data; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
