import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenvv from 'dotenv'
import { dbConnect } from './db/db.js'
dotenvv.config()

const app = express()

const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors())
app.use(cookieParser())

dbConnect()

app.listen(PORT,()=>{
  console.log(`Server Started at PORT ${PORT}`);
})