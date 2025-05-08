import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String,
     required: true },
  email: { type: String,
     required: true },
  password: { type: String, 
    required: true },
  avatarImg: { type: String,
     required: true },
  lastLogin: { type: String, 
    required: true },
}, { timestamps: true });

const User =  mongoose.model("User", userSchema);

export { User as Usermodel}
