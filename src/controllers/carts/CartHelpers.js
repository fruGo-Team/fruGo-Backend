const { Customer } = require("../../models/Customer");
const { Cart } = require("../../models/Cart");
const { Merchant } = require("../../models/Merchant");
const { StockProduct } = require("../../models/StockProduct");

async function getCartByCustomerID(customerID) {
  try {
    const cart = await Cart.findOne({ _customer: customerID })
      .populate({
        path: "_cartProducts",
        model: "StockProduct",
        populate: { path: "_product", model: "Product" },
      })
      .exec();
    return cart;
  } catch (error) {
    console.log(error);
    error.status = 404;
    throw error;
  }
}

async function createCart(customerID) {
  try {
    const customer = await Customer.findById(customerID).exec();
    const city = customer._city.toString();
    const merchant = await Merchant.findOne({ _city: city }).exec();
    if (!merchant)
      throw { message: ": : No merchants currently found in your city" };
    const cart = await Cart.create({
      _customer: customerID,
      _merchant: merchant,
    });
    return cart;
  } catch (error) {
    console.log(error);
    error.status = 400;
    throw error;
  }
}

async function addToCart(customerID, stockProductID) {
  try {
    let cart = await Cart.findOneAndUpdate(
      {
        _customer: customerID,
        "_cartProducts": { $ne: stockProductID },
      },
      {
        $addToSet: {
          _cartProducts: stockProductID,
        },
      },
      { returnDocument: "after" }
    )
      .populate({
        path: "_cartProducts",
        model: "StockProduct",
        populate: { path: "_product", model: "Product" },
      })
      .exec();
    if (!cart) {
      cart = await Cart.findOne({ _customer: customerID })
        .populate({
          path: "_cartProducts",
          model: "StockProduct",
          populate: { path: "_product", model: "Product" },
        })
        .exec();
    }
    return cart;
  } catch (error) {
    console.log(error);
    error.status = 400;
    throw error;
  }
}

async function removeFromCart(customerID, stockProductID, query) {
  try {
    let cart;
    if (query.all == "true") {
      cart = await Cart.findOneAndUpdate(
        { _customer: customerID },
        { $set: { _cartProducts: [] } },
        { returnDocument: "after" }
      )
        .populate({
          path: "_cartProducts",
          model: "StockProduct",
          populate: { path: "_product", model: "Product" },
        })
        .exec();
    } else {
      cart = await Cart.findOneAndUpdate(
        { _customer: customerID },
        { $pull: { _cartProducts: stockProductID } },
        { returnDocument: "after" }
      )
        .populate({
          path: "_cartProducts",
          model: "StockProduct",
          populate: { path: "_product", model: "Product" },
        })
        .exec();
    }
    return cart;
  } catch (error) {
    console.log(error);
    error.status = 400;
    throw error;
  }
}

async function clearCart(customerID) {
  try {
    const cart = await Cart.findOneAndUpdate(
      { _customer: customerID },
      { $set: { _cartProducts: [] } }
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = {
  getCartByCustomerID,
  createCart,
  addToCart,
  removeFromCart,
  clearCart,
};
