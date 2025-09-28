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
import './utils/cronJobs.js';
import workSubmissionRoutes from './routes/workSubmission.routes.js';
import platformEarningsRoutes from './routes/platformEarnings.routes.js';

const app = express();
dotenv.config();

mongoose.set("strictQuery", true);
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to mongoDB!");
  } catch (error) {
    console.log(error);
  }
};

// CORS configuration with debugging
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://marketerlink.vercel.app',
      'http://localhost:3000',      
      'http://localhost:5173'
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    console.log('Request origin:', origin);
    
    if (allowedOrigins.includes(origin)) {
      console.log('Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('Origin blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Additional middleware for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

app.use(express.json());
app.use(cookieParser());

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

app.use('/uploads', express.static('uploads'));

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Marketer Link API is running successfully!',
    cors: 'enabled',
    allowedOrigins: [
      'https://marketerlink.vercel.app',
      'http://localhost:3000',      
      'http://localhost:5173'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  
  console.error('Error:', errorMessage);
  return res.status(errorStatus).json({ error: errorMessage });
});

const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  connect();
  console.log(`Backend server is running on port ${PORT}!`);
  console.log('CORS enabled for origins:', [
    'https://marketerlink.vercel.app',
    'http://localhost:3000',      
    'http://localhost:5173'
  ]);
});