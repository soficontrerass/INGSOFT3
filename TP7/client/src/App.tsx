import React, { useEffect, useState } from 'react';
import { RecentSearches } from './components/RecentSearches';
import { CacheStatus } from './components/CacheStatus';
import { FavoritesPage } from './pages/Favorites';

type Forecast = {
  date: string;
  temperatureC: number;
  summary: string;
};

type CacheResponse = {
  data: unknown;
  cached: boolean;
  cachedAt?: string;
};

const API = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8080';

const normalizeForecasts = (payload: unknown): Forecast[] => {
  const list = Array.isArray(payload) ? payload : payload ? [payload] : [];

  return list
    .map((item: any) => {
      const raw = item?.value ?? item;
      const date = raw?.date ?? item?.date ?? item?.created_at ?? new Date().toISOString();
      const temperature = raw?.temperatureC ?? raw?.temp ?? raw?.temperature ?? null;
      const summary = raw?.summary ?? raw?.s ?? raw?.desc ?? '';

      return {
        date,
        temperatureC: temperature,
        summary,
      } as Forecast;
    })
    .filter((f) => Boolean(f.date) && (f.temperatureC !== null || Boolean(f.summary)));
};

export default function App() {
  const [items, setItems] = useState<Forecast[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cachedAt, setCachedAt] = useState<string | undefined>(undefined);
  const [isCached, setIsCached] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<'home' | 'favorites'>('home');

  // Load favorites from API on mount
  const loadFavorites = async () => {
    try {
      const res = await fetch(`${API}/api/favorites`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setFavorites(list.map((f: any) => f?.city).filter(Boolean));
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const fetchForecast = async (city?: string, useCache?: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = city
        ? `${API}/api/forecasts?city=${encodeURIComponent(city)}&useCache=${useCache ?? true}`
        : `${API}/weatherforecast`;

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json() as CacheResponse | unknown;
      
      // Handle cache response format
      if (data && typeof data === 'object' && 'cached' in data) {
        const cacheData = data as CacheResponse;
        setItems(normalizeForecasts(cacheData.data));
        setIsCached(cacheData.cached);
        setCachedAt(cacheData.cachedAt);
      } else {
        setItems(normalizeForecasts(data));
        setIsCached(false);
        setCachedAt(undefined);
      }
      
      if (city) {
        setSelectedCity(city);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Load default forecast on mount
  useEffect(() => {
    fetchForecast();
  }, []);

  const handleAddToFavorites = async () => {
    if (!selectedCity) {
      setError('No city selected');
      return;
    }

    try {
      const res = await fetch(`${API}/api/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: selectedCity })
      });

      if (!res.ok && res.status !== 409) {
        throw new Error(`Failed to add favorite: ${res.status}`);
      }

      // Reload favorites from API to stay in sync
      await loadFavorites();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add favorite');
    }
  };

  const handleRefresh = async () => {
    if (selectedCity) {
      await fetchForecast(selectedCity, false); // Force refresh by not using cache
    } else {
      await fetchForecast();
    }
  };

  if (currentPage === 'favorites') {
    return (
      <div style={{ fontFamily: 'Arial, sans-serif', padding: '16px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setCurrentPage('home')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff', // azul: #007bff, rojo: #ff6b6b
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '8px'
            }}
          >
            ← Back to Forecasts
          </button>
        </div>
        <FavoritesPage 
          onCitySelect={(city) => {
            setSelectedCity(city);
            setCurrentPage('home');
            fetchForecast(city);
          }}
          onFavoriteRemoved={() => loadFavorites()}
        />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '16px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>🌤️ Weather Forecast</h1>
      <p style={{ fontSize: '12px', color: '#666' }}>API: {API}</p>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setCurrentPage('favorites')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '8px'
          }}
        >
          ⭐ Favorites {favorites.length > 0 && `(${favorites.length})`}
        </button>
        {selectedCity && favorites.includes(selectedCity) && (
          <span style={{ marginLeft: '8px', color: '#ffc107', fontWeight: 'bold' }}>
            ⭐ Added to favorites
          </span>
        )}
      </div>

      <RecentSearches
        onSearchSelect={(city) => fetchForecast(city)}
        onSearch={(city) => fetchForecast(city)}
      />

      {error && (
        <div style={{
          color: 'white',
          backgroundColor: '#dc3545',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '12px'
        }}>
          Error: {error}
        </div>
      )}

      {selectedCity && (
        <div style={{
          backgroundColor: '#e7f3ff',
          border: '1px solid #b3d9ff',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>📍 {selectedCity}</span>
          {!favorites.includes(selectedCity) && (
            <button
              onClick={handleAddToFavorites}
              style={{
                padding: '6px 12px',
                backgroundColor: '#ffc107',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ⭐ Add to Favorites
            </button>
          )}
        </div>
      )}

      {(isCached || cachedAt) && (
        <CacheStatus
          cachedAt={cachedAt}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />
      )}

      {isLoading && !items && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          ⏳ Loading forecast...
        </div>
      )}

      {items && items.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '16px',
          marginTop: '20px'
        }}>
          {items.map((f, i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ fontSize: '18px', marginBottom: '8px', fontWeight: 'bold' }}>
                📅 {new Date(f.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              <div style={{ fontSize: '24px', marginBottom: '8px', color: '#007bff' }}>
                🌡️ {f.temperatureC}°C
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>
                ☁️ {f.summary}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!items || items.length === 0) && !error && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px'
        }}>
          No forecast data available
        </div>
      )}
    </div>
  );
}