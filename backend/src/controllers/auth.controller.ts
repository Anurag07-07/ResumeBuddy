import type { Request, Response } from "express";
import userSchema, { UserModel } from "../models/user.schema.js";
import bcrypt from 'bcrypt'

export const Signup = async (req:Request,res:Response) => {
  try {
    const {username,email,password} = req.body 

    //Check User Already present
    const isPresent = await userSchema.findOne({email:email})
    if (isPresent) {
      return res.status(411).json({
        message:`User Already present`
      })
    }else{
      //Hash The Password
      const salt = await bcrypt.genSalt()
      const HashPassword = await bcrypt.hash(password,salt)

      await userSchema.create({
        username:username,
        password:HashPassword,
        email:email
      })

      return res.status(200).json({
        message:`User Created Successfully`
      })

    }
  } catch (error) {
    return res.status(500).json({
      message:`Internal Server Error`
    })
  }
}