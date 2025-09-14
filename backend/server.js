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
app.use(cors({ 
  origin: ["http://localhost:5173", "https://marketer-link2-pbk84gdkf-zmuritala8-2371s-projects.vercel.app"], 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());
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


app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";

  return res.status(errorStatus).send(errorMessage);
});


app.get('/', (req, res) => {
  res.json({ message: 'Marketer Link API is running successfully!' });
});
const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  connect()
  console.log(`Backend server is running on port ${PORT}!`);
});