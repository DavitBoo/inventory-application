const express = require("express");
const router = express.Router();

// Require controller modules.
const item_controller = require("../controllers/itemController.js");

// GET inventory home page.
router.get("/", item_controller.index);

module.exports = router;
