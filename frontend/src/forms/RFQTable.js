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
    <div className="mt-4">
      <div className="p-4 border rounded shadow-sm bg-white">
        <h3 className="mb-4 text-primary fw-bold">RFQ List</h3>

        <Table striped bordered hover responsive className="mb-0">
          <thead className="table-light">
            <tr>
              <th>RFQ Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rfqs.map((rfq, idx) => (
              <tr key={idx}>
                <td className="fw-semibold">{rfq.rfq_no}</td>
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
    </div>

  );
};

export default RFQTable;
