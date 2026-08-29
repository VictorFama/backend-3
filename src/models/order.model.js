import mongoose from "mongoose";
import { ORDER_STATUS, ORDER_STATUS_VALUES } from "../constants/orderstatus.js";
import { ORDER_PRIORITY, ORDER_PRIORITY_VALUES } from "../constants/priority.js";
import { DOCUMENT_TYPES } from "../constants/documentTypes.js";

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

// metadatos del comprobante de entrega
const proofSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      default: DOCUMENT_TYPES.DELIVERY_PROOF
    },
    uploadedAt: {
      type: Date,
      default: Date.now
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
    proof: {
      type: proofSchema,
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
