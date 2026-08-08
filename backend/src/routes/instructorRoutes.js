const express = require("express");

const router = express.Router();

const instructorController = require("../controllers/instructorController");

router.get("/", instructorController.getAllInstructors);
router.post("/", validateInstructor, instructorController.createInstructor);
router.put("/:id", validateInstructor, instructorController.updateInstructor);
router.delete(
  "/:id",
  validateInstructor,
  instructorController.deleteInstructor,
);

module.exports = router;
