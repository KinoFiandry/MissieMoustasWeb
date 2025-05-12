// backend/server.js
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import authRoutes     from './routes/auth.js';
import adminUserRoutes from './routes/admin.users.js';
import messageRoutes  from './routes/messages.js';
import usersRoutes from './routes/users.js';
import cors from 'cors';

await mongoose.connect(process.env.MONGO_URI);

const app = express();
app.get('/health', (_, res) => res.json({ status: 'OK' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({ origin: 'http://localhost:3000' }));
// Endpoints
app.use('/auth', authRoutes);
app.use('/admin/users', adminUserRoutes);
app.use('/messages', messageRoutes);
app.use('/users', usersRoutes); 

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGO_URI).then(() => {
    app.listen(process.env.PORT || 3001);
  });
}
// Lancement
/* const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Backend démarré sur le port ${port}`)); */

export default app;
