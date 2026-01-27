// src/models/documentModel.js
const fs = require('fs');
const path = require('path');
const { BASE_URL } = require('../config/config');

const DOCS_ROOT = path.join(__dirname, '..', '..', 'public', 'docs');

// Ensure docs folder exists
if (!fs.existsSync(DOCS_ROOT)) {
  fs.mkdirSync(DOCS_ROOT, { recursive: true });
  console.log('Created docs directory at:', DOCS_ROOT);
}

function walkDocs(currentDir, relativeDir = '') {
  const items = [];
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    const relPath = relativeDir ? path.join(relativeDir, entry.name) : entry.name;

    if (entry.isDirectory()) {
      items.push(...walkDocs(fullPath, relPath));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (ext === '.pdf' || ext === '.doc' || ext === '.docx') {
        const type = ext === '.pdf' ? 'pdf' : 'doc';
        const title = path.basename(entry.name, ext);
        const urlPath = relPath.replace(/\\/g, '/');

        items.push({
          id: relPath, // use relative path as ID
          title,
          description: relativeDir || '',
          url: `${BASE_URL}/docs/${urlPath}`,
          type,
          folder: relativeDir || null,
        });
      }
    }
  }

  return items;
}

function getAllDocuments() {
  return walkDocs(DOCS_ROOT, '');
}

function deleteDocument(relativePath) {
  const fullPath = path.join(DOCS_ROOT, relativePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    return true;
  }
  return false;
}

module.exports = {
  DOCS_ROOT,
  getAllDocuments,
  deleteDocument,
};