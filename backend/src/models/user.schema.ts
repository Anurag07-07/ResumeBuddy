import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document{
  username:string,
  email:string
  password:string
}

export const UserModel:Schema = new Schema({
  username:{
    type:String,
    unique:[true,"username already present"],
    required:true
  },
  email:{
    type:String,
    unique:[true,"Account already exists with this email address"],
    required:true,
  },
  password:{
    type:String,
    required:true,
    select:false
  }
})

export default mongoose.model<IUser>("Users",UserModel)