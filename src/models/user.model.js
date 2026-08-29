import mongoose from "mongoose";
import { USER_ROLES, USER_ROLE_VALUES } from "../constants/userroles.js";
import { DOCUMENT_TYPE_VALUES } from "../constants/documentTypes.js";

// metadatos del archivo
const documentSchema = new mongoose.Schema(
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
      enum: DOCUMENT_TYPE_VALUES,
      required: true
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

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: USER_ROLE_VALUES,
      default: USER_ROLES.CUSTOMER
    },
    documents: {
      type: [documentSchema],
      default: []
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
