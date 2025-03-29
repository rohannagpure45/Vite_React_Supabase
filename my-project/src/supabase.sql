-- Create health_records table
CREATE TABLE IF NOT EXISTS public.health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight NUMERIC(5,2) NOT NULL,
  heart_rate INTEGER NOT NULL,
  blood_pressure TEXT NOT NULL,
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own records
CREATE POLICY "Users can view their own health records"
  ON public.health_records
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own records
CREATE POLICY "Users can insert their own health records"
  ON public.health_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own records
CREATE POLICY "Users can update their own health records"
  ON public.health_records
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own records
CREATE POLICY "Users can delete their own health records"
  ON public.health_records
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS health_records_user_id_idx ON public.health_records (user_id);

-- Add some example data (uncomment and modify if you want to use this)
-- INSERT INTO public.health_records (user_id, weight, heart_rate, blood_pressure, notes)
-- VALUES 
--   ('USER_ID_HERE', 72.5, 68, '120/80', 'Morning reading, feeling good'),
--   ('USER_ID_HERE', 72.3, 72, '118/78', 'Evening reading after workout'); 