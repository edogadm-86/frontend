"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Import email service
const emailService_1 = require("./services/emailService");
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const dogs_1 = __importDefault(require("./routes/dogs"));
const vaccinations_1 = __importDefault(require("./routes/vaccinations"));
const health_1 = __importDefault(require("./routes/health"));
const appointments_1 = __importDefault(require("./routes/appointments"));
const training_1 = __importDefault(require("./routes/training"));
const emergency_1 = __importDefault(require("./routes/emergency"));
const uploads_1 = __importDefault(require("./routes/uploads"));
const posts_1 = __importDefault(require("./routes/posts"));
const events_1 = __importDefault(require("./routes/events"));
const nutrition_1 = __importDefault(require("./routes/nutrition"));
const public_1 = __importDefault(require("./routes/public"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Security middleware
app.use((0, helmet_1.default)());
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
    'https://edog.dogpass.net', //official edog website
    'http://localhost', // Android WebView default
    'https://localhost', // some setups / if androidScheme:'https'
    'capacitor://localhost', // iOS WebView
    'http://localhost:5173', // Vite dev (optional)
    'http://localhost:5174', // Vite dev (optional)
];
const corsOptions = {
    origin: (origin, cb) => {
        if (!origin)
            return cb(null, true); // allow curl/Postman/no-origin
        const normalized = origin.replace(/\/$/, ''); // strip trailing slash
        cb(null, allowedOrigins.includes(normalized));
    },
    credentials: true, // you're using JWT in Authorization header; no cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
//app.use(cors(corsOptions));
// IMPORTANT: tie preflight to the SAME options (don’t use bare cors())
//app.options('*', cors(corsOptions));
// Serve static files from uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Serve static files from uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Logging middleware
app.use((0, morgan_1.default)('combined'));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
//Public for lost and found
app.use('/api/public', public_1.default);
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
app.use('/api/auth', auth_1.default);
app.use('/api/dogs', dogs_1.default);
app.use('/api/vaccinations', vaccinations_1.default);
app.use('/api/health', health_1.default);
app.use('/api/appointments', appointments_1.default);
app.use('/api/training', training_1.default);
app.use('/api/emergency', emergency_1.default);
app.use('/api/uploads', uploads_1.default);
app.use('/api/posts', posts_1.default);
app.use('/api/events', events_1.default);
app.use('/api/nutrition', nutrition_1.default);
// Email reminder endpoints (for testing)
app.post('/api/test/appointment-reminders', emailService_1.triggerAppointmentReminders);
app.post('/api/test/vaccination-reminders', emailService_1.triggerVaccinationReminders);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Global error handler
app.use((err, req, res, next) => {
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
    (0, emailService_1.startEmailScheduler)();
});
exports.default = app;
//# sourceMappingURL=server.js.map