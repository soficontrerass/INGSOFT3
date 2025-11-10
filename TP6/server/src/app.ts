// ...existing code...
import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', apiRouter);

export default app;