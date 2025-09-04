// filepath: index.js
const express = require('express');
const { Pool } = require('pg');
const app = express();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: 'postgres',
  password: process.env.DB_PASSWORD || 'clave123',
  database: process.env.DB_NAME || 'postgres',
  port: 5432,
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

app.listen(3000, () => {
  console.log('API corriendo en puerto 3000');
});