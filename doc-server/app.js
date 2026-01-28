// app.js
const express = require("express");
const cors = require("cors");
const session = require("express-session");
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  res.locals.user = req.session.isAdmin ? { name: 'Admin' } : null; // Mock user
  next();
});

// Static docs
app.use("/docs", express.static(DOCS_ROOT));

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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
