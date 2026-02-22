-- TP7 Migration 002: Add searches, favorites, and forecast_cache tables

-- Searches table: track user search history
CREATE TABLE IF NOT EXISTS searches (
  id SERIAL PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_searches_city_timestamp ON searches(city, searched_at DESC);

-- Favorites table: persistent bookmarked cities
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  city VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_favorites_city ON favorites(city);

-- Forecast cache: minimize API calls to external weather service
CREATE TABLE IF NOT EXISTS forecast_cache (
  id SERIAL PRIMARY KEY,
  city VARCHAR(100) NOT NULL UNIQUE,
  forecast_data JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT now() + INTERVAL '1 hour'
);

CREATE INDEX IF NOT EXISTS idx_forecast_cache_city ON forecast_cache(city);
CREATE INDEX IF NOT EXISTS idx_forecast_cache_expires ON forecast_cache(expires_at);
