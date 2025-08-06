import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Table, Spinner } from "react-bootstrap";

const Quotation = () => {
  const { rfqNo } = useParams();
  const [lineItems, setLineItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/rfq-details/${rfqNo}`)
      .then((res) => setLineItems(res.data))
      .catch((err) => console.error("Error fetching quotation data", err))
      .finally(() => setLoading(false));
  }, [rfqNo]);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <div className="container mt-4">
      <h4>Full Quotation View for RFQ: <strong>{rfqNo}</strong></h4>
      <Table striped bordered responsive>
        <thead>
          <tr>
            <th>Item</th>
            <th>Valve Type</th>
            <th>Torque</th>
            <th>Top Flange</th>
            <th>Voltage</th>
            <th>Safety Factor</th>
            <th>Weatherproof</th>
            <th>Certification</th>
            <th>Painting</th>
            <th>AUMA Model</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item, idx) => (
            <tr key={idx}>
              <td>{item.item}</td>
              <td>{item.valveType}</td>
              <td>{item.valveTorque}</td>
              <td>{item.topFlange}</td>
              <td>{item.actuatorVoltage}</td>
              <td>{item.safetyFactor}</td>
              <td>{item.weatherproofType}</td>
              <td>{item.certification}</td>
              <td>{item.painting}</td>
              <td>{item.auma_model || <i>Not selected</i>}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Quotation;
