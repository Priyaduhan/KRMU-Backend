import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import { globalErrorHandler } from "./utils/errorHandler.js";
import dbConnect from "./config/mongo.js";

// Load env vars
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create express app
const app = express();

// Add this instead right before your routes:
const connectToDB = async () => {
  try {
    await dbConnect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

// Connect to database
await connectToDB();

// Middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:3000", // For local development
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Mount routers
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);

// Serve static files in production (if deploying frontend with backend)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  // Handle SPA routing
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
  });
}

// Log errors for debugging
app.use((err, req, res, next) => {
  console.error("Error:", err);
  next(err);
});

// Error handling middleware
app.use(globalErrorHandler);

// For Vercel deployment
if (process.env.NODE_ENV !== "production") {
  // Local server only
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
}

export default app;
