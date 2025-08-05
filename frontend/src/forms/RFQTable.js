// src/components/RFQTable.js
import React, { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const RFQTable = () => {
  const [rfqs, setRfqs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/rfqs")
      .then((res) => res.json())
      .then((data) => setRfqs(data))
      .catch((err) => console.error("Error fetching RFQs:", err));
  }, []);

  const handleSelectModel = (rfqNo) => {
    navigate(`/select-model/${rfqNo}`);
  };

  const handleUpdateRFQ = (rfqNo) => {
    navigate(`/update-rfq/${rfqNo}`);
  };

  return (
    <div className="container mt-4">
      <h4>RFQ List</h4>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>RFQ Number</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rfqs.map((rfq, idx) => (
            <tr key={idx}>
              <td style={{ fontWeight: "bold" }}>{rfq.rfq_no}</td>
              <td>
                <Button
                  variant="primary"
                  className="me-2"
                  onClick={() => handleSelectModel(rfq.rfq_no)}
                >
                  Select AUMA Model
                </Button>
                <Button
                  variant="warning"
                  onClick={() => handleUpdateRFQ(rfq.rfq_no)}
                >
                  Update RFQ
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default RFQTable;
