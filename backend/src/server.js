import express from 'express';
import cors from 'cors';
import {clerkMiddleware} from '@clerk/express';
import userRoutes from './routes/user.route.js';
import postRoutes from './routes/post.route.js';

import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import e from 'express';

const app = express();

app.use(cors());
app.use(express.json());

app.use(clerkMiddleware());

app.get('/', (req, res) => res.send('Hello from server!'));

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => {
      console.log('Server is running on port: ', ENV.PORT);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
