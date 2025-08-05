import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Table, Button, Form } from "react-bootstrap";

const UpdateRFQ = () => {
  const { rfqNo } = useParams();
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/rfq-details/${rfqNo}`)
      .then(res => setRows(res.data))
      .catch(err => console.error("Failed to load RFQ details", err));
  }, [rfqNo]);

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const handleSave = (id, rowData) => {
    setSaving(true);
    axios.put(`http://localhost:5000/api/update-valve-row/${id}`, rowData)
      .then(() => alert("Row updated"))
      .catch(err => {
        console.error("Save failed:", err);
        alert("Error saving row");
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="container mt-4">
      <h4>Edit RFQ: <strong>{rfqNo}</strong></h4>
      <Table bordered responsive>
        <thead>
          <tr>
            <th>Item</th>
            <th>Valve Type</th>
            <th>Valve Size</th>
            <th>Valve Torque</th>
            <th>Voltage</th>
            <th>Weatherproof</th>
            <th>Certification</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id}>
              <td>{row.item}</td>
              <td>
                <Form.Control
                  value={row.valveType}
                  onChange={(e) => handleChange(idx, "valveType", e.target.value)}
                />
              </td>
              <td>
                <Form.Control
                  value={row.valveSize}
                  onChange={(e) => handleChange(idx, "valveSize", e.target.value)}
                />
              </td>
              <td>
                <Form.Control
                  value={row.valveTorque}
                  onChange={(e) => handleChange(idx, "valveTorque", e.target.value)}
                />
              </td>
              <td>
                <Form.Control
                  value={row.actuatorVoltage}
                  onChange={(e) => handleChange(idx, "actuatorVoltage", e.target.value)}
                />
              </td>
              <td>
                <Form.Control
                  value={row.weatherproofType}
                  onChange={(e) => handleChange(idx, "weatherproofType", e.target.value)}
                />
              </td>
              <td>
                <Form.Control
                  value={row.certification}
                  onChange={(e) => handleChange(idx, "certification", e.target.value)}
                />
              </td>
              <td>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleSave(row.id, row)}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default UpdateRFQ;
