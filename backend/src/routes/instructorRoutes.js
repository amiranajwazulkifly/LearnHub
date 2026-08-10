const express = require("express");

const router = express.Router();

const instructorController = require("../controllers/instructorController");
const validateInstructor = require("../validators/instructorValidator");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Every instructor route requires a valid session; only admins can write.
router.use(authMiddleware, roleMiddleware("admin", "student", "instructor"));

router.get("/", instructorController.getAllInstructors);

router.post("/", roleMiddleware("admin"), validateInstructor, instructorController.createInstructor);

router.put("/:id", roleMiddleware("admin"), validateInstructor, instructorController.updateInstructor);

router.delete("/:id", roleMiddleware("admin"), instructorController.deleteInstructor);

// Creates/resets login credentials for an instructor — grants a real account.
router.post(
  "/:id/account",
  roleMiddleware("admin"),
  instructorController.setInstructorAccount,
);

module.exports = router;
