// controllers/apiDocController.js
const Document = require("../models/Document");

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File required" });
    }
    const ext = path.extname(file.originalname);
    const randomName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    const { title, subtitle, totalPages } = req.body;

    const doc = await Document.create({
      title,
      subtitle,
      type: req.file.mimetype,
      totalPages: totalPages || 1,
      url: `uploads/documents/${randomName}`,
      createdBy: req.user.id,
    });

    res.json({
      success: true,
      data: doc,
    });
  } catch (err) {
    console.error("Upload doc error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
};
