const { Customer } = require("../../models/Customer");
const { omit } = require("underscore");

async function createCustomer(data) {
  const customerData = {
    email: data.email,
    password: data.password,
    username: data.username,
    firstName: data.firstName,
    lastName: data.lastName,
    streetAddress: data.streetAddress,
    city: data.city,
  };
  return await Customer.create(customerData);
}

async function getAllCustomers() {
  return await Customer.find({}).exec();
}

async function getCustomerByID(customerID) {
  let customer;
  try {
    customer = await Customer.findById(customerID).exec();
  } catch (error) {
    throw {
      message: `: : No customer found with ID of ${customerID}`,
      status: 404,
    };
  }
  return customer;
}

async function updateCustomer(updateData) {
  const { id, data } = updateData;
  let originalCustomer;
  try {
    originalCustomer = await Customer.findByIdAndUpdate(id, data, {
      returnDocument: "before",
    })
      .select("+password")
      .lean()
      .exec();
  } catch (err) {
    throw { message: ": : Customer could not be found", status: 400 };
  }
  const updatedCustomer = await Customer.findById(id)
    .select("+password")
    .lean()
    .exec();
  const updatedFields = omit(updatedCustomer, (value, field) => {
    return originalCustomer[field]?.toString() === value?.toString();
  });
  // MAY NOT NEED... /////////////////////////////////////////////
  if (!Object.keys(updatedFields).length) {
    throw { message: ": : No updates specified", status: 400 };
  }
  if (updatedFields.password) {
    updatedFields.password = "Password updated";
  }
  return {
    updatedCustomer: updatedCustomer,
    updatedFields: updatedFields,
  };
}

async function deleteCustomer(customerID) {
  return await Customer.findByIdAndDelete(customerID).exec();
}

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerByID,
  updateCustomer,
  deleteCustomer,
};
