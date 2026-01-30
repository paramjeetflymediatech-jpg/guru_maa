const multer = require("multer");
const path = require("path");
const { DOCS_ROOT } = require("../config/config");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, DOCS_ROOT),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const allowedExt = [".pdf", ".doc", ".docx"];
const allowedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExt.includes(ext) && allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else cb(new Error("Only DOC/DOCX or PDF allowed"), false);
};

const upload = multer({ storage, fileFilter });
module.exports = upload;
