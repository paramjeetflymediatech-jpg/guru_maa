// src/controllers/apiDocController.js
const { getAllDocuments } = require('../models/documentModel');

function listDocs(req, res) {
  const docs = getAllDocuments();
  return res.json(docs);
}

module.exports = { listDocs };