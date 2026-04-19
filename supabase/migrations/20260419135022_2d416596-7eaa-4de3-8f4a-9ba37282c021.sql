-- Scan history: stores every successful AI shoe identification per user
CREATE TABLE public.scan_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shoe_name TEXT NOT NULL,
  brand TEXT,
  colorway TEXT,
  silhouette TEXT,
  confidence INTEGER,
  estimated_price TEXT,
  photo_data_url TEXT,
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_scan_history_user_scanned ON public.scan_history(user_id, scanned_at DESC);

ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own scan history"
ON public.scan_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own scan history"
ON public.scan_history FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete their own scan history"
ON public.scan_history FOR DELETE
TO authenticated
USING (auth.uid() = user_id);