const Category = require("../models/category");
const Item = require("../models/item");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

require("dotenv").config();

const myPass = process.env.MYPASS;

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

// Display list of all items. --------------------------------------------------
exports.item_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find({}, "name category stock image").sort({ title: 1 }).populate("category").exec();

  res.render("layout", {
    contentFile: "item_list",
    title: "Item List",
    item_list: allItems,
  });
});

// Display detail page for a specific item.
exports.item_detail = asyncHandler(async (req, res, next) => {
  // Get details of items, item instances for specific item
  const item = await Item.findById(req.params.id).populate("category").exec();

  if (item === null) {
    // No results.
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  res.render("layout", {
    contentFile: "item_detail",
    title: item.name,
    item: item,
  });
});

// Display detail page for a specific item.
exports.item_detail = asyncHandler(async (req, res, next) => {
  // Get details of items, item instances for specific item
  const item = await Item.findById(req.params.id).populate("category").exec();

  if (item === null) {
    // No results.
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  res.render("layout", {
    contentFile: "item_detail",
    title: item.name,
    item: item,
  });
});

// Display item create form on GET. --------------------------------------------
exports.item_create_get = asyncHandler(async (req, res, next) => {
  // Get all categories, which we can use for adding to our item.
  const allCategories = await Category.find().exec();

  res.render("layout", {
    contentFile: "item_form",
    title: "Create Item",
    categories: allCategories,
    item: null,
  });
});
// Handle item create on POST.
exports.item_create_post = [
  // Convert the category to an array.
  (req, res, next) => {
    if (!(req.body.category instanceof Array)) {
      if (typeof req.body.category === "undefined") req.body.category = [];
      else req.body.category = new Array(req.body.category);
    }
    next();
  },

  // Validate and sanitize fields.
  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("description", "Description must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("price", "Price must not be empty and it must be a number").trim().isLength({ min: 1 }).escape(),
  body("stock", "Items in stock must not be empty and it must be a number")
    .trim()
    .isLength({ min: 1 })
    .isNumeric()
    .escape(),
  body("category.*").escape(),
  body("image").escape(),
  // Process request after validation and sanitization.

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Item object with escaped and trimmed data.
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
      image: req.file.filename,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      console.log(errors);
      allCategories = await Category.find().exec();

      res.render("layout", {
        contentFile: "item_form",
        title: "Create Item",
        categories: allCategories,
        item: item,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save item.
      await item.save();
      res.redirect(item.url);
    }
  }),
];

// Display item delete form on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of the item
  const item = await Item.findById(req.params.id).exec();

  if (item === null) {
    // No results.
    res.redirect("/inventory/items");
  }

  res.render("layout", {
    contentFile: "item_delete",
    title: "Delete Item",
    item: item,
  });
});

// Handle item delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {
  if (req.body.password !== myPass) {
    return res.status(403).send("You have no access");
  }

  // Get details of items
  const item = await Item.findById(req.params.id).exec();

  await Item.findByIdAndRemove(req.body.itemid);
  res.redirect("/inventory/items");
});

// Display item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
  // Get item, authors and categories for form.
  const [item, allCategories] = await Promise.all([
    Item.findById(req.params.id).populate("category").exec(),
    Category.find().exec(),
  ]);

  if (item === null) {
    // No results.
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  res.render("layout", {
    contentFile: "item_form",
    title: "Update Item",
    categories: allCategories,
    item: item,
  });
});

// Handle item update on POST.
exports.item_update_post = [
  // Convert the categroy to an array.
  (req, res, next) => {
    if (!(req.body.category instanceof Array)) {
      if (typeof req.body.category === "undefined") {
        req.body.category = [];
      } else {
        req.body.category = new Array(req.body.category);
      }
    }
    next();
  },

  // Validate and sanitize fields.
  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("description", "Description must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("price", "Price must not be empty and it must be a number").trim().isLength({ min: 1 }).escape(),
  body("stock", "Items in stock must not be empty and it must be a number")
    .trim()
    .isLength({ min: 1 })
    .isNumeric()
    .escape(),
  body("category.*").escape(),
  body("image").escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    if (req.body.password !== myPass) {
      return res.status(403).send("You have no access");
    }

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create an Item object with escaped/trimmed data and old id.
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      category: typeof req.body.category === "undefined" ? [] : req.body.category,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (req.file) {
      console.log("Nueva foto:", req.file);
      // If a new photo was uploaded, set it in the 'item' object
      item.image = req.file.filename; // Supposing you store the image as a buffer
    }

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all categories for form
      const allCategories = await Category.find().exec();

      res.render("layout", {
        contentFile: "item_form",
        title: "Update Item",
        categories: allCategories,
        item: item,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});
      // Redirect to item detail page.
      res.redirect(updatedItem.url);
    }
  }),
];
