const mongoose = require("mongoose");
const { fakerDE: faker } = require("@faker-js/faker");
const Category = require("./models/category"); // Asegúrate de tener la ruta correcta
const Item = require("./models/item"); // Asegúrate de tener la ruta correcta

require("dotenv").config();

const mongoDB = process.env.MONGODB_URI;

main().catch((err) => console.error(err));

async function main() {
  await mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

  const categories = await createCategories(5); // Cambia el número de categorías que deseas crear
  await createItems(20, categories); // Cambia el número de elementos que deseas crear

  mongoose.connection.close();
}

async function createCategories(count) {
  const categories = [];

  for (let i = 0; i < count; i++) {
    const categoryData = {
      name: faker.commerce.department(),
      description: faker.lorem.sentence(),
    };

    const category = new Category(categoryData);
    await category.save();
    categories.push(category);
  }

  return categories;
}

async function createItems(count, categories) {
  for (let i = 0; i < count; i++) {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    const itemData = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: faker.commerce.price(),
      stock: 1,
      category: [randomCategory._id],
    };

    const item = new Item(itemData);
    await item.save();
  }
}
