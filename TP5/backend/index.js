const express = require('express');
const app = express();
const cors = require('cors');
const { Client } = require('pg'); // npm install pg

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const DB_CONN = process.env.DB_CONN || '';

app.get('/health', async (req, res) => {
  if (!DB_CONN) return res.status(200).send('OK');
  try {
    const client = new Client({ connectionString: DB_CONN, ssl: { rejectUnauthorized: false }});
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    return res.status(200).send('OK');
  } catch (err) {
    console.error('DB health error', err.message || err);
    return res.status(500).send('DB error');
  }
});

app.get('/api/messages', async (req, res) => {
  if (!DB_CONN) return res.json({ messages: ['Mensaje local 1', 'Mensaje local 2'] });
  try {
    const client = new Client({ connectionString: DB_CONN, ssl: { rejectUnauthorized: false }});
    await client.connect();
    const r = await client.query('SELECT text FROM messages ORDER BY id LIMIT 50');
    await client.end();
    return res.json({ messages: r.rows.map(row => row.text) });
  } catch (err) {
    console.error('DB query error', err);
    return res.status(500).json({ error: 'DB error' });
  }
});

app.listen(PORT, '0.0.0.0', () => console.log(`Servidor escuchando en ${PORT}`));