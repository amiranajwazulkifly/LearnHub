const express = require("express");

const router = express.Router();

const scheduleController = require("../controllers/scheduleController");
const validateSchedule = require("../validators/scheduleValidator");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const asyncHandler = require("../utils/asyncHandler");

// Every schedule route requires a valid session; only admins can write.
router.use(authMiddleware, roleMiddleware("admin", "student", "instructor"));

router.get("/", asyncHandler(scheduleController.getAllSchedules));
router.post(
  "/",
  roleMiddleware("admin"),
  validateSchedule,
  asyncHandler(scheduleController.createSchedule),
);
router.put(
  "/:id",
  roleMiddleware("admin"),
  validateSchedule,
  asyncHandler(scheduleController.updateSchedule),
);
// No body is sent on delete, so this must not run validateSchedule (which
// requires a full create/update-shaped payload) — that bug silently broke
// the admin "Delete" button on every schedule for as long as it existed.
router.delete("/:id", roleMiddleware("admin"), asyncHandler(scheduleController.deleteSchedule));

module.exports = router;
