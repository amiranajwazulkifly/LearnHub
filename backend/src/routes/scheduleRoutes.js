const express = require("express");

const router = express.Router();

const scheduleController = require("../controllers/scheduleController");
const validateSchedule = require("../validators/scheduleValidator");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Every schedule route requires a valid session; only admins can write.
router.use(authMiddleware, roleMiddleware("admin", "student", "instructor"));

router.get("/", scheduleController.getAllSchedules);
router.post("/", roleMiddleware("admin"), validateSchedule, scheduleController.createSchedule);
router.put("/:id", roleMiddleware("admin"), validateSchedule, scheduleController.updateSchedule);
router.delete("/:id", roleMiddleware("admin"), validateSchedule, scheduleController.deleteSchedule);

module.exports = router;
