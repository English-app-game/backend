import {UserModel} from "../models/User.js";
import bcrypt from "bcrypt"

const register = async (user) => {
    const existingUser = await UserModel.findOne({
        $or: [{ email: user.email }, { name: user.name }],
      });
      
    if(existingUser) {
        if(existingUser.email === user.email) {
            throw new Error("Email already in use")
        }
        else if (existingUser.name === user.name){
            throw new Error("User name already in use")
        }
    }

    const hashedPassword = await bcrypt.hash(user.password,10);
    user.password = hashedPassword;

    const newUser = new UserModel(user);
    const error = newUser.validateSync();
    if(error){
        throw error;
    }
    return newUser.save();
}

export default register;