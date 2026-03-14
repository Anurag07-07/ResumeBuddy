const authMiddleware = (req, res, next) => {
    try {
        //Get The Token
        const authtoken = req.cookies.token;
        const token = authtoken.split(" ")[1];
        console.log(token);
        next();
    }
    catch (error) {
        return res.status(403).json({
            message: `Invalid User`
        });
    }
};
export default authMiddleware;
//# sourceMappingURL=auth.js.map