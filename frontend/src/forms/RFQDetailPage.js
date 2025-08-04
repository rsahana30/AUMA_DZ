// src/components/RFQDetailPage.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";

const RFQDetailPage = () => {
  const { rfqNo } = useParams();
  const [valveRows, setValveRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editData, setEditData] = useState({});
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/rfq-details/${rfqNo}`)
      .then((res) => res.json())
      .then((data) => setValveRows(data))
      .catch(() => toast.error("Failed to load RFQ details"));
  }, [rfqNo]);

  const handleEditClick = (row) => {
    setSelectedRow(row);
    setEditData({ ...row });
    setModalOpen(true);
  };

  const handleChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    fetch(`http://localhost:5000/api/update-valve-row/${editData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    })
      .then((res) => res.json())
      .then(() => {
        toast.success("Row updated");
        setValveRows((prev) =>
          prev.map((row) => (row.id === editData.id ? editData : row))
        );
        setModalOpen(false);
      })
      .catch(() => toast.error("Failed to update"));
  };

  return (
    <div className="container mt-4">
      <h4>RFQ Detail: {rfqNo}</h4>
      <Table striped bordered hover responsive>
  <thead>
    <tr>
      <th>Item</th>
      <th>Valve Type</th>
      <th>Valve Tag No.</th>
      <th>Valve Size</th>
      <th>Valve Rating</th>
      <th>Type of Duty</th>
      <th>Torque</th>
      <th>Raising Stem</th>
      <th>Valve Flange</th>
      <th>Valve Stem</th>
      <th>Valve Mast</th>
      <th>No of Turns</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {valveRows.map((row) => (
      <tr key={row.id}>
        <td>{row.item}</td>
        <td>{row.valveType}</td>
        <td>{row.valveTagNo}</td>
        <td>{row.valveSize}</td>
        <td>{row.valveRating}</td>
        <td>{row.dutyType}</td>
        <td>{row.valveTorque}</td>
        <td>{row.raisingStem}</td>
        <td>{row.topFlange}</td>
        <td>{row.stemDia}</td>
        <td>{row.mast}</td>
        <td>{row.numberOfTurns}</td>
        <td>
          <Button size="sm" onClick={() => handleEditClick(row)}>
            Edit
          </Button>
        </td>
      </tr>
    ))}
  </tbody>
</Table>


      {/* Modal for editing */}
       <Modal show={modalOpen} onHide={() => setModalOpen(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Item #{selectedRow?.item}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {[
              "item",
              "valveType",
              "valveTagNo",
              "valveSize",
              "valveRating",
              "dutyType",
              "valveTorque",
              "raisingStem",
              "topFlange",
              "stemDia",
              "mast",
              "numberOfTurns",
              "safetyFactor",
              "actuatorVoltage",
              "communication",
              "motorDuty",
              "actuatorSeries",
              "controllerType",
              "gearBoxLocation",
              "weatherproofType",
              "certification",
              "painting",
            ].map((field) => (
              <Form.Group className="mb-2" key={field}>
                <Form.Label>{field}</Form.Label>
                <Form.Control
                  value={editData[field] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                />
              </Form.Group>
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSave}>Save</Button>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RFQDetailPage;
