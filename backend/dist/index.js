import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { dbConnect } from './db/db.js';
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
import userauth from './routes/auth.route.js';
app.use('/api/v1', userauth);
const PORT = process.env.PORT || 3000;
dbConnect();
app.listen(PORT, () => {
    console.log(`Server Started at PORT ${PORT}`);
});
//# sourceMappingURL=index.js.map