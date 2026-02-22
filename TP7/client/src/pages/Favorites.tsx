import React, { useEffect, useState } from 'react';

interface Favorite {
  id: number;
  city: string;
  created_at: string;
}

interface FavoritesPageProps {
  onCitySelect: (city: string) => void;
  onFavoriteRemoved?: () => void;
}

const API = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8080';

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ onCitySelect, onFavoriteRemoved }) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API}/api/favorites`);
      if (res.ok) {
        const data = await res.json();
        setFavorites(Array.isArray(data) ? data : []);
      } else {
        setError('Failed to load favorites');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (city: string) => {
    if (!confirm(`Remove ${city} from favorites?`)) return;

    try {
      const res = await fetch(`${API}/api/favorites/${city}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setFavorites(favorites.filter(f => f.city !== city));
        onFavoriteRemoved?.();
      } else {
        setError('Failed to remove favorite');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove favorite');
    }
  };

  const handleSelect = (city: string) => {
    onCitySelect(city);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>⭐ My Favorite Cities</h2>

      {error && (
        <div style={{ color: 'red', marginBottom: '12px', padding: '8px', backgroundColor: '#ffe0e0', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {isLoading && <div>Loading favorites...</div>}

      {!isLoading && favorites.length === 0 && (
        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', textAlign: 'center', borderRadius: '4px', color: '#666' }}>
          No favorite cities yet. Add one from the main page!
        </div>
      )}

      {favorites.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          {favorites.map((fav) => (
            <div
              key={fav.id}
              style={{
                backgroundColor: '#f0f8ff',
                border: '2px solid #007bff',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                onClick={() => handleSelect(fav.city)}
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#007bff'
                }}
              >
                📍 {fav.city}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Added: {new Date(fav.created_at).toLocaleDateString()}
              </div>
              <button
                onClick={() => handleRemove(fav.city)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Remove ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
