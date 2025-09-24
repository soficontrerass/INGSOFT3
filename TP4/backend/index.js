const express = require('express');
const app = express();
const PORT = 3001;

app.get('/', (req, res) => {
  res.send('TP4 Backend - ¡Hola desde Express!');
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});