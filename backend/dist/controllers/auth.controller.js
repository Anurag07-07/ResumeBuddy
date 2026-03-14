import userSchema, { UserModel } from "../models/user.schema.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
export const Signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        //Check User Already present
        const isPresent = await userSchema.findOne({
            $or: [{ email: email }, { username: username }]
        });
        if (isPresent) {
            return res.status(411).json({
                message: `User Already present`
            });
        }
        else {
            //Hash The Password
            const salt = await bcrypt.genSalt();
            const HashPassword = await bcrypt.hash(password, salt);
            const user = await userSchema.create({
                username: username,
                password: HashPassword,
                email: email
            });
            const token = jwt.sign({ id: user._id, username: username }, process.env.JWT_SECRET, { expiresIn: "1d" });
            //Create A Token
            res.cookie("token", token);
            return res.status(200).json({
                message: `User Created Successfully`,
                user: user
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            message: `Internal Server Error`
        });
    }
};
export const Signin = async (req, res) => {
    try {
        const { username, password } = req.body;
        //Check User Already present
        const isPresent = await userSchema.findOne({ username: username }).select('+password');
        if (isPresent) {
            //Check the password
            const isMatched = await bcrypt.compare(password, isPresent.password);
            if (isMatched) {
                const token = jwt.sign({ id: isPresent._id, username: username }, process.env.JWT_SECRET, { expiresIn: "1d" });
                //Create A Token
                res.cookie("token", `Bearer ${token}`);
                console.log(4);
                return res.status(200).json({
                    message: `User Login`,
                    user: isPresent
                });
            }
            else {
                return res.status(400).json({
                    message: `Invalid email and password`
                });
            }
        }
        else {
            return res.status(400).json({
                message: `User Not Present`
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            message: `Internal Server Error`
        });
    }
};
//# sourceMappingURL=auth.controller.js.map