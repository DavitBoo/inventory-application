const express = require("express");
const router = express.Router();

// Require controller modules.
const item_controller = require("../controllers/itemController.js");
const category_controller = require("../controllers/categoryController.js");

// GET inventory home page.
router.get("/", item_controller.index);

module.exports = router;

// --- ITEMS  ---
// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get("/items/create", item_controller.item_create_get);

// POST request for creating Book.
router.post("/items/create", item_controller.item_create_post);

// GET request for one Book.
router.get("/items/:id", item_controller.item_detail);

// GET request for list of all Book items.
router.get("/items", item_controller.item_list);

// --- CATEGORIES ---

router.get("/categories/create", category_controller.category_create_get);

router.post("/categories/create", category_controller.category_create_post);

// GET request to delete Category.
router.get("/categories/:id/delete", category_controller.category_delete_get);

// POST request to delete Category.
router.post("/categories/:id/delete", category_controller.category_delete_post);

// GET request for one Category.
router.get("/categories/:id", category_controller.category_detail);

// GET request for list of all Categories.
router.get("/categories", category_controller.category_list);
