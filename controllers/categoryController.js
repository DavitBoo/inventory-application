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

// Display Genre delete form on GET.
exports.category_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of category and all their items (in parallel)
  const [category, allItemssByCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Category.find({ category: req.params.id }, "name description").exec(),
  ]);

  if (category === null) {
    // No results.
    res.redirect("/inventory/category");
  }

  res.render("layout", {
    contentFile: "category_delete",
    title: "Delete Category",
    category: category,
    category_items: allItemssByCategory,
  });
});

// Display Genre create form on GET.
exports.category_create_get = (req, res, next) => {
  res.render("layout", {
    contentFile: "category_form",
    title: "Create Category",
  });
};

// Handle Genre create on POST.
exports.category_create_post = [
  // Validate and sanitize the name field.
  body("name", "Category name must contain at least 3 characters").trim().isLength({ min: 3 }).escape(),
  body("description", "Category description must contain at least 3 characters").trim().isLength({ min: 3 }).escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a category object with escaped and trimmed data, based on the model.
    const category = new Category({
      name: req.body.name,
      description: req.body.description, // Agregar esta línea
    });
    description: req.body.description;

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("layout", {
        contentFile: "category_form",
        title: "Create Category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      const categoryExists = await Category.findOne({ name: req.body.name }).exec();
      if (categoryExists) {
        // Genre exists, redirect to its detail page.
        res.redirect(categoryExists.url);
      } else {
        await category.save();
        // New genre saved. Redirect to genre detail page.
        res.redirect(category.url);
      }
    }
  }),
];
