const express = require("express");
const router = express.Router();
const fs = require("fs");           // <-- Add missing modules
const path = require("path");
const connection = require("../db/connection");

// In-memory stores for quotation numbers; replace with DB storage in production
const quotationCountersByDate = {}; // { 'YYYYMMDD': counter }
const rfqQuotationMap = {};         // { rfqNo: quotationNumber }

// Helper to generate unique quotation number
function generateQuotationNumber() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const datePrefix = `${yyyy}${mm}${dd}`;

  if (!quotationCountersByDate[datePrefix]) {
    quotationCountersByDate[datePrefix] = 0;
  }
  quotationCountersByDate[datePrefix]++;
  const counterString = String(quotationCountersByDate[datePrefix]).padStart(4, "0");
  return `Q${datePrefix}${counterString}`;
}

// Ensure quotations directory exists
const quotationsDir = path.join(__dirname, "quotations");
if (!fs.existsSync(quotationsDir)) {
  fs.mkdirSync(quotationsDir, { recursive: true });
}

// Dummy PDF generation - replace with actual PDF generation in production
function generatePDF(quotationNumber, rfqNo) {
  const pdfPath = path.join(quotationsDir, `${quotationNumber}.pdf`);
  const content = `Quotation Number: ${quotationNumber}\nRFQ No: ${rfqNo}\nGenerated on: ${new Date().toISOString()}`;
  try {
    fs.writeFileSync(pdfPath, content, "utf8");
  } catch (err) {
    console.error("Error writing PDF file:", err);
    throw err;
  }
  return pdfPath;
}

// POST /api/generate-quotation/:rfqNo
router.post("/generate-quotation/:rfqNo", (req, res) => {
  const rfqNo = req.params.rfqNo;

  if (rfqQuotationMap[rfqNo]) {
    return res.json({ quotationNumber: rfqQuotationMap[rfqNo] });
  }

  const quotationNumber = generateQuotationNumber();

  try {
    generatePDF(quotationNumber, rfqNo);
  } catch (err) {
    console.error("Failed to generate PDF:", err);
    return res.status(500).json({ error: "Failed to generate quotation PDF" });
  }

  rfqQuotationMap[rfqNo] = quotationNumber;

  res.json({ quotationNumber });
});

// GET /api/view-quotation/:quotationNumber
router.get("/view-quotation/:quotationNumber", (req, res) => {
  const qno = req.params.quotationNumber;
  const pdfPath = path.join(quotationsDir, `${qno}.pdf`);

  if (!fs.existsSync(pdfPath)) {
    return res.status(404).send("Quotation PDF not found");
  }

  res.sendFile(pdfPath);
});
//display of rfqs, customer name, created at and submitted by
router.get('/rfqs', (req, res) => {
  const sql = 'SELECT DISTINCT rfqs.rfq_no,  rfqs.customer,rfqs.created_at,users.name AS submitted_by FROM rfqs LEFT JOIN users ON rfqs.user_id = users.id ORDER BY rfqs.created_at DESC;';

  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error('Error fetching RFQs:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // results is an array of rows
    res.json(results);
  });
});
router.post("/upload", async (req, res) => {
  const { user_id, submitted_by, manualFields, excelRows } = req.body;

  if (!manualFields || !excelRows || excelRows.length === 0) {
    return res.status(400).json({ error: "Missing data" });
  }

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

  // Fetch last rfq_no manually
  const prefix = `RFQ${today}`;
  const query = `SELECT rfq_no FROM rfqs WHERE rfq_no LIKE '${prefix}%' ORDER BY rfq_no DESC LIMIT 1`;

  connection.query(query, (err, result) => {
    if (err) {
      console.error("🔥 Error fetching latest RFQ number:", err);
      return res.status(500).json({ error: "Server error" });
    }

    let newNumber = "0001";
    if (result.length > 0) {
      const lastNumber = result[0].rfq_no.slice(-4);
      newNumber = String(Number(lastNumber) + 1).padStart(4, "0");
    }

    const rfqNo = `${prefix}${newNumber}`;

    // Now insert all rows with this rfqNo
    let insertCount = 0;
    let hasError = false;

    excelRows.forEach((row, index) => {
      const insertData = {
        rfq_no: rfqNo,
        customer: manualFields.customer,
        safetyFactor: manualFields.safetyFactor,
        actuatorVoltage: manualFields.actuatorVoltage,
        communication: manualFields.communication,
        motorDuty: manualFields.motorDuty,
        actuatorSeries: manualFields.actuatorSeries,
        controllerType: manualFields.controllerType,
        gearBoxLocation: manualFields.gearBoxLocation,
        weatherproofType: manualFields.weatherproofType,
        certification: manualFields.certification,
        painting: manualFields.painting,

        item: row["Item"],
        valveType: row["Valve Type"],
        valveTagNo: row["Valve Tag No"],
        valveSize: row["Valve Size (Inch)"],
        valveRating: row["Valve Rating"],
        dutyType: row["Type of Duty (On-off / Modulating)"],
        raisingStem: row["Raising Stem or Not"],
        valveTorque: row["Valve Torque (Nm)"],
        topFlange: row["Valve Top Flange PCD (ISO)"],
        stemDia: row["Valve stem Dia (mm)"],
        mast: row["Valve MAST (Nm)"],
        numberOfTurns: row["Number of Turns (for Gate and Globe valves)"],
        quantity: row["quantity"],

        user_id: user_id,
        submitted_by: submitted_by,
      };

      connection.query("INSERT INTO rfqs SET ?", insertData, (insertErr, result) => {
        if (insertErr) {
          console.error("🔥 Error inserting row:", insertErr);
          if (!hasError) {
            hasError = true;
            return res.status(500).json({ error: "Insertion failed", detail: insertErr.message });
          }
        }

        insertCount++;
        if (insertCount === excelRows.length && !hasError) {
          return res.json({ message: "RFQ uploaded successfully", rfq_no: rfqNo });
        }
      });
    });
  });
});

router.get("/customers", (req, res) => {
  connection.query("SELECT name FROM customers", (err, results) => {
    if (err) {
      console.error("Error fetching customers:", err);
      return res.status(500).json({ error: "Failed to load customers" });
    }
    res.json({ customers: results.map((r) => r.name) });
  });
});

// routes/rfq.js


// Get valve rows by RFQ
router.get("/rfq-details/:rfqNo", (req, res) => {
  const { rfqNo } = req.params;
  connection.query(
    "SELECT * FROM rfqs WHERE rfq_no = ?",
    [rfqNo],
    (err, rows) => {
      if (err) {
        console.error("Error fetching valve rows:", err);
        return res.status(500).json({ error: "Failed to load data" });
      }
      res.json(rows);
    }
  );
});

// 2. Get matching models for given valve row details (callback style)
router.post("/get-matching-models", (req, res) => {
  const {
    valveType,
    valveTorque,
    safetyFactor,
    protection_type,
    painting,
  } = req.body;

  const torqueVal = parseFloat(valveTorque) || 0;
  const sfVal = parseFloat(safetyFactor) || 1;
  const requiredTorque = torqueVal * sfVal;

  const sql = `
    SELECT 
      type, 
      valve_type, 
      protection_type, 
      painting, 
      price, 
      child_id, 
      valve_max_valve_torque
    FROM partturn
    WHERE valve_type = ?
      AND protection_type = ?
      AND painting = ?
      AND valve_max_valve_torque >= ?
  `;

  connection.query(
    sql,
    [valveType, protection_type, painting, requiredTorque],
    (err, results) => {
      if (err) {
        console.error("Error fetching matching models:", err);
        return res.status(500).json({ error: "Failed to fetch matching models" });
      }

      res.json(results);
    }
  );
});

// 3. Update selected model for a valve row (callback style)
router.put("/update-valve-row/:id", (req, res) => {
  const { id } = req.params;
  const { selectedModel } = req.body;

  if (!selectedModel) {
    return res.status(400).json({ error: "No selected model provided" });
  }

  const updateData = {
    auma_model: selectedModel.child_id,
    // You may update other fields here if needed (e.g. price)
  };

  connection.query(
    "UPDATE rfqs SET ? WHERE id = ?",
    [updateData, id],
    (err, result) => {
      if (err) {
        console.error("Error updating valve row:", err);
        return res.status(500).json({ error: "Update failed" });
      }
      res.json({ message: "Valve row updated successfully" });
    }
  );
});

// POST /api/get-models-by-ids

router.get("/se-details/:rfqNo", async (req, res) => {
  const { rfqNo } = req.params;
  try {
    const [partturn] = await query("SELECT *, 'partturn' AS type FROM partturn WHERE rfq_no = ?", [rfqNo]);
    const [multiturn] = await query("SELECT *, 'multiturn' AS type FROM multiturn WHERE rfq_no = ?", [rfqNo]);
    const [linear] = await query("SELECT *, 'linear' AS type FROM linear_valve WHERE rfq_no = ?", [rfqNo]);
    const [lever] = await query("SELECT *, 'lever' AS type FROM lever WHERE rfq_no = ?", [rfqNo]);

    res.json([...partturn, ...multiturn, ...linear, ...lever]);
  } catch (err) {
    console.error("Error fetching SE details:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/auma-models", async (req, res) => {
  const { valveType, valveTorque, safetyFactor, valve_flange_iso5211 } = req.body;
  const requiredTorque = valveTorque * safetyFactor;

  try {
    const [models] = await query(
      "SELECT * FROM auma_model WHERE type = ? AND torque >= ? AND topFlange = ?",
      [valveType, requiredTorque, valve_flange_iso5211]
    );
    res.json(models);
  } catch (err) {
    console.error("Error fetching AUMA models:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/submit-se-mapping", async (req, res) => {
  const { rfqNumber, valveType, valveId, selectedModel, quantity } = req.body;

  try {
    await query(
      "INSERT INTO se_mapping (rfq_no, valve_type, valve_row_id, auma_model, quantity, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [rfqNumber, valveType, valveId, selectedModel, quantity]
    );
    res.json({ message: "SE mapping submitted successfully" });
  } catch (err) {
    console.error("Error submitting SE mapping:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



module.exports = router;
