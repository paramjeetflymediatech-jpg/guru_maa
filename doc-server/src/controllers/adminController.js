// src/controllers/adminController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");
const SOFFICE_PATH = process.env.LIBREOFFICE_PATH || "soffice";
const {
  DOCS_ROOT,
  getAllDocuments,
  getPaginatedDocuments,
  createDocument,
  deleteDocument,
  getDocumentCount,
} = require("../models/documentModel");
const User = require("../models/userModel");

function showLogin(req, res) {
  try {
    return res.render("admin/login", { title: "Admin Login", error: null });
  } catch (error) {
    return res.render("admin/login", { error: error.message });
  }
}

async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email: email, role: "admin" });
    if (!admin) {
      req.session.flash = { type: "error", message: "Invalid credentials" };
      return res.redirect("/admin/login");
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      req.session.flash = { type: "error", message: "Invalid credentials" };
      return res.redirect("/admin/login");
    }

    const token = jwt.sign(
      { id: admin._id, role: "ADMIN" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: false, // true in production
    });
    console.log("done");
    return res.redirect("/admin/dashboard");
  } catch (error) {
    req.session.flash = { type: "error", message: error.message };
    return res.redirect("/admin/login");
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
}

async function showDashboard(req, res) {
  try {
    const docCount = await getDocumentCount();
    const userCount = await User.countDocuments();
    const docs = await getAllDocuments();
    const recentDocs = docs.slice(0, 5);

    const data = {
      title: "Dashboard",
      subtitle: "Welcome back! Here's your admin overview.",
      currentPage: "dashboard",
      stats: [
        {
          icon: "📄",
          label: "Documents",
          value: docCount,
          change: "total files",
        },
        { icon: "📚", label: "API Docs", value: 5, change: "endpoints" },
        { icon: "💾", label: "Storage", value: "125 MB", change: "used" },
        {
          icon: "👥",
          label: "Users",
          value: userCount,
          change: "active users",
        },
      ],
      actions: [
        { icon: "➕", label: "Upload Document", link: "/admin/docs" },
        { icon: "📝", label: "API Docs", link: "/admin/api-docs" },
        { icon: "⚙️", label: "Settings", link: "/admin/settings" },
      ],
      recentDocs: recentDocs,
      systemStatus: [
        {
          label: "Database",
          description: "MongoDB",
          status: "Connected",
          type: "active",
        },
        {
          label: "API Server",
          description: "Express.js",
          status: "Running",
          type: "active",
        },
        {
          label: "Storage",
          description: "Local Disk",
          status: "Available",
          type: "active",
        },
      ],
    };

    res.render("admin/dashboard", data);
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.render("admin/dashboard", {
      title: "Dashboard",
      subtitle: "Error loading dashboard",
      currentPage: "dashboard",
      stats: [],
      actions: [],
      recentDocs: [],
      systemStatus: [],
    });
  }
}

async function showDocs(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Using getPaginatedDocuments instead of getAllDocuments
    const result = await getPaginatedDocuments(page, limit);
    const docs = result.docs;
    const pagination = result.pagination;

    res.render("admin/docs", {
      docs,
      pagination,
      currentPage: "docs",
    });
  } catch (err) {
    console.error("Docs Error:", err);
    req.session.flash = { type: "error", message: "Error loading documents." };
    res.redirect("/admin/dashboard");
  }
}

// Multer sets req.file
async function handleUpload(req, res) {
  if (!req.file) {
    req.session.flash = { type: "error", message: "No file uploaded." };
    return res.redirect("/admin/docs");
  }

  const uploadedPath = req.file.path || path.join(DOCS_ROOT, req.file.filename);
  const ext = path.extname(req.file.originalname).toLowerCase();
  const baseName = path.parse(req.file.filename).name;

  const isOfficeDoc =
    ext === ".doc" ||
    ext === ".docx" ||
    (req.file.mimetype || "").includes("msword") ||
    (req.file.mimetype || "").includes("officedocument.wordprocessingml");

  let finalFilename = req.file.filename;
  let finalMime = req.file.mimetype;
  let finalSize = req.file.size;

  try {
    if (isOfficeDoc) {
      const pdfFilename = `${baseName}.pdf`;
      const outputDir = DOCS_ROOT;

      await new Promise((resolve) => {
        execFile(
          SOFFICE_PATH,
          [
            "--headless",
            "--convert-to",
            "pdf",
            "--outdir",
            outputDir,
            uploadedPath,
          ],
          (error, stdout, stderr) => {
            if (error) {
              console.error("LibreOffice conversion error:", error, stderr);
            }
            resolve();
          },
        );
      });

      const pdfPath = path.join(outputDir, pdfFilename);
      if (fs.existsSync(pdfPath)) {
        finalFilename = pdfFilename;
        const stats = fs.statSync(pdfPath);
        finalSize = stats.size;
        finalMime = "application/pdf";
      }
    }

    await createDocument({
      title: path.parse(req.file.originalname).name,
      filename: finalFilename,
      originalName: req.file.originalname,
      mimeType: finalMime,
      size: finalSize,
    }); 
    if (ext !== ".pdf") {
      if (fs.existsSync(uploadedPath)) {
        fs.unlinkSync(uploadedPath);
      }
    }
    req.session.flash = {
      type: "success",
      message: isOfficeDoc
        ? "Document uploaded and converted to PDF successfully."
        : "Document uploaded successfully.",
    };
  } catch (err) {
    console.error(err);
    req.session.flash = {
      type: "error",
      message: "Error uploading or converting document.",
    };
  }

  return res.redirect("/admin/docs");
}

async function handleDelete(req, res) {
  const docId = req.body.id; // Expecting MongoDB _id now
  if (!docId) {
    req.session.flash = { type: "error", message: "Invalid document ID." };
    return res.redirect("/admin/docs");
  }

  try {
    const success = await deleteDocument(docId);
    if (success) {
      req.session.flash = {
        type: "success",
        message: "Document deleted successfully.",
      };
    } else {
      req.session.flash = {
        type: "error",
        message: "Failed to delete document.",
      };
    }
  } catch (err) {
    req.session.flash = { type: "error", message: "Error deleting document." };
  }
  return res.redirect("/admin/docs");
}

module.exports = {
  showLogin,
  handleLogin,
  logout,
  showDashboard,
  showDocs,
  handleUpload,
  handleDelete,
};
