const express = require("express");
const router = express.Router();

// Require controller modules.
const item_controller = require("../controllers/itemController.js");

// GET inventory home page.
router.get("/", item_controller.index);

module.exports = router;

// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get("/items/create", item_controller.item_create_get);
