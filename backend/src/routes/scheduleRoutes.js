const express = require("express");

const router = express.Router();

const scheduleController = require("../controllers/scheduleController");
const validateSchedule = require("../validators/scheduleValidator");

router.get("/", scheduleController.getAllSchedules);
router.post("/", validateSchedule, scheduleController.createSchedule);
router.put("/:id", validateSchedule, scheduleController.updateSchedule);
router.delete("/:id", validateSchedule, scheduleController.deleteSchedule);

module.exports = router;
