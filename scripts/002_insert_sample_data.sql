-- Insert some sample participants for testing
INSERT INTO public.participants (username) VALUES 
  ('admin'),
  ('testuser1'),
  ('testuser2')
ON CONFLICT (username) DO NOTHING;

-- Insert sample survey response for testing
INSERT INTO public.survey_responses (
  participant_id,
  username,
  answers,
  total_score,
  max_possible_score,
  percentage_score,
  result_category
) 
SELECT 
  p.id,
  'testuser1',
  '{"q1": {"answer": "A", "score": 3}, "q2": {"answer": "B", "score": 2}, "q3": {"answer": "A", "score": 3}}'::jsonb,
  8,
  15,
  53.33,
  'Good'
FROM public.participants p 
WHERE p.username = 'testuser1'
ON CONFLICT DO NOTHING;
