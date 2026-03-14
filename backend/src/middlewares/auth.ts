import type { NextFunction, Request, Response } from "express"
import jwt, { type JwtPayload } from 'jsonwebtoken'


const authMiddleware = (req:Request,res:Response,next:NextFunction)=>{
  try {
    //Get The Token
    const authtoken = req.cookies.token;
    const token = authtoken.split(" ")[1]
    //Check if the token is authenticated
    const checkToken =  jwt.verify(token,process.env.JWT_SECRET as string ) as JwtPayload

    if (checkToken) {
      req.userId = checkToken.id
      next()
    }else{
      return res.status(403).json({
        message:`Invalid User`
      })
    }
  } catch (error) {
    return res.status(500).json({
      message:`Internal Server Error`
    })
  }
}

export default authMiddleware