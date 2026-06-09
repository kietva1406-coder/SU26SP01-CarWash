import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db/db.js';
import requestRoutes from './routes/requests.js';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API Routes
app.use('/api/requests', requestRoutes);

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  if (err.message === 'Customer not found') {
    return res.status(404).json({
      success: false,
      error: 'Customer not found',
    });
  }

  if (err.message === 'Request not found') {
    return res.status(404).json({
      success: false,
      error: 'Request not found',
    });
  }

  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('✓ Database initialized');

    app.listen(port, () => {
      console.log(`✓ Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
