import React, { useState } from 'react';

function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const getMessages = async () => {
    setLoading(true);
    try {
      const base = process.env.REACT_APP_BACKEND_URL || '';
      const url = base ? `${base.replace(/\/$/, '')}/api/messages` : '/api/messages';
      const res = await fetch(url);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      setMessages(['Error al conectar con el backend']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>TP4 Frontend</h1>
      <button onClick={getMessages} disabled={loading}>
        {loading ? 'Cargando...' : 'Obtener mensajes del backend'}
      </button>
      <ul>
        {messages.map((m, i) => <li key={i}>{m}</li>)}
      </ul>
    </div>
  );
}

export default App;