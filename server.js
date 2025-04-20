import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import { globalErrorHandler } from "./utils/errorHandler.js";
import dbConnect from "./config/mongo.js";

// Load env vars
dotenv.config();

// Create express app
const app = express();

// Database connection wrapper
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
      "https://krmu-enrollment.vercel.app/",
      "http://localhost:3000", // For local development
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add OPTIONS method to CORS preflight
app.options("*", cors());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err);
  next(err);
});
app.use(globalErrorHandler);

// Start server only in local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
  });

  process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
}

export default app;
