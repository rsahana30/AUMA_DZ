// src/components/RFQTable.js
import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
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

  const handleRFQClick = (rfqNo) => {
    navigate(`/rfq/${rfqNo}`);
  };

  return (
    <div className="container mt-4">
      <h4>All RFQs</h4>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>RFQ Number</th>
            <th>Customer Name</th>
          </tr>
        </thead>
        <tbody>
          {rfqs.map((rfq, idx) => (
            <tr key={idx}>
              <td
                style={{ color: "blue", cursor: "pointer" }}
                onClick={() => handleRFQClick(rfq.rfq_no)}
              >
                {rfq.rfq_no}
              </td>
              <td>{rfq.customer}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default RFQTable;
