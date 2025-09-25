const express = require('express');
const app = express();
const PORT = 3001;
const cors = require('cors');
app.use(cors());

app.get('/', (req, res) => {
  res.send('TP4 Backend - ¡Hola desde Express!');
});

app.get('/api/messages', (req, res) => {
  res.json({
    messages: [
      '¡Hola desde el backend TP4!',
      '¡Este es otro mensaje!',
      '¡Funciona la integración!'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});