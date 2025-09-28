import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import applicationRoutes from "./routes/application.routes.js";
import profileRoutes from "./routes/profile.route.js";
import userRoute from "./routes/user.route.js";
import gigRoute from "./routes/gig.route.js";
import orderRoute from "./routes/order.route.js";
import conversationRoute from "./routes/conversation.route.js";
import messageRoute from "./routes/message.route.js";
import reviewRoute from "./routes/review.route.js";
import authRoute from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import notificationRoutes from "./routes/notification.route.js";
import projectsRoutes from './routes/projects.js';
import workSubmissionRoutes from './routes/workSubmission.routes.js';
import platformEarningsRoutes from './routes/platformEarnings.routes.js';

const app = express();
dotenv.config();

// MongoDB connection optimized for serverless
mongoose.set("strictQuery", true);
let isConnected = false;

const connect = async () => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      maxPoolSize: 10, // Maintain up to 10 socket connections
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0 // Disable mongoose buffering
    });
    isConnected = true;
    console.log("Connected to mongoDB!");
  } catch (error) {
    console.log("MongoDB connection error:", error);
    isConnected = false;
    throw error;
  }
};

// CORS configuration - simplified and fixed
app.use(cors({
  origin: [
    'https://marketerlink.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  optionsSuccessStatus: 200
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await connect();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Additional middleware for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check route (must be before other routes)
app.get('/', (req, res) => {
  res.json({ 
    message: 'Marketer Link API is running successfully on Vercel!',
    cors: 'enabled',
    timestamp: new Date().toISOString(),
    allowedOrigins: [
      'https://marketerlink.vercel.app',
      'http://localhost:5173'
    ]
  });
});

app.get('/api', (req, res) => {
  res.json({ message: 'API endpoints are working!' });
});

// Routes
app.use("/api/applications", applicationRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/gigs", gigRoute);
app.use("/api/orders", orderRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/notifications", notificationRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/work-submissions', workSubmissionRoutes);
app.use('/api/platform-earnings', platformEarningsRoutes);

// Static files (Note: Vercel handles static files differently)
app.use('/uploads', express.static('uploads'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  
  console.error('Error:', errorMessage);
  console.error('Stack:', err.stack);
  return res.status(errorStatus).json({ error: errorMessage });
});

// Export for Vercel
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 8800;
  app.listen(PORT, async () => {
    await connect();
    console.log(`Backend server is running on port ${PORT}!`);
    console.log('CORS enabled for origins:', [
      'https://marketerlink.vercel.app',
      'http://localhost:5173'
    ]);
  });
}