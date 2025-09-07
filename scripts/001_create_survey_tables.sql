-- Create participants table for username validation
CREATE TABLE IF NOT EXISTS public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey_responses table to store quiz results
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  answers JSONB NOT NULL, -- Store all answers as JSON
  total_score INTEGER NOT NULL,
  max_possible_score INTEGER NOT NULL,
  percentage_score DECIMAL(5,2) NOT NULL,
  result_category TEXT NOT NULL, -- e.g., "Excellent", "Good", "Needs Improvement"
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for participants table
-- Allow anyone to read participants (for username validation)
CREATE POLICY "Allow public read access to participants" 
  ON public.participants FOR SELECT 
  USING (true);

-- Allow anyone to insert new participants
CREATE POLICY "Allow public insert to participants" 
  ON public.participants FOR INSERT 
  WITH CHECK (true);

-- Create policies for survey_responses table
-- Allow anyone to read survey responses (for admin view)
CREATE POLICY "Allow public read access to survey_responses" 
  ON public.survey_responses FOR SELECT 
  USING (true);

-- Allow anyone to insert survey responses
CREATE POLICY "Allow public insert to survey_responses" 
  ON public.survey_responses FOR INSERT 
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participants_username ON public.participants(username);
CREATE INDEX IF NOT EXISTS idx_survey_responses_participant_id ON public.survey_responses(participant_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_completed_at ON public.survey_responses(completed_at DESC);
