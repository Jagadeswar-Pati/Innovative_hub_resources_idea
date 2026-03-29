import 'dotenv/config'; // Load .env BEFORE any module that needs process.env (e.g. Cloudinary)
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './modules/resourcesHub/routes/auth.routes.js';
import profileRoutes from './modules/resourcesHub/routes/profile.routes.js';
import postRoutes from './modules/resourcesHub/routes/post.routes.js';
import projectRoutes from './modules/resourcesHub/routes/project.routes.js';
import communityRoutes from './modules/resourcesHub/routes/community.routes.js';
import searchRoutes from './modules/resourcesHub/routes/search.routes.js';
import likeRoutes from './modules/resourcesHub/routes/like.routes.js';
import commentRoutes from './modules/resourcesHub/routes/comment.routes.js';
import collaborationRoutes from './modules/resourcesHub/routes/collaboration.routes.js';
import messageRoutes from './modules/resourcesHub/routes/message.routes.js';
import adminRoutes from './modules/resourcesHub/routes/admin.routes.js';
import notificationRoutes from './modules/resourcesHub/routes/notification.routes.js';

connectDB();

const app = express();

app.use(express.json());

const rawCors = process.env.CORS_ORIGIN || process.env.RESOURCES_CORS_ORIGIN || 'http://localhost:5174';
const allowedOrigins = rawCors === '*' ? ['*'] : rawCors.split(',').map((s) => s.trim()).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*')) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.get('/api/health', (_, res) => res.json({ status: 'ok', module: 'resources-hub' }));

app.use('/api/resources/auth', authRoutes);
app.use('/api/resources/profile', profileRoutes);
app.use('/api/resources/posts', postRoutes);
app.use('/api/resources/projects', projectRoutes);
app.use('/api/resources/communities', communityRoutes);
app.use('/api/resources/search', searchRoutes);
app.use('/api/resources/likes', likeRoutes);
app.use('/api/resources/comments', commentRoutes);
app.use('/api/resources/collaborations', collaborationRoutes);
app.use('/api/resources/messages', messageRoutes);
app.use('/api/resources/admin', adminRoutes);
app.use('/api/resources/notifications', notificationRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.RESOURCES_PORT || process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Resources Hub Backend running on port ${PORT}`));
