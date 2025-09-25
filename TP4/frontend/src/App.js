import React, { useState } from 'react';

function App() {
  const [messages, setMessages] = useState([]);

  const getMessages = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/messages');
      const data = await res.json();
      setMessages(data.messages);
    } catch (error) {
      setMessages(['Error al conectar con el backend']);
    }
  };

  return (
    <div>
      <h1>TP4 Frontend</h1>
      <button onClick={getMessages}>Obtener mensajes del backend</button>
      <ul>
        {messages.map((msg, idx) => (
          <li key={idx}>{msg}</li>
        ))}
      </ul>
      <p>¡Prueba workflow!</p>
    </div>
  );
}

export default App;