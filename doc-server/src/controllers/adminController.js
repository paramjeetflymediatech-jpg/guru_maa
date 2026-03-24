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
  getDocumentById,
  createDocument,
  deleteDocument,
  getDocumentCount,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getPaginatedCategories,
  updateDocument,
  createTextDocument,
  createHtmlDocument,
  searchDocuments,
} = require("../models/documentModel");
const User = require("../models/userModel");
const DeleteRequest = require("../models/deleteRequestModel");
const { deleteUser } = require("./userController");
const { sendPush } = require("../utils/notification");

/**
 * Helper to send push notifications to all users with registered devices
 */
async function notifyAllUsers(title, body) {
  try {
    const users = await User.find({ "devices.0": { $exists: true } });
    const allTokens = [];
    users.forEach(user => {
      user.devices.forEach(device => {
        if (device.pushToken) allTokens.push(device.pushToken);
      });
    });
    console.log(allTokens, 'dddd')
    if (allTokens.length > 0) {
      await sendPush(allTokens, { title, body });
    }
  } catch (error) {
    console.error("Error in notifyAllUsers:", error);
  }
}

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
        { icon: "🗑️", label: "Deletion Requests", link: "/admin/delete-requests" },
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
    const limit = parseInt(req.query.limit) || 9;

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
  let conversionSuccess = true;

  try {
    if (isOfficeDoc) {
      const pdfFilename = `${baseName}.pdf`;
      const outputDir = DOCS_ROOT;

      // Try to convert DOC/DOCX to PDF using LibreOffice
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
              conversionSuccess = false;
            }
            resolve();
          },
        );
      });

      const pdfPath = path.join(outputDir, pdfFilename);

      // Check if PDF was actually created
      if (conversionSuccess && fs.existsSync(pdfPath)) {
        finalFilename = pdfFilename;
        const stats = fs.statSync(pdfPath);
        finalSize = stats.size;
        finalMime = "application/pdf";

        // Delete the original DOC/DOCX file after successful conversion
        if (fs.existsSync(uploadedPath)) {
          try {
            fs.unlinkSync(uploadedPath);
          } catch (err) {
            console.error("Failed to delete original file:", err);
          }
        }
      } else {
        // Conversion failed - keep original file and return error
        console.error("PDF conversion failed - LibreOffice may not be installed or conversion failed");
        req.session.flash = {
          type: "error",
          message: "PDF conversion failed. Please install LibreOffice or upload a PDF file directly.",
        };
        return res.redirect("/admin/docs");
      }
    } else if (ext !== ".pdf") {
      // Not a PDF and not an Office document - reject it
      req.session.flash = {
        type: "error",
        message: "Only PDF, DOC, and DOCX files are allowed. Please upload a valid PDF file.",
      };
      return res.redirect("/admin/docs");
    }

    await createDocument({
      title: path.parse(req.file.originalname).name,
      filename: finalFilename,
      originalName: req.file.originalname,
      mimeType: finalMime,
      size: finalSize,
    });

    req.session.flash = {
      type: "success",
      message: isOfficeDoc
        ? "Document uploaded and converted to PDF successfully."
        : "Document uploaded successfully.",
    };
    console.log('--------------------------------bitifsidsd')
    // Trigger push notification to all users
    try {
      await notifyAllUsers("New Document Uploaded", `A new document "${path.parse(req.file.originalname).name}" is now available in the library.`);
    } catch (err) {
      console.error(err);
    }
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

// Show categories management page
async function showCategories(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;

    const result = await getPaginatedCategories(page, limit);
    const categories = result.categories;
    const pagination = result.pagination;

    res.render("admin/categories", {
      categories,
      pagination,
      currentPage: "categories",
    });
  } catch (err) {
    console.error("Categories Error:", err);
    req.session.flash = { type: "error", message: "Error loading categories." };
    res.redirect("/admin/dashboard");
  }
}

// Create new category
async function handleCategoryCreate(req, res) {
  try {
    const { name, description, icon, order } = req.body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      req.session.flash = { type: "error", message: "Category name must be at least 2 characters." };
      return res.redirect("/admin/categories");
    }

    // Sanitize inputs - limit length and trim
    const sanitizedName = name.trim().substring(0, 100);
    const sanitizedDescription = description ? description.trim().substring(0, 500) : '';
    const sanitizedIcon = icon ? icon.trim().substring(0, 10) : "📚";

    await createCategory({
      name: sanitizedName,
      description: sanitizedDescription,
      icon: sanitizedIcon,
      order: parseInt(order) || 0,
    });

    req.session.flash = {
      type: "success",
      message: "Category created successfully.",
    };
  } catch (err) {
    console.error("Create category error:", err);
    req.session.flash = { type: "error", message: "Error creating category." };
  }
  return res.redirect("/admin/categories");
}

// Update category
async function handleCategoryUpdate(req, res) {
  try {
    const { id, name, description, icon, order } = req.body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      req.session.flash = { type: "error", message: "Category name must be at least 2 characters." };
      return res.redirect("/admin/categories");
    }

    // Sanitize inputs - limit length and trim
    const sanitizedName = name.trim().substring(0, 100);
    const sanitizedDescription = description ? description.trim().substring(0, 500) : '';
    const sanitizedIcon = icon ? icon.trim().substring(0, 10) : "📚";

    await updateCategory(id, {
      name: sanitizedName,
      description: sanitizedDescription,
      icon: sanitizedIcon,
      order: parseInt(order) || 0,
    });

    req.session.flash = {
      type: "success",
      message: "Category updated successfully.",
    };
  } catch (err) {
    console.error("Update category error:", err);
    req.session.flash = { type: "error", message: "Error updating category." };
  }
  return res.redirect("/admin/categories");
}

// Delete category
async function handleCategoryDelete(req, res) {
  try {
    const { id } = req.body;
    await deleteCategory(id);
    req.session.flash = {
      type: "success",
      message: "Category deleted successfully.",
    };
  } catch (err) {
    console.error("Delete category error:", err);
    req.session.flash = { type: "error", message: "Error deleting category." };
  }
  return res.redirect("/admin/categories");
}

// Show create text content form
async function showCreateText(req, res) {
  try {
    const categories = await getAllCategories();
    res.render("admin/text-create", {
      categories,
      currentPage: "docs",
    });
  } catch (err) {
    console.error("Error loading create text page:", err);
    req.session.flash = { type: "error", message: "Error loading page." };
    res.redirect("/admin/docs");
  }
}

// Handle text content creation
async function handleTextCreate(req, res) {
  try {
    const { title, subtitle, description, textContent, category, author, totalPages, isPublished, isFeatured } = req.body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length < 2) {
      req.session.flash = { type: "error", message: "Title is required and must be at least 2 characters." };
      return res.redirect("/admin/docs/create/text");
    }

    // Validate text content for text documents
    if (!textContent || typeof textContent !== 'string' || textContent.trim().length < 10) {
      req.session.flash = { type: "error", message: "Text content is required and must be at least 10 characters." };
      return res.redirect("/admin/docs/create/text");
    }

    // Sanitize and limit inputs
    const sanitizedTitle = title.trim().substring(0, 200);
    const sanitizedSubtitle = subtitle ? subtitle.trim().substring(0, 200) : '';
    const sanitizedDescription = description ? description.trim().substring(0, 1000) : '';
    const sanitizedTextContent = textContent.trim().substring(0, 50000); // Limit to 50k chars
    const sanitizedAuthor = author ? author.trim().substring(0, 100) : '';

    await createTextDocument({
      title: sanitizedTitle,
      subtitle: sanitizedSubtitle,
      description: sanitizedDescription,
      textContent: sanitizedTextContent,
      category: category || null,
      author: sanitizedAuthor,
      totalPages: parseInt(totalPages) || 1,
      isPublished: isPublished === 'on',
      isFeatured: isFeatured === 'on',
    });

    req.session.flash = {
      type: "success",
      message: "Text content created successfully.",
    };

    // Trigger push notification to all users
    notifyAllUsers("New Content Available", `A new text document "${sanitizedTitle}" has been added.`);

  } catch (err) {
    console.error("Create text error:", err);
    req.session.flash = { type: "error", message: "Error creating text content." };
  }
  return res.redirect("/admin/docs");
}

// Show edit document page
async function showEditDoc(req, res) {
  try {
    const { id } = req.params;
    const doc = await getDocumentById(id);
    const categories = await getAllCategories();

    if (!doc) {
      req.session.flash = { type: "error", message: "Document not found." };
      return res.redirect("/admin/docs");
    }

    res.render("admin/doc-edit", {
      doc,
      categories,
      currentPage: "docs",
    });
  } catch (err) {
    console.error("Edit doc error:", err);
    req.session.flash = { type: "error", message: "Error loading document." };
    res.redirect("/admin/docs");
  }
}

// Handle document update
async function handleDocUpdate(req, res) {
  try {
    const { id } = req.params;
    const { title, subtitle, description, category, author, totalPages, isPublished, isFeatured, textContent, htmlContent } = req.body;

    // Build update object with basic fields
    const updateData = {
      title,
      subtitle,
      description,
      category: category || null,
      author,
      totalPages: parseInt(totalPages) || 1,
      isPublished: isPublished === 'on',
      isFeatured: isFeatured === 'on',
    };

    // Add text content if provided (for text documents)
    if (textContent !== undefined) {
      updateData.textContent = textContent.trim().substring(0, 50000);
    }

    // Add HTML content if provided (for HTML documents)
    if (htmlContent !== undefined) {
      updateData.htmlContent = htmlContent.trim().substring(0, 100000);
    }

    await updateDocument(id, updateData);

    req.session.flash = {
      type: "success",
      message: "Document updated successfully.",
    };
  } catch (err) {
    console.error("Update doc error:", err);
    req.session.flash = { type: "error", message: "Error updating document." };
  }
  return res.redirect("/admin/docs");
}

// Search documents
async function handleSearch(req, res) {
  try {
    const { query } = req.body;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let docs = [];
    let pagination = { page, limit, totalDocs: 0, totalPages: 0 };

    if (query && query.trim()) {
      docs = await searchDocuments(query.trim());
      // Apply pagination manually for search results
      const skip = (page - 1) * limit;
      pagination.totalDocs = docs.length;
      pagination.totalPages = Math.ceil(docs.length / limit);
      docs = docs.slice(skip, skip + limit);
    } else {
      const result = await getPaginatedDocuments(page, limit);
      docs = result.docs;
      pagination = result.pagination;
    }

    const categories = await getAllCategories();

    res.render("admin/docs", {
      docs,
      pagination,
      categories,
      searchQuery: query || '',
      currentPage: "docs",
    });
  } catch (err) {
    console.error("Search error:", err);
    req.session.flash = { type: "error", message: "Error searching documents." };
    res.redirect("/admin/docs");
  }
}

async function showDeleteRequests(req, res) {
  try {
    const requests = await DeleteRequest.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.render("admin/delete-requests", {
      title: "Deletion Requests",
      requests,
      currentPage: "delete-requests",
    });
  } catch (err) {
    console.error("Delete Requests Error:", err);
    req.session.flash = { type: "error", message: "Error loading deletion requests." };
    res.redirect("/admin/dashboard");
  }
}

async function handleDeleteRequestAction(req, res) {
  try {
    const { requestId, action } = req.body;
    console.log("[DEBUG_ADMIN_ACTION] RequestId:", requestId, "Action:", action);

    if (!requestId || !action) {
      req.session.flash = { type: "error", message: "Invalid request data." };
      return res.redirect("/admin/delete-requests");
    }

    const request = await DeleteRequest.findById(requestId);
    console.log("[DEBUG_ADMIN_ACTION] Request found:", request ? request._id : "None");

    if (!request) {
      req.session.flash = { type: "error", message: "Request not found." };
      return res.redirect("/admin/delete-requests");
    }

    if (action === "approve") {
      console.log("[DEBUG_ADMIN_ACTION] Approving deletion for user:", request.userId);
      const userDeleted = await deleteUser(request.userId);
      console.log("[DEBUG_ADMIN_ACTION] User deleted result:", userDeleted);

      if (userDeleted) {
        await DeleteRequest.findByIdAndDelete(requestId);
        console.log("[DEBUG_ADMIN_ACTION] Deletion request removed.");
        req.session.flash = { type: "success", message: "User account and request processed successfully." };
      } else {
        console.error("[DEBUG_ADMIN_ACTION] Failed to delete user record.");
        req.session.flash = { type: "error", message: "Failed to delete user record in database." };
      }
    } else if (action === "reject") {
      console.log("[DEBUG_ADMIN_ACTION] Rejecting request:", requestId);
      request.status = "rejected";
      await request.save();
      req.session.flash = { type: "success", message: "Request rejected." };
    }

    res.redirect("/admin/delete-requests");
  } catch (err) {
    console.error("[DEBUG_ADMIN_ACTION_ERROR]", err);
    req.session.flash = { type: "error", message: "System error: " + err.message };
    res.redirect("/admin/delete-requests");
  }
}

module.exports = {
  showLogin,
  handleLogin,
  logout,
  showDashboard,
  showDocs,
  handleUpload,
  handleDelete,
  // New exports
  showCategories,
  handleCategoryCreate,
  handleCategoryUpdate,
  handleCategoryDelete,
  showCreateText,
  handleTextCreate,
  showEditDoc,
  handleDocUpdate,
  handleSearch,
  showDeleteRequests,
  handleDeleteRequestAction,
};
