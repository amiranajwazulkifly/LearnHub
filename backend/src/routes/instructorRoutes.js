const express = require("express");

const router = express.Router();

const instructorController = require("../controllers/instructorController");
const validateInstructor = require("../validators/instructorValidator");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/", instructorController.getAllInstructors);

router.post("/", validateInstructor, instructorController.createInstructor);

router.put("/:id", validateInstructor, instructorController.updateInstructor);

router.delete("/:id", instructorController.deleteInstructor);

// Creates/resets login credentials for an instructor — grants a real
// account, so this one is auth-gated even though the rest of this
// router currently isn't.
router.post(
  "/:id/account",
  authMiddleware,
  roleMiddleware("admin"),
  instructorController.setInstructorAccount,
);

module.exports = router;
