-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  city TEXT,
  avatar_url TEXT,
  level TEXT DEFAULT 'Nexus Member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Notifications (created BEFORE handle_new_user since function references it)
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info','success','warning')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own notifications select" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own notifications insert" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own notifications update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Own notifications delete" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_notifications_user_created ON public.notifications(user_id, created_at DESC);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, city)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'city', 'Bengaluru')
  );
  INSERT INTO public.notifications (user_id, type, title, body)
  VALUES (NEW.id, 'success', 'Welcome to Nexus', 'Your unified super app is ready. Tap any service to begin.');
  RETURN NEW;
END; $$;

-- Activity feed
CREATE TABLE public.activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  title TEXT NOT NULL,
  meta TEXT,
  amount TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','ongoing','scheduled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own activity select" ON public.activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own activity insert" ON public.activity FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own activity update" ON public.activity FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Own activity delete" ON public.activity FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_activity_user_created ON public.activity(user_id, created_at DESC);

-- Now create the trigger (after notifications exists since handle_new_user references it)
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.activity REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity;