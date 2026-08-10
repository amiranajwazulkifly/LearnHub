const express = require("express");

const router = express.Router();

const categoryController = require("../controllers/categoryController");
const validateCategory = require("../validators/categoryValidator");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Every category route requires a valid session; only admins can write.
router.use(authMiddleware, roleMiddleware("admin", "student", "instructor"));

router.get("/", categoryController.getAllCategories);
router.post("/", roleMiddleware("admin"), validateCategory, categoryController.createCategory);
router.put("/:id", roleMiddleware("admin"), validateCategory, categoryController.updateCategory);
router.delete("/:id", roleMiddleware("admin"), categoryController.deleteCategory);

module.exports = router;
