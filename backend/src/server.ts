import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Import email service
import { startEmailScheduler, triggerAppointmentReminders, triggerVaccinationReminders } from './services/emailService';

// Import routes
import authRoutes from './routes/auth';
import dogRoutes from './routes/dogs';
import vaccinationRoutes from './routes/vaccinations';
import healthRoutes from './routes/health';
import appointmentRoutes from './routes/appointments';
import trainingRoutes from './routes/training';
import emergencyRoutes from './routes/emergency';
import uploadsRoutes from './routes/uploads';
import postsRoutes from './routes/posts';
import eventsRoutes from './routes/events';
import nutritionRoutes from './routes/nutrition';
import publicRoutes from './routes/public';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;




// Security middleware
app.use(helmet());
app.set('trust proxy', 1);

// Rate limiting
//const limiter = rateLimit({
//  windowMs: 15 * 60 * 1000, // 15 minutes
//  max: 100, // limit each IP to 100 requests per windowMs
//  message: 'Too many requests from this IP, please try again later.',
//});
//app.use(limiter);

// CORS configuration
// Put this ABOVE your routes
const allowedOrigins = [
  'https://edog.catena-x.polygran.io', // web app
  'https://edog.dogpass.net',         //official edog website
  'http://localhost',                  // Android WebView default
  'https://localhost',                 // some setups / if androidScheme:'https'
  'capacitor://localhost',            // iOS WebView
  'http://localhost:5173',            // Vite dev (optional)
  'http://localhost:5174',            // Vite dev (optional)
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);          // allow curl/Postman/no-origin
    const normalized = origin.replace(/\/$/, ''); // strip trailing slash
    cb(null, allowedOrigins.includes(normalized));
  },
  credentials: true, // you're using JWT in Authorization header; no cookies
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
};

//app.use(cors(corsOptions));
// IMPORTANT: tie preflight to the SAME options (don’t use bare cors())
//app.options('*', cors(corsOptions));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Body parsing middleware


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});


//Public for lost and found
app.use('/api/public', publicRoutes);

//Preflight handler

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.set({
      'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '1728000',
    });
    return res.sendStatus(204);
  }
  next();
});



// API routes
app.use('/api/auth', authRoutes);
app.use('/api/dogs', dogRoutes);
app.use('/api/vaccinations', vaccinationRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/nutrition', nutritionRoutes);

// Email reminder endpoints (for testing)
app.post('/api/test/appointment-reminders', triggerAppointmentReminders);
app.post('/api/test/vaccination-reminders', triggerVaccinationReminders);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 eDog Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
//  console.log(`🌐 CORS is enabled ?: ${process.env.ENABLE_APP_CORS}`);
//  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  
  // Start email scheduler
  startEmailScheduler();
});

export default app;