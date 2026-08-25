import mongoose from "mongoose";
import { ORDER_STATUS, ORDER_STATUS_VALUES } from "../constants/orderstatus.js";
import { ORDER_PRIORITY, ORDER_PRIORITY_VALUES } from "../constants/priority.js";

// el item guarda el nombre y el precio del momento de la compra
const orderItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  },
  {
    _id: false
  }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true
    },
    items: {
      type: [orderItemSchema],
      required: true
    },
    deliveryAddress: {
      type: String,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ORDER_STATUS_VALUES,
      default: ORDER_STATUS.CREATED
    },
    priority: {
      type: String,
      enum: ORDER_PRIORITY_VALUES,
      default: ORDER_PRIORITY.NORMAL
    },
    // se llena en el modulo 7 con multer
    proof: {
      type: Object,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const OrderModel = mongoose.model("Order", orderSchema);

export default OrderModel;
