import express from 'express';
import apiRouter from './routes/api';

const app = express();
app.use(express.json());

// monta tu API en /api para que supertest la pueda consumir sin levantar el servidor
app.use('/api', apiRouter);

export default app;