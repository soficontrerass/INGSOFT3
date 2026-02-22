import React, { useEffect, useState } from 'react';

interface RecentSearchesProps {
  onSearchSelect: (city: string) => void;
  onSearch: (city: string) => Promise<void>;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({ onSearchSelect, onSearch }) => {
  const [searches, setSearches] = useState<{ city: string; searched_at: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const API = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8080';

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const res = await fetch(`${API}/api/searches`);
      if (res.ok) {
        const data = await res.json();
        setSearches(data);
      }
    } catch (err) {
      console.error('Failed to load recent searches:', err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsLoading(true);
    try {
      await onSearch(inputValue);
      onSearchSelect(inputValue);
      setInputValue('');
      // Reload searches after new search
      await loadRecentSearches();
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search for a city..."
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px'
          }}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {searches.length > 0 && (
        <div style={{
          backgroundColor: '#f9f9f9',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '8px',
          maxHeight: '150px',
          overflow: 'auto'
        }}>
          <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '12px', color: '#666' }}>
            Recent Searches
          </h4>
          {searches.map((s) => (
            <div
              key={s.city}
              onClick={() => onSearchSelect(s.city)}
              style={{
                padding: '6px 8px',
                cursor: 'pointer',
                backgroundColor: 'white',
                marginBottom: '4px',
                borderRadius: '3px',
                fontSize: '13px',
                userSelect: 'none',
                ':hover': {
                  backgroundColor: '#f0f0f0'
                }
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'white')}
            >
              📍 {s.city}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
