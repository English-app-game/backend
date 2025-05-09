import mongoose from "mongoose";
import { TABLE_NAMES } from "./tables_names";

const userSchema = new mongoose.Schema({
  name: { type: String,
     required: true },
  email: { type: String,
     required: true },
  password: { type: String, 
    required: true },
  avatarImg: { type: String,
     required: true },
  lastLogin: { type: Date, 
    required: true },
}, { timestamps: true });

const User = mongoose.model(TABLE_NAMES.USER, userSchema);

export { User as UserModel };
