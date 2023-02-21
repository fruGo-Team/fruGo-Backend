const express = require("express");
const router = express.Router();
const {
  createCustomer,
  getAllCustomers,
  getCustomerByID,
  updateCustomer,
  deleteCustomer,
} = require("./CustomerHelpers");
const { generateAccessToken } = require("../auth/authHelpers");
const {
  authenticateUser,
  allowAdminOnly,
  allowOwnerOrAdmin,
} = require("../auth/authMiddleware");

// Register a new customer
router.post("/register", async (request, response, next) => {
  let newCustomer;
  try {
    newCustomer = await createCustomer({
      email: request.body.email,
      password: request.body.password,
      username: request.body.username,
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      streetAddress: request.body.streetAddress,
      city: request.body.city,
    });
  } catch (error) {
    error.status = 422;
    return next(error);
  }
  const accessToken = await generateAccessToken(newCustomer._id);
  response
    .status(201)
    .json({ status: 201, customer: newCustomer, accessToken: accessToken });
});

// Get list of all customers (admin only)
router.get(
  "/",
  authenticateUser,
  allowAdminOnly,
  async (request, response, next) => {
    const customers = await getAllCustomers();
    response.status(200).json({
      customers: customers,
      accessToken: request.accessToken,
    });
  }
);

// Get customer profile by ID (owner or admin only)
router.get(
  "/:id",
  authenticateUser,
  allowOwnerOrAdmin,
  async (request, response, next) => {
    const customer = await getCustomerByID(request.params.id);
    response.status(200).json({
      profile: customer,
      accessToken: request.accessToken,
    });
  }
);

// Update customer (owner or admin only)
router.put(
  "/:id",
  authenticateUser,
  allowOwnerOrAdmin,
  async (request, response, next) => {
    let result = {};
    try {
      result = await updateCustomer({
        id: request.params.id,
        data: request.body,
      });
    } catch (error) {
      error.status = 400;
      return next(error);
    }
    response.status(200).json({
      status: 200,
      updates: result.updatedFields,
      accessToken: request.accessToken,
    });
  }
);

// Delete customer (owner or admin only)
router.delete(
  "/:id",
  authenticateUser,
  allowOwnerOrAdmin,
  async (request, response, next) => {
    await deleteCustomer(request.params.id);
    response.status(204).json();
  }
);

module.exports = router;
