// product.js (Express Router)

const express = require("express");
const router = express.Router();
const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");

// Setup multer for file upload
const upload = multer({
  dest: "uploads/", // Temporary folder
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /xlsx|xls/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error("Only Excel files are allowed"));
  },
});

router.post("/upload-partturn-garebox", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Remove temp file
    fs.unlinkSync(req.file.path);

    res.json({
      message: "File uploaded successfully",
      data: sheetData,
    });
  } catch (error) {
    console.error("Error reading Excel:", error);
    res.status(500).json({ message: "Failed to process Excel file" });
  }
});


// POST /api/upload-multiturn
router.post("/upload-multiturn-garebox", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Remove temp file
    fs.unlinkSync(req.file.path);

    res.json({
      message: "File uploaded successfully",
      data: sheetData,
    });
  } catch (error) {
    console.error("Error reading Excel:", error);
    res.status(500).json({ message: "Failed to process Excel file" });
  }
});

router.post("/upload-multiturn-actuator", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Remove temp file
    fs.unlinkSync(req.file.path);

    res.json({
      message: "File uploaded successfully",
      data: sheetData,
    });
  } catch (error) {
    console.error("Error reading Excel:", error);
    res.status(500).json({ message: "Failed to process Excel file" });
  }
});

module.exports = router;
