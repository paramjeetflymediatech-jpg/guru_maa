// app.js
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");
const { PORT } = require("./src/config/config");
const apiRoutes = require("./src/routes/apiRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const { DOCS_ROOT } = require("./src/models/documentModel");
const connectDB = require("./src/config/db");

const app = express();

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(
  session({
    secret: "admin-session-secret",
    resave: false,
    saveUninitialized: false,
  }),
);


// Flash middleware
app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  res.locals.formData = req.session.formData; // Expose Sticky Form Data
  delete req.session.formData;
  res.locals.currentPage = null; // Default currentPage
  res.locals.user = req.session.isAdmin ? { name: "Admin" } : null; // Mock user
  next();
});

// Static docs - with proper MIME types
const mimeTypes = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

app.use("/docs", express.static(DOCS_ROOT, {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }
  }
}));

// Dedicated PDF serving route with explicit Content-Type
const fs = require('fs');
app.get('/pdf/:filename', (req, res) => {
  const filename = req.params.filename;
  
  // Prevent directory traversal attacks
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\') || filename.includes('\0')) {
    console.error('Path traversal attempt detected:', filename);
    return res.status(400).send('Invalid filename');
  }
  
  const filePath = path.join(DOCS_ROOT, filename);
  
  // Ensure the resolved path is within DOCS_ROOT
  const resolvedPath = path.resolve(filePath);
  const docsRootPath = path.resolve(DOCS_ROOT);
  if (!resolvedPath.startsWith(docsRootPath)) {
    console.error('Path traversal attempt detected - resolved path outside docs root:', resolvedPath);
    return res.status(400).send('Invalid filename');
  }
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }
  
  const ext = path.extname(filename).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  
  fs.createReadStream(filePath).pipe(res);
}); 
// Views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

// For EJS layout() helper
// const expressLayouts = require("express-ejs-layouts");
// app.use(expressLayouts);

// Routes
app.use("/api", apiRoutes);
app.use("/admin", adminRoutes);

app.get("/", async (req, res) => {
  return res.render("index.ejs", { title: "Home" });
});

app.get("/privacy-policy", (req, res) => {
  return res.render("privacy-policy.ejs", { title: "Privacy Policy" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
