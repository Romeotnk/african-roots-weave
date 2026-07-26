import multer from "multer";
import { ApiError } from "../utils/errors.js";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 8,
  },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(new ApiError(400, `Unsupported file type: ${file.mimetype}`));
      return;
    }
    callback(null, true);
  },
});
