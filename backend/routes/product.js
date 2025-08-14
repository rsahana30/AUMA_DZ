// backend/routes/upload.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const xlsx = require("xlsx");
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

// ----------------- MULTITURN GEARBOX -----------------

const MULTITURN_DB_COLUMNS = [
  "GearboxType",
  "GearboxReductionRatio",
  "ActuatorType",
  "InputMountingFlange_EN_ISO_5210",
  "InputMountingFlange_DIN_3210",
  "PermissibleWeight_MultiTurnActuator",
  "GearboxFactor",
  "GearboxMaxInputNominalTorque_Nm",
  "GearboxMaxInputModulatingTorque_Nm",
  "GearboxInputShaft_Standard_mm",
  "GearboxInputShaft_Option_mm",
  "GearboxWeight_kg",
  "ValveAttachment_Standard_EN_ISO_5210",
  "ValveAttachment_Option_DIN_3210",
  "MaxValveNominalTorque_Nm",
  "MaxValveModulatingTorque_Nm"
];

const MULTITURN_ALIASES = {
  "gearboxtype": "GearboxType",
  "gearboxreductionratio": "GearboxReductionRatio",
  "aumamultiturnactuators": "ActuatorType",
  "inputmountingflangeenis05210": "InputMountingFlange_EN_ISO_5210",
  "inputmountingflangedin3210": "InputMountingFlange_DIN_3210",
  "permissibleweightmultiturnactuator": "PermissibleWeight_MultiTurnActuator",
  "gearboxfactor": "GearboxFactor",
  "gearboxmaxinputnominaltorquenm": "GearboxMaxInputNominalTorque_Nm",
  "gearboxmaxinputmodulatingtorquenm": "GearboxMaxInputModulatingTorque_Nm",
  "gearboxinputshaftstandardmm": "GearboxInputShaft_Standard_mm",
  "gearboxinputshaftoptionmm": "GearboxInputShaft_Option_mm",
  "gearboxweightkg": "GearboxWeight_kg",
  "valveattachmentstandardeniso5210": "ValveAttachment_Standard_EN_ISO_5210",
  "valveattachmentoptionoptiondin3210": "ValveAttachment_Option_DIN_3210",
  "maxvalvenominaltorque": "MaxValveNominalTorque_Nm",
  "maxvalvemodulatingtorque": "MaxValveModulatingTorque_Nm"
};

const NUMERIC_COLUMNS = [
  "PermissibleWeight_MultiTurnActuator",
  "GearboxFactor",
  "GearboxMaxInputNominalTorque_Nm",
  "GearboxMaxInputModulatingTorque_Nm",
  "GearboxInputShaft_Standard_mm",
  "GearboxInputShaft_Option_mm",
  "GearboxWeight_kg",
  "MaxValveNominalTorque_Nm",
  "MaxValveModulatingTorque_Nm"
];



router.post("/upload-multiturn-garebox", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const workbook = xlsx.readFile(req.file.path);
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
    fs.unlinkSync(req.file.path);

    if (!rows.length) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    // Normalize headers
    const excelHeaders = Object.keys(rows[0]);
    const normalizedExcelHeaders = {};
    excelHeaders.forEach(h => {
      normalizedExcelHeaders[normalize(h)] = h;
    });

    // Map headers to DB columns
    const headerMap = {};
    MULTITURN_DB_COLUMNS.forEach(col => {
      const aliasKey = Object.keys(MULTITURN_ALIASES).find(k => MULTITURN_ALIASES[k] === col);
      headerMap[col] =
        normalizedExcelHeaders[aliasKey] ||
        normalizedExcelHeaders[normalize(col)] ||
        excelHeaders.find(h => normalize(h) === normalize(col)) ||
        null;
    });

    // Prepare cleaned data
    const cleanedData = prepareData(rows, MULTITURN_DB_COLUMNS, headerMap);

    // Insert into DB
    const sql = `INSERT INTO Multiturn_Gearbox (${MULTITURN_DB_COLUMNS.join(", ")}) VALUES ?`;
    connection.query(sql, [cleanedData], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database insert failed", error: err });
      }
      res.json({ message: "✅ Uploaded successfully." });
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to process Excel file", error: err.message });
  }
});

// ----------------- MULTITURN ACTUATOR -----------------

const ACTUATOR_DB_COLUMNS = [
  "ActuatorType",
  "OutputSpeedRpm_50Hz",
  "OutputSpeedRpm_60Hz",
  "TorqueRangeMin_Nm",
  "TorqueRange_S2_15min_Max_Nm",
  "TorqueRange_S2_30min_Max_Nm",
  "RunTorque_S2_15min_Max_Nm",
  "RunTorque_S2_30min_Max_Nm",
  "NumberOfStartsPerHour",
  "ValveAttachmentStandard_ISO5210",
  "ValveAttachmentOption_DIN3210",
  "ValveAttachmentMaxDensityRisingStem_mm",
  "HandwheelDensity_mm",
  "HandwheelReductionRatio",
  "Weight_kg"
];

const ACTUATOR_ALIASES = {
  "actuatortype": "ActuatorType",
  "outputspeedrpm50hz": "OutputSpeedRpm_50Hz",
  "outputspeedrpm60hz": "OutputSpeedRpm_60Hz",
  "torquerangemin": "TorqueRangeMin_Nm",
  "torqueranges215minmaxnm": "TorqueRange_S2_15min_Max_Nm",
  "torqueranges230minmaxnm": "TorqueRange_S2_30min_Max_Nm",
  "runtorques215minmaxnm": "RunTorque_S2_15min_Max_Nm",
  "runtorques230minmaxnm": "RunTorque_S2_30min_Max_Nm",
  "numberofstartsstartsmax1h": "NumberOfStartsPerHour",
  "numberofstartsperhour": "NumberOfStartsPerHour",
  "valveattachmentstandardeniso5210": "ValveAttachmentStandard_ISO5210",
  "valveattachmentoptiondin3210": "ValveAttachmentOption_DIN3210",
  "valveattachmentmaxdensityrisingstemmm": "ValveAttachmentMaxDensityRisingStem_mm",
  "handwheeldensitymm": "HandwheelDensity_mm",
  "handwheelreductionratio": "HandwheelReductionRatio",
  "weight approx. [kg]": "Weight_kg",
"weightapproxkg": "Weight_kg",
"weightkg": "Weight_kg",
"weightapprox(kg)": "Weight_kg"

};

// ----------------- UPLOAD ROUTE -----------------

router.post("/upload-multiturn-actuator", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const workbook = xlsx.readFile(req.file.path);
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
    fs.unlinkSync(req.file.path);

    if (!rows.length) return res.status(400).json({ message: "Excel file is empty" });

    const excelHeaders = Object.keys(rows[0]);

    // Normalize Excel headers
    const normalizedExcelHeaders = {};
    excelHeaders.forEach(h => normalizedExcelHeaders[normalize(h)] = h);

    // Map DB columns to Excel headers
    const headerMap = {};
    ACTUATOR_DB_COLUMNS.forEach(col => {
      const aliasKey = Object.keys(ACTUATOR_ALIASES).find(k => ACTUATOR_ALIASES[k] === col);
      // 1️⃣ Alias
      if (aliasKey) {
        const normalizedAlias = normalize(aliasKey);
        if (normalizedExcelHeaders[normalizedAlias]) {
          headerMap[col] = normalizedExcelHeaders[normalizedAlias];
          return;
        }
      }
      // 2️⃣ Normalized DB column
      if (normalizedExcelHeaders[normalize(col)]) {
        headerMap[col] = normalizedExcelHeaders[normalize(col)];
        return;
      }
      // 3️⃣ Fuzzy match
      let bestDist = Infinity;
      let bestMatch = null;
      excelHeaders.forEach(h => {
        const dist = levenshtein(normalize(h), normalize(col));
        if (dist < bestDist && dist <= 3) {
          bestDist = dist;
          bestMatch = h;
        }
      });
      if (bestMatch) {
        headerMap[col] = bestMatch;
        return;
      }
      // 4️⃣ Not found
      headerMap[col] = null;
    });

    const missingColumns = ACTUATOR_DB_COLUMNS.filter(col => !headerMap[col]);
    if (missingColumns.length) console.warn("Missing Excel columns:", missingColumns);

    // Prepare data
    const cleanedData = rows.map(row => {
      return ACTUATOR_DB_COLUMNS.map(col => {
        const excelKey = headerMap[col];
        let val = excelKey ? row[excelKey] : null;
        if (val === undefined || val === null || val === "" || val === "–") return null;

        val = String(val).trim();

        // TEXT columns
        if (["ActuatorType","ValveAttachmentStandard_ISO5210","ValveAttachmentOption_DIN3210",
             "ValveAttachmentMaxDensityRisingStem_mm","HandwheelReductionRatio"].includes(col)) 
          return val;

        // INTEGER columns
        if (["NumberOfStartsPerHour","TorqueRangeMin_Nm","TorqueRange_S2_15min_Max_Nm",
             "TorqueRange_S2_30min_Max_Nm","RunTorque_S2_15min_Max_Nm","RunTorque_S2_30min_Max_Nm",
             "HandwheelDensity_mm"].includes(col))
          return val ? Math.round(parseFloat(val.replace(",", "."))) : null;

        // FLOAT / REAL columns
        if (["OutputSpeedRpm_50Hz","OutputSpeedRpm_60Hz","Weight_kg"].includes(col)) {
    if (!val || val === "–") return null;

    // Remove all non-digit, non-dot, non-comma chars
    val = val.replace(/[^\d,.-]/g, "").trim();

    // Replace comma with dot
    val = val.replace(",", ".");

    // Parse as float
    const parsed = parseFloat(val);
    return isNaN(parsed) ? null : parsed;
}


        return val;
      });
    });

    // Filter empty rows
    const filteredData = cleanedData.filter(row => row.some(cell => cell !== null));
    if (!filteredData.length) return res.status(400).json({ message: "No valid data to insert" });

    const sql = `INSERT INTO Multiturn_Actuator (${ACTUATOR_DB_COLUMNS.join(", ")}) VALUES ?`;
    connection.query(sql, [filteredData], (err, result) => {
      if (err) return res.status(500).json({ message: "Database insert failed", error: err });
      res.json({ message: `✅ Uploaded successfully.` });
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to process Excel file", error: err.message });
  }
});




// POST route for manual entry
router.post("/save-partturn-garebox", (req, res) => {
  try {
    const data = req.body;

    // Define numeric fields
    const numericFields = [
      "MaxValveTorque_Nm",
      "GearboxReductionRatio",
      "GearboxFactor",
      "GearboxTurnsFor90",
      "GearboxInputShaft_mm",
      "GearboxMaxInputTorque_Nm",
      "GearboxWeight_kg",
      "GearboxAdditionalWeight_ExtensionFlange",
      "GearboxHandwheelDensity_mm",
      "GearboxManualForce_N",
    ];

    // Map incoming fields to DB columns, convert empty strings to null for numeric columns
    const values = PARTTURN_DB_COLUMNS.map((col) => {
      let value = "";
      switch (col) {
        case "DutyClass":
          value = data.duty_class_name || null;
          break;
        case "Description":
          value = data.description || null;
          break;
        case "MaxValveTorque_Nm":
          value = data.valve_max_valve_torque || null;
          break;
        case "ValveAttachmentFlange_ISO5211":
          value = data.valve_flange_iso5211 || null;
          break;
        case "ValveAttachment_MaxShaftDiameter_mm":
          value = data.valve_max_shaft_diameter || null;
          break;
        case "GearboxType":
          value = data.type || null;
          break;
        case "GearboxReductionRatio":
          value = data.gearbox_reduction_ratio || null;
          break;
        case "GearboxFactor":
          value = data.gearbox_factor || null;
          break;
        case "GearboxTurnsFor90":
          value = data.gearbox_turns_90 || null;
          break;
        case "GearboxInputShaft_mm":
          value = data.gearbox_input_shaft || null;
          break;
        case "GearboxInputMountingFlange":
          value = data.gearbox_input_mounting_flange || null;
          break;
        case "GearboxMaxInputTorque_Nm":
          value = data.gearbox_max_input_torques || null;
          break;
        case "GearboxWeight_kg":
          value = data.gearbox_weight || null;
          break;
        case "GearboxAdditionalWeight_ExtensionFlange":
          value = data.gearbox_additional_weight_extension_flange || null;
          break;
        case "GearboxHandwheelDensity_mm":
          value = data.gearbox_handwheel_diameter || null;
          break;
        case "GearboxManualForce_N":
          value = data.gearbox_manual_force || null;
          break;
        default:
          value = data[col] || null;
      }

      // Convert numeric fields to number type if not null
      if (numericFields.includes(col) && value !== null) {
        value = Number(value) || null;
      }

      return value;
    });

    const sql = `INSERT INTO Partturn_Gearbox (${PARTTURN_DB_COLUMNS.join(
      ", "
    )}) VALUES (?)`;

    connection.query(sql, [values], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database insert failed", error: err });
      }
      res.json({ message: "✅ Partturn saved successfully!" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save Partturn", error: err.message });
  }
});


//save multiturn gearbox
router.post("/save-multiturn-garebox", (req, res) => {
  try {
    const data = req.body;

    // Numeric fields that must be converted to numbers
    const numericFields = [
      "GearboxReductionRatio",
      "PermissibleWeight_MultiTurnActuator",
      "GearboxFactor",
      "GearboxMaxInputNominalTorque_Nm",
      "GearboxMaxInputModulatingTorque_Nm",
      "GearboxInputShaft_Standard_mm",
      "GearboxInputShaft_Option_mm",
      "GearboxWeight_kg",
      "MaxValveNominalTorque_Nm",
      "MaxValveModulatingTorque_Nm"
    ];

    // Map incoming request fields to DB columns
    const values = MULTITURN_DB_COLUMNS.map((col) => {
      let value = null;
      switch (col) {
        case "GearboxType":
          value = data.gearbox_type || null;
          break;
        case "GearboxReductionRatio":
          value = data.gearbox_reduction_ratio || null;
          break;
        case "ActuatorType":
          value = data.auma_multi_turn_actuators || null;
          break;
        case "InputMountingFlange_EN_ISO_5210":
          value = data.input_mounting_flange_en_iso_5210 || null;
          break;
        case "InputMountingFlange_DIN_3210":
          value = data.input_mounting_flange_din_3210 || null;
          break;
        case "PermissibleWeight_MultiTurnActuator":
          value = data.permissible_weight_multi_turn_actuator || null;
          break;
        case "GearboxFactor":
          value = data.gearbox_factor || null;
          break;
        case "GearboxMaxInputNominalTorque_Nm":
          value = data.gearbox_max_input_nominal_torque_nm || null;
          break;
        case "GearboxMaxInputModulatingTorque_Nm":
          value = data.gearbox_max_input_modulating_torque_nm || null;
          break;
        case "GearboxInputShaft_Standard_mm":
          value = data.gearbox_input_shaft_standard_mm || null;
          break;
        case "GearboxInputShaft_Option_mm":
          value = data.gearbox_input_shaft_option_mm || null;
          break;
        case "GearboxWeight_kg":
          value = data.gearbox_weight_kg || null;
          break;
        case "ValveAttachment_Standard_EN_ISO_5210":
          value = data.valve_attachment_standard_en_iso_5210 || null;
          break;
        case "ValveAttachment_Option_DIN_3210":
          value = data.valve_attachment_option_din_3210 || null;
          break;
        case "MaxValveNominalTorque_Nm":
          value = data.max_valve_nominal_torque || null;
          break;
        case "MaxValveModulatingTorque_Nm":
          value = data.max_valve_modulating_torque || null;
          break;
        default:
          value = data[col] || null;
      }

      // Convert to number if numeric
      if (numericFields.includes(col) && value !== null) {
        value = Number(value) || null;
      }

      return value;
    });

    const sql = `INSERT INTO Multiturn_Gearbox (${MULTITURN_DB_COLUMNS.join(", ")}) VALUES (?)`;

    connection.query(sql, [values], (err, result) => {
      if (err) {
        console.error("❌ Database insert failed:", err);
        return res.status(500).json({ message: "Database insert failed", error: err });
      }
      res.json({ message: "✅ Multiturn saved successfully!" });
    });
  } catch (err) {
    console.error("❌ Failed to save Multiturn:", err);
    res.status(500).json({ message: "Failed to save Multiturn", error: err.message });
  }
});


// Save Multiturn Actuator
router.post("/save-multiturn-actuator", (req, res) => {
  try {
    const data = req.body;

    // Numeric fields that must be converted to numbers
    const numericFields = [
      "OutputSpeedRpm_50Hz",
      "OutputSpeedRpm_60Hz",
      "TorqueRangeMin_Nm",
      "TorqueRange_S2_15min_Max_Nm",
      "TorqueRange_S2_30min_Max_Nm",
      "RunTorque_S2_15min_Max_Nm",
      "RunTorque_S2_30min_Max_Nm",
      "NumberOfStartsPerHour",
      "ValveAttachmentMaxDensityRisingStem_mm",
      "HandwheelDensity_mm",
      "Weight_kg"
    ];

    // Map incoming request fields to DB columns
    const values = ACTUATOR_DB_COLUMNS.map((col) => {
      let value = null;

      switch (col) {
        case "ActuatorType":
          value = data.actuator_type || null;
          break;
        case "OutputSpeedRpm_50Hz":
          value = data.output_speed_rpm_50hz || null;
          break;
        case "OutputSpeedRpm_60Hz":
          value = data.output_speed_rpm_60hz || null;
          break;
        case "TorqueRangeMin_Nm":
          value = data.torque_range_min_nm || null;
          break;
        case "TorqueRange_S2_15min_Max_Nm":
          value = data.torque_range_s2_15min_max_nm || null;
          break;
        case "TorqueRange_S2_30min_Max_Nm":
          value = data.torque_range_s2_30min_max_nm || null;
          break;
        case "RunTorque_S2_15min_Max_Nm":
          value = data.run_torque_s2_15min_max_nm || null;
          break;
        case "RunTorque_S2_30min_Max_Nm":
          value = data.run_torque_s2_30min_max_nm || null;
          break;
        case "NumberOfStartsPerHour":
          value = data.number_of_starts_per_hour || null;
          break;
        case "ValveAttachmentStandard_ISO5210":
          value = data.valve_attachment_standard_iso5210 || null;
          break;
        case "ValveAttachmentOption_DIN3210":
          value = data.valve_attachment_option_din3210 || null;
          break;
        case "ValveAttachmentMaxDensityRisingStem_mm":
          value = data.valve_attachment_max_density_rising_stem_mm || null;
          break;
        case "HandwheelDensity_mm":
          value = data.handwheel_density_mm || null;
          break;
        case "HandwheelReductionRatio":
          value = data.handwheel_reduction_ratio || null;
          break;
        case "Weight_kg":
          value = data.weight_kg || null;
          break;
        default:
          value = data[col] || null;
      }

      // Convert to number if numeric
      if (numericFields.includes(col) && value !== null) {
        value = Number(value) || null;
      }

      return value;
    });

    const sql = `INSERT INTO Multiturn_Actuator (${ACTUATOR_DB_COLUMNS.join(", ")}) VALUES (?)`;

    connection.query(sql, [values], (err, result) => {
      if (err) {
        console.error("❌ Database insert failed:", err);
        return res.status(500).json({ message: "Database insert failed", error: err });
      }
      res.json({ message: "✅ Multiturn Actuator saved successfully!" });
    });
  } catch (err) {
    console.error("❌ Failed to save Multiturn Actuator:", err);
    res.status(500).json({ message: "Failed to save Multiturn Actuator", error: err.message });
  }
});



module.exports = router;
