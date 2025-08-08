import React, { useEffect, useState } from "react";
import { Table, Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import SelectModel from "./SelectModel";  // import SelectModel


const RFQTable = () => {
  const [rfqs, setRfqs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/rfqs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRfqs(data);
        } else if (data?.rfqs) {
          setRfqs(data.rfqs);
        } else {
          setRfqs([]);
          console.error("Unexpected API response format:", data);
        }
      })
      .catch((err) => console.error("Error fetching RFQs:", err));
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    return d.toLocaleString();
  };

  const handleCreateNewRFQ = () => {
    navigate("/");
  };

  const handleRFQClick = (rfq) => {
    setSelectedRFQ(rfq);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRFQ(null);
  };

  return (
    <div className="mt-4">
      <div className="p-4 border rounded shadow-sm bg-white">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="text-primary fw-bold mb-0">Quotation Management </h3>
          <Button variant="success" onClick={handleCreateNewRFQ}>
            Create New RFQ
          </Button>
        </div>
        <Table striped bordered hover responsive className="mb-0">
          <thead className="table-light">
            <tr>
              <th>RFQ Number</th>
              <th>Customer Name</th>
              <th>Created At</th>
              <th>Submitted By</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(rfqs) && rfqs.length > 0 ? (
              rfqs.map((rfq, idx) => (
                <tr key={idx}>
                  <td className="fw-semibold">
                    <Button variant="link" onClick={() => handleRFQClick(rfq)} style={{ padding: 0 }}>
                      {rfq.rfq_no}
                    </Button>
                  </td>
                  <td>{rfq.customer}</td>
                  <td>{formatDate(rfq.created_at)}</td>
                  <td>{rfq.submitted_by ? "Submitted by " + rfq.submitted_by : "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center">No RFQ data available.</td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* Show SelectModel component in modal when an RFQ is selected */}
        <Modal size="lg" show={showModal} onHide={handleCloseModal} dialogClassName="modal-90w" aria-labelledby="select-model-modal">
          <Modal.Header closeButton>
            <Modal.Title id="select-model-modal">
              {selectedRFQ ? `Select Model for RFQ: ${selectedRFQ.rfq_no}` : "Select Model"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {selectedRFQ && <SelectModel rfqNo={selectedRFQ.rfq_no} />}
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default RFQTable;
