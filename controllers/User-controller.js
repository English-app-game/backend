import UserService from "../services/user-service";
import UserModel from "../models/User";

const registerController = async (req,res) => {
    try{
        const user = new UserModel(req.body);
        const savedUser = await UserService.register(user);
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({message:error.message});
    }
}

export default registerController;