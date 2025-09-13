import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import tenantRoutes from './routes/tenants.routes.js';
import notesRoutes from './routes/notes.routes.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', healthRoute);
app.use('/auth', authRoutes);
app.use('/tenants', tenantRoutes);
app.use('/notes', notesRoutes);

export { app };
