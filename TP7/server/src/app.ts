// ...existing code...
import express from 'express';
import apiRouter from './routes/api';

const app = express();
app.use(express.json());

// monta tu API en /api para que supertest la pueda consumir sin levantar el servidor
app.use('/api', apiRouter);

// root redirect / info debe estar en app para que los tests que importan app lo vean
const CLIENT_URL = process.env.CLIENT_URL || 'https://tp6-client-PLACEHOLDER.a.run.app';
if (process.env.NODE_ENV === 'production') {
  app.get('/', (_req, res) => res.redirect(CLIENT_URL));
} else {
  app.get('/', (_req, res) => res.send('Server running. Use the client UI to interact.'));
}

export default app;
// ...existing code...