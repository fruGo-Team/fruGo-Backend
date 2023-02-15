const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const { connectDatabase, disconnectDatabase } = require("./database");
const { hashString } = require("../src/controllers/auth/authHelpers");
const { City } = require("./models/City");
const { Customer } = require("./models/Customer");
const { Admin } = require("./models/Admin");
const { Merchant } = require("./models/Merchant");
const { Product } = require("./models/Product");

const cities = [
  { name: "Melbourne", state: "Victoria" },
  { name: "Sydney", state: "New South Wales" },
  { name: "Canberra", state: "Australian Capital Territory" },
  { name: "Darwin", state: "Northern Territory" },
  { name: "Perth", state: "Western Australia" },
  { name: "Adelaide", state: "South Australia" },
  { name: "Hobart", state: "Tasmania" },
];

const customers = [
  {
    email: "john_smith@email.com",
    password: null,
    username: "john_smith",
    firstName: "John",
    lastName: "Smith",
    city: null,
    streetAddress: "1234 John street",
  },
  {
    email: "sally_smith@email.com",
    password: null,
    username: "sally_smith",
    firstName: "Sally",
    lastName: "Smith",
    city: null,
    streetAddress: "1234 Sally street",
  },
];

const admin = {
  email: "admin@email.com",
  password: null,
  username: "test_admin",
  firstName: "Admin",
  lastName: "Istrator",
};

const merchants = [
  {
    email: "melbourne_merchant@email.com",
    password: null,
    username: "melbourne_merchant",
    name: "Melbourne Merchant",
    description: "The best merchant in all of Melbourne",
    streetAddress: "1234 Merchant street",
    city: null,
  },
  {
    email: "sydney_merchant@email.com",
    password: null,
    username: "sydney_merchant",
    name: "Sydney Merchant",
    description: "The best merchant in all of Sydney",
    streetAddress: "1234 Merchant street",
    city: null,
  },
  {
    email: "brisbane_merchant@email.com",
    password: null,
    username: "brisbane_merchant",
    name: "Brisbane Merchant",
    description: "The best merchant in all of Brisbane",
    streetAddress: "1234 Merchant street",
    city: null,
  },
];

const products = [
  {
    name: "Banana",
    type: "Fruits",
    price: 2.99,
  },
  {
    name: "Apple",
    type: "Fruits",
    price: 1.99,
  },
  {
    name: "Almond",
    type: "Nuts",
    price: 0.1,
  },
];

function seedDatabase(url) {
  connectDatabase(url)
    .then(() => console.log("Database connected"))
    .catch((error) => console.log("Error: Database could not be connected"))
    .then(async () => {
      if (process.env.WIPE == "true") {
        const collections = await mongoose.connection.db
          .listCollections()
          .toArray();

        collections
          .map((collection) => collection.name)
          .forEach(async (collectionName) => {
            await mongoose.connection.db.dropCollection(collectionName);
          });

        console.log("Database wiped");
      }
    })
    .then(async () => {
      // Seed cities
      const createdCities = await City.insertMany(cities);
      console.log("Cities seeded");
      // Hash each password & assign a city to each customer
      for ([index, customer] of customers.entries()) {
        customer.password = await hashString(process.env.USER_SEED_PASSWORD);
        customer.city = createdCities[index];
      }
      const createdCustomers = await Customer.insertMany(customers);
      console.log("Customers seeded");
      // Seed admin
      admin.password = await hashString(process.env.USER_SEED_PASSWORD);
      const createdAdmin = await Admin.create(admin);
      console.log("Admin seeded");
      // Seed merchants
      for ([index, merchant] of merchants.entries()) {
        merchant.password = await hashString(process.env.USER_SEED_PASSWORD);
        merchant.city = createdCities[index];
      }
      const createdMerchants = await Merchant.insertMany(merchants);
      console.log("Merchants seeded");
      // Seed products
      const createdProducts = await Product.insertMany(products);
      console.log("Products seeded");
    })
    .then(async () => {
      disconnectDatabase();

      console.log("Database disconnected");
    });
}

seedDatabase(process.env.DEV_DATABASE_URL);

module.exports = { seedDatabase };