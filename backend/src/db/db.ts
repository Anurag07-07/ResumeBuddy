import dotenv from 'dotenv'
import mongoose from 'mongoose';
dotenv.config()
export const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGOURI as string) 
    console.log(`Database Connected`);
  } catch (error) {
    console.log(`Database Not Connected`);
    process.exit(1)
  }
}