import multer from "multer";
import fs from "fs";
import path from "path";

export const uploadImage = (folder) => {
  const uploadPath = `uploads/${folder}`;

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  });

  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
  });
};
