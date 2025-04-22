import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      default: "TEMP_ID",
    },

    firstName: {
      type: String,
      required: [true, "First name is required"],
      match: [/^[A-Za-z]+$/, "First name must contain only alphabets"],
    },
    lastName: {
      type: String,
      match: [/^[A-Za-z]+$/, "Last name must contain only alphabets"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please provide a valid email",
      },
    },
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);
        },
        message: "Phone number must be 10 digits",
      },
    },
    fathersName: {
      type: String,
      required: [true, "Father's name is required"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "others"],
      required: [true, "Gender is required"],
    },
    courseName: {
      type: String,
      required: [true, "Course name is required"],
    },
    schoolName: {
      type: String,
      required: [true, "School name is required"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    interviewDate: {
      type: Date,
      required: [true, "Interview date is required"],
    },
    interviewTime: {
      type: String,
      required: [true, "Interview time is required"],
    },
    assignedCounsellor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mcqScore: {
      type: Number,
      default: 0,
    },
    zoomLink: {
      type: String,
      default: "",
    },
    generalTeacher: {
      type: String,
      default: "",
    },
    technicalTeacher: {
      type: String,
      default: "",
    },
    generalStatus: {
      type: String,
      enum: ["Pending", "Pass", "Fail"],
      default: "Pending",
    },
    technicalStatus: {
      type: String,
      enum: ["Pending", "Pass", "Fail"],
      default: "Pending",
    },
    emailStatus: {
      type: String,
      enum: ["Pending", "Added"],
      default: "Pending",
    },
    status: {
      type: String,
      enum: ["Pending", "Pass", "Fail"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

studentSchema.pre("save", async function (next) {
  try {
    // Only generate ID if it's still the default TEMP_ID
    if (this.studentId === "TEMP_ID") {
      const lastStudent = await this.constructor
        .findOne(
          { studentId: { $ne: "TEMP_ID" } },
          {},
          { sort: { studentId: -1 } }
        )
        .select("studentId")
        .lean();

      let nextIdNumber = 1;
      if (lastStudent) {
        const lastId = lastStudent.studentId.replace("KRMU", "");
        nextIdNumber = parseInt(lastId, 10) + 1;
      }

      this.studentId = `KRMU${String(nextIdNumber).padStart(7, "0")}`;
    }
    next();
  } catch (err) {
    next(err);
  }
});

const Student = mongoose.model("Student", studentSchema);

export default Student;
