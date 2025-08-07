import React, { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const RFQTable = () => {
  const [rfqs, setRfqs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/rfqs")
      .then(res => res.json())
      .then(data => {
        // Debug: ensure response is an array
        if (Array.isArray(data)) {
          setRfqs(data);
        } else if (data?.rfqs) {
          setRfqs(data.rfqs);
        } else {
          setRfqs([]);
          console.error("Unexpected API response format:", data);
        }
      })
      .catch(err => console.error("Error fetching RFQs:", err));
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    return d.toLocaleString();
  };

  const handleCreateNewRFQ = () => {
    navigate("/"); // Adjust this path if your RFQ creation component uses a different route
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
                  <td className="fw-semibold">{rfq.rfq_no}</td>
                  <td>{rfq.customer}</td>
                  <td>{formatDate(rfq.created_at)}</td>
                  <td>{rfq.submitted_by || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center">
                  No RFQ data available.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default RFQTable;
