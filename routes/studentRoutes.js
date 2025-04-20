import express from "express";
import {
  createStudent,
  getAllStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  getDashboardStats,
} from "../controllers/studentController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Protect all routes
router.use(protect);

router.route("/").post(createStudent).get(getAllStudents);

router.get("/dashboard/stats", getDashboardStats);

router
  .route("/:id")
  .get(getStudent)
  .patch(updateStudent)
  .delete(authorize("admin"), deleteStudent);

export default router;
