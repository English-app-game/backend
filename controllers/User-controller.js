import register from "../services/User-service.js";
import {UserModel} from "../models/User.js";

const registerController = async (req,res) => {
    try{
        const user = new UserModel(req.body);
        const savedUser = await register(user);
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({message:error.message});
    }
}

export default registerController;