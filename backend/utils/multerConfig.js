import multer from "multer";
import path from "path";
import fs from "fs";

export const createMulterUploader = ({
    folder,
    type = "single", // "single" | "array" | "fields"
    fieldName = "document",
    maxSizeMB = 10,
    allowedExt = [".pdf"],
    allowedMime = ["application/pdf"],
}) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = path.join("uploads", folder);
            fs.mkdirSync(uploadPath, { recursive: true });
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(
                null,
                `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
            );
        },
    });

    const fileFilter = (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExt.includes(ext) && allowedMime.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    `Only files of type: ${allowedExt.join(", ")} are allowed.`
                )
            );
        }
    };

    const upload = multer({
        storage,
        limits: { fileSize: maxSizeMB * 1024 * 1024 },
        fileFilter,
    });

    if (type === "single") return upload.single(fieldName);
    if (type === "array") return upload.array(fieldName);
    return upload;
};
