const express = require("express");
const router = express.Router();
const connection = require("../db/connection");

router.post("/upload", async (req, res) => {
  const { manualFields, excelRows } = req.body;

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
router.get("/rfqs", (req, res) => {
  connection.query(
    `SELECT rfq_no, customer FROM rfqs GROUP BY rfq_no, customer ORDER BY MAX(created_at) DESC`,
    (err, results) => {
      if (err) {
        console.error("Error fetching RFQs:", err);
        return res.status(500).json({ error: "Server error" });
      }
      res.json(results);
    }
  );
});

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

// Update single valve row
router.put("/update-valve-row/:id", (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  connection.query(
    "UPDATE rfqs SET ? WHERE id = ?",
    [updateData, id],
    (err, result) => {
      if (err) {
        console.error("Error updating row:", err);
        return res.status(500).json({ error: "Update failed" });
      }
      res.json({ message: "Row updated successfully" });
    }
  );
});

router.post("/get-matching-models", (req, res) => {
  const {
    valveType,
    valveTorque,
    safetyFactor,
    topFlange,
    weatherproofType,
    painting
  } = req.body;

  const torque = parseFloat(valveTorque) || 0;
  const sf = parseFloat(safetyFactor) || 1;
  const requiredTorque = torque * sf;

  const query = `
    SELECT 
      valve_type,
      valve_max_valve_torque,
      valve_flange_iso5211,
      gearbox_input_mounting_flange,
      gearbox_reduction_ratio,
      gearbox_weight
    FROM partturn 
    WHERE LOWER(valve_type) = ?
      AND valve_max_valve_torque >= ?
      AND valve_flange_iso5211 LIKE ?
      AND protection_type = ?
      AND painting = ?;
  `;

  connection.query(
    query,
    [
      valveType.toLowerCase(),
      requiredTorque,
      `%${topFlange}%`,
      weatherproofType,
      painting
    ],
    (err, results) => {
      if (err) {
        console.error("🔥 Error fetching matching models:", err);
        return res.status(500).json({ error: "Failed to fetch matching models" });
      }

      const models = results.map((r) => ({
        auma_model: `${r.valve_type.toUpperCase()}-${r.valve_max_valve_torque}Nm [${r.gearbox_input_mounting_flange}, Ratio: ${r.gearbox_reduction_ratio}]`
      }));

      res.json(models);
    }
  );
});





module.exports = router;
