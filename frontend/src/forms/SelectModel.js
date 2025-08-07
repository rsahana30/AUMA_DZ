import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Table, Button, Modal, Spinner, Alert } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SelectModel = ({ rfqNo }) => {
  const [lineItems, setLineItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [matchingModels, setMatchingModels] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rfqNo) return;
    axios
      .get(`http://localhost:5000/api/rfq-details/${rfqNo}`)
      .then((res) => setLineItems(res.data))
      .catch((err) => console.error("Error loading RFQ details", err))
      .finally(() => setLoading(false));
  }, [rfqNo]);

  const fetchMatchingModels = async (item) => {
    setSelectedItem(item);
    try {
      const res = await axios.post("http://localhost:5000/api/get-matching-models", {
        valveType: item.valveType,
        valveTorque: item.valveTorque,
        safetyFactor: item.safetyFactor,
        topFlange: item.topFlange,
        weatherproofType: item.weatherproofType,
        painting: item.painting,
      });

      setMatchingModels(res.data);
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching matching models:", err);
    }
  };

  const handleSelectModel = async (model) => {
    try {
      await axios.put(`http://localhost:5000/api/update-valve-row/${selectedItem.id}`, {
        auma_model: model,
      });
      alert(`AUMA Model "${model}" assigned to item ${selectedItem.item}`);
      setShowModal(false);

      const res = await axios.get(`http://localhost:5000/api/rfq-details/${rfqNo}`);
      setLineItems(res.data);
    } catch (err) {
      console.error("Failed to update model:", err);
      alert("Update failed.");
    }
  };

  const handleConvertToQuotation = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Quotation for RFQ: ${rfqNo}`, 14, 20);

    const tableData = lineItems.map(item => [
      item.item,
      item.valveType,
      item.valveTorque,
      item.actuatorVoltage,
      item.weatherproofType,
      item.certification,
      item.painting,
      item.auma_model || "Not selected",
    ]);

    autoTable(doc, {
      head: [["Item", "Valve Type", "Torque", "Voltage", "Weatherproof", "Certification", "Painting", "AUMA Model"]],
      body: tableData,
      startY: 30,
    });

    doc.save(`Quotation_${rfqNo}.pdf`);
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status" />
        <div className="mt-2">Loading RFQ Details...</div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-body">
        <h4 className="fw-bold text-primary mb-4">
          Select AUMA Models for RFQ: <span className="text-dark">{rfqNo}</span>
        </h4>

        {lineItems.length === 0 ? (
          <Alert variant="warning">No valve items found for this RFQ.</Alert>
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="table-light">
                <tr>
                  <th>Item</th>
                  <th>Valve Type</th>
                  <th>Torque</th>
                  <th>Voltage</th>
                  <th>Weatherproof</th>
                  <th>Certification</th>
                  <th>Painting</th>
                  <th>AUMA Model</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.item}</td>
                    <td>{item.valveType}</td>
                    <td>{item.valveTorque}</td>
                    <td>{item.actuatorVoltage}</td>
                    <td>{item.weatherproofType}</td>
                    <td>{item.certification}</td>
                    <td>{item.painting}</td>
                    <td className="fw-semibold">
                      {item.auma_model || <span className="text-muted fst-italic">Not selected</span>}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => fetchMatchingModels(item)}
                      >
                        Select Model
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        <div className="text-end mt-4">
          <Button
            variant="success"
            onClick={handleConvertToQuotation}
            disabled={lineItems.some(item => !item.auma_model)}
          >
            <i className="bi bi-file-earmark-pdf me-2" />
            Convert to Quotation (PDF)
          </Button>

          <Link to={`/quotation/${rfqNo}`}>
            <Button variant="primary" className="ms-2">
              <i className="bi bi-eye me-2" />
              View Full Quotation
            </Button>
          </Link>
        </div>
      </div>

      {/* Modal for Selecting AUMA Model */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Select Matching AUMA Model</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {matchingModels.length > 0 ? (
            <div className="list-group">
              {matchingModels.map((m, i) => (
                <div
                  key={i}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div className="fw-bold">{m.auma_model}</div>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleSelectModel(m.auma_model)}
                  >
                    Select
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Alert variant="info">No matching models found for this item.</Alert>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SelectModel;
