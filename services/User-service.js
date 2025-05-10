import UserModel from "../models/User";
import bcrypt from "bcrypt"

const register = async (user) => {
    const existingUser = await UserModel.findOne({email:user.email});
    if(existingUser) {
        throw new Error('Email already in use');
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