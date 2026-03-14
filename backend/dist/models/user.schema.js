import mongoose, { Schema } from "mongoose";
export const UserModel = new Schema({
    username: {
        type: String,
        unique: [true, "username already present"],
        required: true
    },
    email: {
        type: String,
        unique: [true, "Account already exists with this email address"],
        required: true,
    },
    password: {
        type: String,
        required: true,
        select: false
    }
});
export default mongoose.model("Users", UserModel);
//# sourceMappingURL=user.schema.js.map