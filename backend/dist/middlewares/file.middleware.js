import multer from "multer";
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024
    }
});
export default upload;
//# sourceMappingURL=file.middleware.js.map