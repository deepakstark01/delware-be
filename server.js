import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { connectDatabase } from './config/database.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/error.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 80;

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://delware.vercel.app/', 'https://delware.vercel.app', 'https://deacc.org/', 'https://deacc.org', 'https://www.deacc.org/','https://www.deacc.org', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};



// Security middleware
app.use(helmet());
app.use(cors(corsOptions));
// Connect to database
await connectDatabase();

// Global middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Membership Platform API', 
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      paypal: '/api/paypal', 
      profile: '/api/me',
      admin: {
        users: '/api/admin/users',
        events: '/api/admin/events'
      }
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
