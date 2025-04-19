import Student from "../models/Student.js";
import User from "../models/User.js";
import AppError from "../utils/errorHandler.js";

// @desc    Create a new student
// @route   POST /api/students
// @access  Private (Counsellor)
export const createStudent = async (req, res, next) => {
  try {
    // Get random counsellor
    const counsellors = await User.find({ role: "counsellor" });

    if (counsellors.length === 0) {
      return next(new AppError("No counsellors available", 400));
    }

    const randomCounsellor =
      counsellors[Math.floor(Math.random() * counsellors.length)];

    // Format date and time properly
    const interviewDate = req.body.selectDate;
    const interviewTime = req.body.selectTime;

    // Basic validation
    if (!interviewDate || !interviewTime) {
      return next(new AppError("Interview date and time are required", 400));
    }

    const studentData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      contactNumber: req.body.contactNumber,
      fathersName: req.body.fathersName,
      gender: req.body.gender,
      courseName: req.body.courseName,
      schoolName: req.body.schoolName,
      state: req.body.state,
      city: req.body.city,
      interviewDate: new Date(interviewDate),
      interviewTime: interviewTime,
      assignedCounsellor: randomCounsellor._id,
    };

    const student = await Student.create(studentData);

    res.status(201).json({
      status: "success",
      data: {
        student,
      },
    });
  } catch (err) {
    next(err);
  }
};
// @desc    Get all students
// @route   GET /api/students
// @access  Private
export const getAllStudents = async (req, res, next) => {
  try {
    // For counsellors
    if (req.user.role === "counsellor") {
      const students = await Student.find({
        assignedCounsellor: req.user._id,
      }).populate("assignedCounsellor", "username email");

      const result = {
        waitingForInterview: students.filter((s) => s.status === "Pending"),
        interviewedCandidates: students.filter((s) =>
          ["Pass", "Fail"].includes(s.status)
        ),
      };

      return res.status(200).json({
        status: "success",
        data: result,
      });
    }

    // For teachers
    if (req.user.role === "teacher") {
      const students = await Student.find().populate(
        "assignedCounsellor",
        "username email"
      );

      const result = {
        technicalCandidates: students.filter(
          (s) => s.technicalTeacher === req.user.username
        ),
        generalCandidates: students.filter(
          (s) => s.generalTeacher === req.user.username
        ),
      };

      return res.status(200).json({
        status: "success",
        data: result,
      });
    }

    // For admins or other roles (return all students)
    const students = await Student.find().populate(
      "assignedCounsellor",
      "username email"
    );

    res.status(200).json({
      status: "success",
      results: students.length,
      data: { students },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
export const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      "assignedCounsellor",
      "username email"
    );

    if (!student) {
      return next(new AppError("No student found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        student,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update student
// @route   PATCH /api/students/:id
// @access  Private
export const updateStudent = async (req, res, next) => {
  try {
    // First get the current student data
    const currentStudent = await Student.findById(req.params.id);
    if (!currentStudent) {
      return next(new AppError("No student found with that ID", 404));
    }
    // Prepare update data
    const updateData = { ...req.body };

    // Check if we're updating either technicalStatus or generalStatus
    if (req.body.technicalStatus || req.body.generalStatus) {
      // Determine the new technical and general statuses
      const newTechnicalStatus =
        req.body.technicalStatus || currentStudent.technicalStatus;
      const newGeneralStatus =
        req.body.generalStatus || currentStudent.generalStatus;
      // Check if both statuses are no longer "Pending"
      if (newTechnicalStatus !== "Pending" && newGeneralStatus !== "Pending") {
        // Update the main status based on technical status
        updateData.status = newTechnicalStatus;
      } else if (currentStudent.status !== "Pending") {
        updateData.status = "Pending";
      }
    }
    // Perform the update
    const student = await Student.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("assignedCounsellor", "username email");

    res.status(200).json({
      status: "success",
      data: {
        student,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return next(new AppError("No student found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/students/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await Student.aggregate([
      {
        $facet: {
          enrolled: [{ $count: "count" }],
          waitingForInterview: [
            { $match: { status: "Pending" } },
            { $count: "count" },
          ],
          inInterview: [
            { $match: { status: "Interviewed" } },
            { $count: "count" },
          ],
          accepted: [{ $match: { status: "Accepted" } }, { $count: "count" }],
          rejected: [{ $match: { status: "Rejected" } }, { $count: "count" }],
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        enrolled: stats[0].enrolled[0]?.count || 0,
        waitingForInterview: stats[0].waitingForInterview[0]?.count || 0,
        inInterview: stats[0].inInterview[0]?.count || 0,
        accepted: stats[0].accepted[0]?.count || 0,
        rejected: stats[0].rejected[0]?.count || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};
