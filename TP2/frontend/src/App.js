import React, { useState, useEffect } from 'react';

function App() {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [env, setEnv] = useState('qa');

  const apiUrl = `http://localhost:${env === 'qa' ? '3001' : '3002'}/mensajes`;

  useEffect(() => {
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => setMensajes(data))
      .catch(() => setMensajes([]));
  }, [env, apiUrl]);

  const enviarMensaje = async () => {
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensaje: nuevoMensaje })
    });
    setNuevoMensaje('');
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => setMensajes(data));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Mensajes ({env.toUpperCase()})</h2>
      <button onClick={() => setEnv(env === 'qa' ? 'prod' : 'qa')}>
        Cambiar a {env === 'qa' ? 'PROD' : 'QA'}
      </button>
      <ul>
        {mensajes.map((m, i) => <li key={i}>{m.mensaje}</li>)}
      </ul>
      <input
        value={nuevoMensaje}
        onChange={e => setNuevoMensaje(e.target.value)}
        placeholder="Nuevo mensaje"
      />
      <button onClick={enviarMensaje}>Agregar</button>
    </div>
  );
}

export default App;