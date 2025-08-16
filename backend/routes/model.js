// routes/selectModel.js
const express = require("express");
const router = express.Router();
const db = require("../db/connection");// your MySQL connection


router.get("/select-model/:rfqNo", (req, res) => {
    const { rfqNo } = req.params;

    const query = `
       SELECT 
    r.id,
    r.rfq_no,
    r.valveType,
    r.quantity,
    r.calculatedTorque,
    mg.maximum_allowable_stem_dia,  -- added missing comma

    -- Unified fields using CASE to avoid duplicates
    CASE 
        WHEN r.valveType IN ('Ball', 'butterfly') THEN g.MaxValveTorque_Nm
        WHEN r.valveType IN ('Gate', 'penstock') THEN mg.MaxValveNominalTorque_Nm
    END AS MaxValveTorque_Nm,
    
    CASE 
        WHEN r.valveType IN ('Ball', 'butterfly') THEN g.GearboxReductionRatio
        WHEN r.valveType IN ('Gate', 'penstock') THEN mg.GearboxReductionRatio
    END AS GearboxReductionRatio,
    
    CASE 
        WHEN r.valveType IN ('Ball', 'butterfly') THEN g.GearboxFactor
        WHEN r.valveType IN ('Gate', 'penstock') THEN mg.GearboxFactor
    END AS GearboxFactor,
    
    CASE 
        WHEN r.valveType IN ('Ball', 'butterfly') THEN g.GearboxType
        WHEN r.valveType IN ('Gate', 'penstock') THEN mg.GearboxType
    END AS GearboxType
    
FROM rfqs r
LEFT JOIN partturn_gearbox g 
    ON r.valveType IN ('Ball', 'butterfly')
    AND g.DutyClass = 'Duty Class 1'
    AND r.calculatedTorque <= g.MaxValveTorque_Nm
LEFT JOIN multiturn_gearbox mg 
    ON r.valveType IN ('Gate', 'penstock')
    AND r.calculatedTorque <= mg.MaxValveNominalTorque_Nm
WHERE r.rfq_no = ?;

    `;

    db.query(query, [rfqNo], (err, rows) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Server error" });
        }
        res.json(rows);
    });
});

module.exports = router;

