import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();
export const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGOURI);
        console.log(`Database Connected`);
    }
    catch (error) {
        console.log(`Database Not Connected`);
        process.exit(1);
    }
};
//# sourceMappingURL=db.js.map