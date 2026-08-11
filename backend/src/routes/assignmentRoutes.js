const express = require("express");

const router = express.Router();

const assignmentController = require("../controllers/assignmentController");
const submissionController = require("../controllers/submissionController");
const {
  validateCreateAssignment,
  validateUpdateAssignment,
  validateSubmission,
  validateGrade,
} = require("../validators/assignmentValidator");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const upload = require("../middleware/uploadMiddleware");

// Every assignment route requires a valid session.
router.use(authMiddleware, roleMiddleware("admin", "student", "instructor"));

// Student "Tasks" dashboard — every assignment across all enrolled courses.
router.get("/mine", roleMiddleware("student"), asyncHandler(assignmentController.getMyAssignments));

router.get("/course/:courseId", asyncHandler(assignmentController.getCourseAssignments));

router.get("/:id", asyncHandler(assignmentController.getAssignmentById));

router.post(
  "/",
  roleMiddleware("instructor"),
  upload.single("attachment"),
  validateCreateAssignment,
  asyncHandler(assignmentController.createAssignment),
);

router.put(
  "/:id",
  roleMiddleware("instructor"),
  upload.single("attachment"),
  validateUpdateAssignment,
  asyncHandler(assignmentController.updateAssignment),
);

router.delete("/:id", roleMiddleware("instructor"), asyncHandler(assignmentController.deleteAssignment));

// Submissions
router.post(
  "/:id/submit",
  roleMiddleware("student"),
  upload.single("attachment"),
  validateSubmission,
  asyncHandler(submissionController.submitAssignment),
);

router.get(
  "/:id/my-submission",
  roleMiddleware("student"),
  asyncHandler(submissionController.getMySubmission),
);

router.get(
  "/:id/submissions",
  roleMiddleware("instructor"),
  asyncHandler(submissionController.getSubmissionsForAssignment),
);

router.patch(
  "/:id/submissions/:submissionId/grade",
  roleMiddleware("instructor"),
  validateGrade,
  asyncHandler(submissionController.gradeSubmission),
);

module.exports = router;
