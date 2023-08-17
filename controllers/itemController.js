const Category = require("../models/category");
const Item = require("../models/item");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.index = asyncHandler(async (req, res, next) => {
  const [numItems, numCategories] = await Promise.all([
    Item.countDocuments({}).exec(),
    Category.countDocuments({}).exec(),
  ]);

  res.render("layout", {
    contentFile: "index",
    title: "Welcome to your own stock",
    item_count: numItems,
    category_count: numCategories,
  });
});

// Display list of all items.
exports.item_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find({}, "name").sort({ title: 1 }).exec();

  res.render("item_list", { title: "Item List", item_list: allItems });
});

// Display detail page for a specific item.
exports.book_detail = asyncHandler(async (req, res, next) => {
  // Get details of items, item instances for specific item
  const item = await Book.findById(req.params.id).populate("category").exec();

  if (item === null) {
    // No results.
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  res.render("item_detail", {
    contentFile: "item-detail",
    title: item.name,
    item: item,
  });
});
