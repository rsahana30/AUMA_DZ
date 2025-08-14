// product.js (Express Router)

const express = require("express");
const router = express.Router();
const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");
const connection = require("../db/connection");

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

router.post("/upload-partturn-gearbox", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Map Excel headers → DB column names
    const headerMap = {
      "Duty Class": "DutyClass",
      "description": "Description",
      "Max Valve Torque\nto\n(Nm)": "MaxValveTorque_Nm",
      "Valve attachment_Flange ac-\ncording to\nEN ISO\n5211": "ValveAttachmentFlange_ISO5211",
      "Valve attachement_Max.\nShaft\ndiameter\n[mm]": "ValveAttachment_MaxShaftDiameter_mm",
      "Gearbox_type": "GearboxType",
      "Gearbox_Reduction ratio": "GearboxReductionRatio",
      "Gearbox_Factor": "GearboxFactor",
      "Gearbox_Turns for 90°": "GearboxTurnsFor90",
      "Gearbox_Input shaft\n[mm]": "GearboxInputShaft_mm",
      "Gearbox_Input mounting\nflange for multi-turn\nactuator": "GearboxInputMountingFlange",
      "Gearbox_Max input\ntorques\n[Nm]": "GearboxMaxInputTorque_Nm",
      "Gearbox_weight\n[kg]": "GearboxWeight_kg",
      "Gearbox_Addition-\nal weight\nExten-\nsion\nflange": "GearboxAdditionalWeight_ExtensionFlange",
      "Gearbox_Handwheel\nDensity\n[mm]": "GearboxHandwheelDensity_mm",
      "Gearbox_Manual\nForce\n[N]": "GearboxManualForce_N"
    };

    // Read Excel
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,    // Keep headers
      defval: null, // Preserve blanks
      blankrows: false
    });

    fs.unlinkSync(req.file.path); // remove temp file

    if (rawData.length < 2) {
      return res.status(400).json({ message: "Excel file has no data" });
    }

    // Map Excel headers to DB columns
    const excelHeaders = rawData[0];
    const dbColumns = excelHeaders.map(h => {
      if (!headerMap[h]) {
        throw new Error(`Excel header "${h}" does not match any DB column`);
      }
      return `\`${headerMap[h]}\``;
    });

    // Data rows
    const values = rawData.slice(1).map(row =>
      excelHeaders.map((_, colIndex) => row[colIndex] ?? null)
    );

    // Insert query
    const insertQuery = `
      INSERT INTO Partturn_Gearbox (${dbColumns.join(", ")})
      VALUES ?
    `;

    connection.query(insertQuery, [values], (err) => {
      if (err) {
        console.error("DB Insert Error:", err);
        return res.status(500).json({ message: "Database insert failed" });
      }
      res.json({
        message: "✅ Excel data inserted into Partturn_Gearbox",
        insertedRows: values.length
      });
    });

  } catch (error) {
    console.error("Processing Error:", error);
    res.status(500).json({ message: error.message || "Failed to process Excel" });
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
