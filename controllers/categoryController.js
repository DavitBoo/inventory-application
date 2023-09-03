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
  const [category, allItemsByCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, "name description").exec(),
  ]);

  if (category === null) {
    // No results.
    res.redirect("/inventory/categories");
  }
  res.render("layout", {
    contentFile: "category_delete",
    title: "Delete Category",
    category: category,
    category_items: allItemsByCategory,
  });
});

// Handle Category delete on POST.
exports.category_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of category and all their items (in parallel)
  const [category, allItemsByCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, "name description").exec(),
  ]);

  if (allItemsByCategory.length > 0) {
    // Category has items. Render in same way as for GET route.
    res.render("layout", {
      contentFile: "category_delete",
      title: "Delete Category",
      category: category,
      category_items: allItemsByCategory,
    });
    return;
  } else {
    // Genre has no books. Delete object and redirect to the list of authors.
    await Category.findByIdAndRemove(req.body.categoryid);
    res.redirect("/inventory/categories");
  }
});

// Display Category create form on GET.
exports.category_create_get = (req, res, next) => {
  res.render("layout", {
    contentFile: "category_form",
    title: "Create Category",
    category: null,
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
    // description: req.body.description;

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

// Display Genre update form on GET.
exports.category_update_get = asyncHandler(async (req, res, next) => {
  // Get genre.
  const category = await Category.findById(req.params.id).exec();

  if (category === null) {
    // No results.
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  res.render("layout", {
    contentFile: "category_form",
    title: "Update Category",
    category: category,
  });
});

// Handle Category update on POST.
exports.category_update_post = [
  // Validate and sanitize fields.
  body("name", "Category name must contain at least 3 characters").trim().isLength({ min: 3 }).escape(),
  body("description", "Category description must contain at least 3 characters").trim().isLength({ min: 3 }).escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Category object with escaped/trimmed data and old id.
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      res.render("layout", {
        contentFile: "category_form",
        title: "Update Category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedCategory = await Category.findByIdAndUpdate(req.params.id, category, {});
      // Redirect to book detail page.
      res.redirect(updatedCategory.url);
    }
  }),
];
