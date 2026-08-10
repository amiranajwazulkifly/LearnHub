const express = require("express");

const router = express.Router();

const categoryController = require("../controllers/categoryController");
const validateCategory = require("../validators/categoryValidator");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const asyncHandler = require("../utils/asyncHandler");

// Every category route requires a valid session; only admins can write.
router.use(authMiddleware, roleMiddleware("admin", "student", "instructor"));

router.get("/", asyncHandler(categoryController.getAllCategories));
router.post(
  "/",
  roleMiddleware("admin"),
  validateCategory,
  asyncHandler(categoryController.createCategory),
);
router.put(
  "/:id",
  roleMiddleware("admin"),
  validateCategory,
  asyncHandler(categoryController.updateCategory),
);
router.delete("/:id", roleMiddleware("admin"), asyncHandler(categoryController.deleteCategory));

module.exports = router;
