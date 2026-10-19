-- Migration: Initial Schema for Luat Le (Anonymous Nickname, Weekly XP, Challenges, Comments)
-- Date: 2026-10-19
-- To execute: Paste into Supabase SQL Editor and click Run

-- 1. Players Table
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  school TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read players" ON public.players;
CREATE POLICY "Anyone can read players" ON public.players
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.players;
CREATE POLICY "Users can insert their own profile" ON public.players
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.players;
CREATE POLICY "Users can update their own profile" ON public.players
  FOR UPDATE USING (auth.uid() = id);

-- 2. Weekly XP Table
CREATE TABLE IF NOT EXISTS public.weekly_xp (
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (player_id, week_start)
);

ALTER TABLE public.weekly_xp ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read weekly_xp" ON public.weekly_xp;
CREATE POLICY "Anyone can read weekly_xp" ON public.weekly_xp
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own weekly_xp" ON public.weekly_xp;
CREATE POLICY "Users can manage their own weekly_xp" ON public.weekly_xp
  FOR ALL USING (auth.uid() = player_id);

-- 3. Challenges Table
CREATE TABLE IF NOT EXISTS public.challenges (
  id TEXT PRIMARY KEY,
  creator_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  item_ids TEXT[] NOT NULL,
  creator_score INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read challenges" ON public.challenges;
CREATE POLICY "Anyone can read challenges" ON public.challenges
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create challenge" ON public.challenges;
CREATE POLICY "Users can create challenge" ON public.challenges
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- 4. Challenge Results Table
CREATE TABLE IF NOT EXISTS public.challenge_results (
  id BIGSERIAL PRIMARY KEY,
  challenge_id TEXT REFERENCES public.challenges(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.challenge_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read challenge results" ON public.challenge_results;
CREATE POLICY "Anyone can read challenge results" ON public.challenge_results
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can submit their challenge result" ON public.challenge_results;
CREATE POLICY "Users can submit their challenge result" ON public.challenge_results
  FOR INSERT WITH CHECK (auth.uid() = player_id);

-- 5. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id BIGSERIAL PRIMARY KEY,
  item_id TEXT NOT NULL,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  body VARCHAR(500) NOT NULL,
  hidden BOOLEAN NOT NULL DEFAULT false,
  reports INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read visible comments" ON public.comments;
CREATE POLICY "Anyone can read visible comments" ON public.comments
  FOR SELECT USING (hidden = false);

DROP POLICY IF EXISTS "Users can insert their own comment" ON public.comments;
CREATE POLICY "Users can insert their own comment" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = player_id);

DROP POLICY IF EXISTS "Users can update reports on comments" ON public.comments;
CREATE POLICY "Users can update reports on comments" ON public.comments
  FOR UPDATE USING (true) WITH CHECK (true);
