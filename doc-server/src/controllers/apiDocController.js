// src/controllers/apiDocController.js
const { getAllDocuments } = require("../models/documentModel");

async function listDocs(req, res) {
  try {
    const docs = await getAllDocuments();
    return res.json({ docs: docs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = { listDocs };
