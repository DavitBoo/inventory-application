const Category = require("../models/category");
const Item = require("../models/item");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all Genre.
exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().sort({ name: 1 }).exec();
  res.render("layout", {
    contentFile: "category_list",
    title: "Category List",
    category_list: allCategories,
  });
});

exports.category_detail = asyncHandler(async (req, res, next) => {
  console.log("heyyy");
  const [category, itemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, "name stock").exec(),
  ]);

  if (category === null) {
    // No results.
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  res.render("layout", {
    contentFile: "category_detail",
    title: "Category Details",
    category: category,
    category_items: itemsInCategory,
  });
});
