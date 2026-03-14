import mongoose, { Schema, type Document } from "mongoose";
export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
}
export declare const UserModel: Schema;
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export default _default;
//# sourceMappingURL=user.schema.d.ts.map