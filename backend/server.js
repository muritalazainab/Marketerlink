import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoute from "./routes/auth.route.js";
import applicationRoute from "./routes/application.routes.js"
import conversationRoute from "./routes/conversation.route.js"
import gigRoute from "./routes/gig.route.js"
import messageRoute from "./routes/message.route.js"
import notificationRoute from "./routes/notification.route.js"
import orderRoute from "./routes/order.route.js"
import platformEarningRoute from "./routes/platformEarnings.routes.js"
import profileRoute from "./routes/profile.route.js"
import reviewRoute from "./routes/review.route.js"
import userRoute from "./routes/user.route.js"
import workSubmissionRoute from "./routes/workSubmission.routes.js"

const app = express();
dotenv.config();

mongoose.set("strictQuery", true);
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to mongoDB!");
  } catch (error) {
    console.log("MongoDB connection error:", error);
  }
};

app.use(cors({
  origin: ['https://marketerlink.vercel.app', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// FIXED ROUTES - Each has unique path
app.use("/api/auth", authRoute);
app.use("/api/application", applicationRoute);
app.use("/api/conversation", conversationRoute);
app.use("/api/gig", gigRoute);
app.use("/api/message", messageRoute);
app.use("/api/notification", notificationRoute);
app.use("/api/order", orderRoute);
app.use("/api/platformEarnings", platformEarningRoute);
app.use("/api/profile", profileRoute);
app.use("/api/review", reviewRoute);        
app.use("/api/user", userRoute);            
app.use("/api/workSubmission", workSubmissionRoute);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 8800;
app.listen(PORT, async () => {
  await connect();
  console.log(`Server running on port ${PORT}!`);
});