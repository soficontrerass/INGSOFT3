const express = require('express');
const cors = require('cors'); 
const { Pool } = require('pg');
const app = express();

app.use(cors()); 
app.use(express.json());


const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'clave123',
  database: process.env.DB_NAME || 'postgres',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
});

app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.get('/mensajes', async (req, res) => {
  try {
    const result = await pool.query('SELECT mensaje FROM tabla_a');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/mensajes', async (req, res) => {
  try {
    const { mensaje } = req.body;
    if (!mensaje) return res.status(400).json({ error: 'Mensaje requerido' });
    await pool.query('INSERT INTO tabla_a (mensaje) VALUES ($1)', [mensaje]);
    res.status(201).json({ message: 'Mensaje agregado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log(`API corriendo en puerto 3000 (${process.env.NODE_ENV})`);
});