import express from "express";
import {
  createStudent,
  getAllStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  getDashboardStats,
  mailHandler,
  rejectMailHandler,
} from "../controllers/studentController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Unprotected route - createStudent
router.route("/").post(createStudent);

// Protect all routes after this point
router.use(protect);

// Protected routes
router.route("/").get(getAllStudents);

router.get("/dashboard/stats", getDashboardStats);

router
  .route("/:id")
  .get(getStudent)
  .patch(updateStudent)
  .delete(authorize("admin"), deleteStudent);

router.post("/:id/send-acceptance", mailHandler);
router.post("/:id/send-rejection", rejectMailHandler);

export default router;
