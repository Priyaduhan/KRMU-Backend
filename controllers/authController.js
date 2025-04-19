import User from "../models/User.js";
import { generateToken } from "../config/token.js";
import AppError from "../utils/errorHandler.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { username, phoneNumber, email, password, confirmPassword, role } =
      req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return next(new AppError("Passwords do not match", 400));
    }

    // Check if email ends with @krmu.edu.in
    if (!email.endsWith("@krmu.edu.in")) {
      return next(
        new AppError("Please use your university email (@krmu.edu.in)", 400)
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(
        new AppError("Email already in use. Please use a different email.", 400)
      );
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return next(
        new AppError(
          "Username already taken. Please choose a different one.",
          400
        )
      );
    }

    // Check if phone number already exists
    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) {
      return next(new AppError("Phone number already registered.", 400));
    }

    // Create user
    const user = await User.create({
      username,
      phoneNumber,
      email,
      password,
      role,
    });

    // Generate token
    const token = generateToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(201).json({
      status: "success",
      token,
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

    // 3) Check if email ends with @krmu.edu.in
    if (!email.endsWith("@krmu.edu.in")) {
      return next(
        new AppError("Please use your university email (@krmu.edu.in)", 401)
      );
    }

    // 4) If everything ok, send token to client
    const token = generateToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(200).json({
      status: "success",
      token,
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  console.log(req, "user me");
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all teachers
// @route   GET /api/users/teachers
// @access  Private (Admin/Counsellor)
export const getTeachers = async (req, res, next) => {
  try {
    // Only allow admins and counsellors to access this endpoint
    if (!["admin", "counsellor"].includes(req.user.role)) {
      return next(
        new AppError("You are not authorized to access this resource", 403)
      );
    }

    const teachers = await User.find({ role: "teacher" })
      .select("-password -__v") // Exclude sensitive/uneeded fields
      .sort({ username: 1 }); // Sort alphabetically by username

    res.status(200).json({
      status: "success",
      results: teachers.length,
      data: {
        teachers,
      },
    });
  } catch (err) {
    next(err);
  }
};
