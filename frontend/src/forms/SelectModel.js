// src/components/SelectModel.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Table, Button, Modal, Spinner } from "react-bootstrap";
import jsPDF from "jspdf";
import "jspdf-autotable";

const SelectModel = () => {
  const { rfqNo } = useParams();
  const [lineItems, setLineItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [matchingModels, setMatchingModels] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        actuatorVoltage: item.actuatorVoltage,
        gearBoxLocation: item.gearBoxLocation,
        motorDuty: item.motorDuty,
        controllerType: item.controllerType,
        weatherproofType: item.weatherproofType,
        certification: item.certification,
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

      // Refresh lineItems
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
      item.auma_model || "Not selected",
    ]);

    doc.autoTable({
      head: [["Item", "Valve Type", "Torque", "Voltage", "Weatherproof", "Certification", "AUMA Model"]],
      body: tableData,
      startY: 30,
    });

    doc.save(`Quotation_${rfqNo}.pdf`);
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <div className="container mt-4">
      <h4>Select AUMA Model for RFQ: <strong>{rfqNo}</strong></h4>

      <Table striped bordered responsive>
        <thead>
          <tr>
            <th>Item</th>
            <th>Valve Type</th>
            <th>Torque</th>
            <th>Voltage</th>
            <th>Weatherproof</th>
            <th>Certification</th>
            <th>Selected AUMA Model</th>
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
              <td>{item.auma_model || <i>Not selected</i>}</td>
              <td>
                <Button
                  variant="info"
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

      {/* Matching Model Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Select AUMA Model</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {matchingModels.length > 0 ? (
            <ul className="list-group">
              {matchingModels.map((m, i) => (
                <li
                  key={i}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  {m.auma_model}
                  <Button variant="success" size="sm" onClick={() => handleSelectModel(m.auma_model)}>
                    Select
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No matching models found for this line item.</p>
          )}
        </Modal.Body>
      </Modal>

      {/* Convert to Quotation Button */}
      <div className="text-end mt-3">
        <Button
          variant="success"
          onClick={handleConvertToQuotation}
          disabled={lineItems.some(item => !item.auma_model)}
        >
          Convert to Quotation
        </Button>
      </div>
    </div>
  );
};

export default SelectModel;
