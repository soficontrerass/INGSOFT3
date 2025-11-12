// ...existing code...
import React, { useEffect, useState } from 'react';
import { getApiUrl } from './utils/getApiUrl';

const API = getApiUrl();

type Forecast = {
  date: string;
  temperatureC: number;
  summary: string;
};

export default function App() {
  const [items, setItems] = useState<Forecast[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/weatherforecast`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Forecast[]) => setItems(data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 16 }}>
      <h1>TP5 - Weather Forecast</h1>
      <p>API utilizada: {API}</p>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      {!items && !error && <div>Cargando...</div>}
      {items && (
        <ul>
          {items.map((f) => (
            <li key={f.date}>
              <strong>{new Date(f.date).toLocaleDateString()}</strong> — {f.temperatureC}°C — {f.summary}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
// ...existing code...