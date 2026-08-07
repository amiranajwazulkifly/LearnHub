const express = require("express");

const router = express.Router();

const categoryController = require("../controllers/categoryController");

router.get("/", categoryController.getAllCategories);
router.post("/", validateCategory, categoryController.createCategory);
router.put("/:id", validateCategory, categoryController.updateCategory);
router.delete("/:id", validateCategory, categoryController.deleteCategory);

module.exports = router;
