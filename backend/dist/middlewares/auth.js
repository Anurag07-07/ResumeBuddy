import jwt, {} from 'jsonwebtoken';
const authMiddleware = (req, res, next) => {
    try {
        //Get The Token
        const authtoken = req.cookies.token;
        const token = authtoken.split(" ")[1];
        //Check if the token is valid
        const checkToken = jwt.verify(token, process.env.JWT_SECRET);
        if (checkToken) {
            req.userId = checkToken.id;
            next();
        }
        else {
            return res.status(403).json({
                message: `Invalid User`
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            message: `Internal Server Error`
        });
    }
};
export default authMiddleware;
//# sourceMappingURL=auth.js.map