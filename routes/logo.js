const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// -------------------------------
// Multer storage config
// -------------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save to /uploads
  },
  filename: function (req, file, cb) {
    const storeDomain = req.body.storeDomain; // Shopify domain
    const ext = path.extname(file.originalname);
    cb(null, `${storeDomain}-logo${ext}`);
  }
});

// Validate image type
function fileFilter(req, file, cb) {
  const allowed = ["image/png", "image/jpeg", "image/jpg"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PNG/JPG images are allowed"));
  }
}

const upload = multer({ storage, fileFilter });

// -------------------------------
// POST /api/logo/upload
// -------------------------------
router.post("/upload", upload.single("logo"), (req, res) => {
  const storeDomain = req.body.storeDomain;

  if (!req.file) {
    return res.status(400).json({ error: "File upload failed" });
  }

  return res.json({
    success: true,
    message: "Logo uploaded successfully",
    logoPath: `/uploads/${storeDomain}-logo${path.extname(req.file.originalname)}`
  });
});

module.exports = router;
