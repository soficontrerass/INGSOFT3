import React, { useState } from 'react';

function App() {
  const [msg, setMsg] = useState('');

  const getMessage = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/message');
      const data = await res.json();
      setMsg(data.message);
    } catch (error) {
      setMsg('Error al conectar con el backend');
    }
  };

  return (
    <div>
      <h1>TP4 Frontend</h1>
      <button onClick={getMessage}>Obtener mensaje del backend</button>
      <p>{msg}</p>
      <p>¡Prueba workflow!</p>
    </div>
  );
}

export default App;