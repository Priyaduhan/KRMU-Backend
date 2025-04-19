import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[A-Za-z]+$/.test(v);
        },
        message: "Username must contain only alphabets",
      },
    },
    phoneNumber: {
      type: String,
      required: [true, "Please provide a phone number"],
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);
        },
        message: "Phone number must be 10 digits",
      },
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
      validate: {
        validator: function (v) {
          return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v);
        },
        message: "Password must contain at least 1 letter and 1 number",
      },
    },
    role: {
      type: String,
      enum: ["counsellor", "teacher"],
      default: "counsellor",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

export default User;
