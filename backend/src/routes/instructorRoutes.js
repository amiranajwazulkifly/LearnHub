const express = require("express");

const router = express.Router();

const instructorController = require("../controllers/instructorController");
const validateInstructor = require("../validators/instructorValidator");

router.get("/", instructorController.getAllInstructors);

router.post("/", validateInstructor, instructorController.createInstructor);

router.put("/:id", validateInstructor, instructorController.updateInstructor);

router.delete("/:id", instructorController.deleteInstructor);

module.exports = router;
