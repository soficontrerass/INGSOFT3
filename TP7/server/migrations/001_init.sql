-- ...existing code...
CREATE TABLE IF NOT EXISTS forecasts (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  value NUMERIC
);
-- ...existing code...