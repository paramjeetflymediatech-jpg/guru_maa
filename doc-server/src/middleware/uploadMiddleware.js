// middleware/uploadMiddleware.js
const multer = require("multer");
const path = require("path");
const { DOCS_ROOT } = require("../models/documentModel");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DOCS_ROOT);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExt = [".pdf", ".doc", ".docx", ".ppt"];
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedTypes = [
    "application/pdf",

    // Word
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    // Excel
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    // PowerPoint
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];
  if (allowedTypes.includes(file.mimetype) && allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
