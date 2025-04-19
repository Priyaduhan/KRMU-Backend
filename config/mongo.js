const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Add this for Vercel serverless functions
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = connectDB().then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// import mongoose from "mongoose";
// import dotenv from "dotenv";

// dotenv.config();

// const CONNECTION_URL = process.env.MONGODB_URI;

// mongoose.set("strictQuery", false);

// const connectDB = async () => {
//   try {
//     await mongoose.connect(CONNECTION_URL, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("MongoDB connected successfully");
//   } catch (error) {
//     console.error("MongoDB connection error:", error);
//     process.exit(1); // Exit the process if the connection fails
//   }
// };

// export default connectDB;
