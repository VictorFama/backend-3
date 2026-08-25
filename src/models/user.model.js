import mongoose from "mongoose";
import { USER_ROLES, USER_ROLE_VALUES } from "../constants/userroles.js";

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
    // se llena en el modulo 7 con multer
    documents: {
      type: Array,
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
