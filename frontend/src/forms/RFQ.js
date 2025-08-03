import React, { useState } from "react";
import { Form, Button, Row, Col, Container } from "react-bootstrap";

const RFQ= () => {
  const [formData, setFormData] = useState({
    customerName: "",
    safetyFactor: "",
    actuatorVoltage: "",
    communication: "",
    motorDuty: "",
    actuatorSeries: "",
    controllerType: "",
    gearBoxLocation: "",
    protectionType: "",
    certification: "",
    painting: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    // TODO: Send to backend API
  };

  return (
    <Container className="mt-4">
      <h3>RFQ Form</h3>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group controlId="customerName" className="mb-3">
              <Form.Label>Customer Name and Detail</Form.Label>
              <Form.Control
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="safetyFactor" className="mb-3">
              <Form.Label>Safety Factor</Form.Label>
              <Form.Select name="safetyFactor" onChange={handleChange}>
                <option>Select</option>
                <option>1.5</option>
                <option>2.0</option>
                <option>2.5</option>
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="actuatorVoltage" className="mb-3">
              <Form.Label>Actuator Voltage</Form.Label>
              <Form.Select name="actuatorVoltage" onChange={handleChange}>
                <option>Select</option>
                <option>24V DC</option>
                <option>110V AC</option>
                <option>230V AC</option>
                <option>415V AC</option>
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="communication" className="mb-3">
              <Form.Label>Communication</Form.Label>
              <Form.Select name="communication" onChange={handleChange}>
                <option>Select</option>
                <option>Modbus</option>
                <option>Profibus</option>
                <option>HART</option>
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="motorDuty" className="mb-3">
              <Form.Label>Motor Duty</Form.Label>
              <Form.Select name="motorDuty" onChange={handleChange}>
                <option>Select</option>
                <option>S2</option>
                <option>S4</option>
                <option>S5</option>
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="actuatorSeries" className="mb-3">
              <Form.Label>Actuator Series</Form.Label>
              <Form.Select name="actuatorSeries" onChange={handleChange}>
                <option>Select</option>
                <option>SA</option>
                <option>SAR</option>
                <option>Q</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group controlId="controllerType" className="mb-3">
              <Form.Label>Controller Type</Form.Label>
              <Form.Select name="controllerType" onChange={handleChange}>
                <option>Select</option>
                <option>AM</option>
                <option>AC</option>
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="gearBoxLocation" className="mb-3">
              <Form.Label>Gear Box Location</Form.Label>
              <Form.Select name="gearBoxLocation" onChange={handleChange}>
                <option>Select</option>
                <option>Germany</option>
                <option>India</option>
                <option>Korea</option>
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="protectionType" className="mb-3">
              <Form.Label>Weatherproof / Explosion proof</Form.Label>
              <Form.Select name="protectionType" onChange={handleChange}>
                <option>Select</option>
                <option>Weatherproof</option>
                <option>Explosion proof</option>
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="certification" className="mb-3">
              <Form.Label>Certification Requirement</Form.Label>
              <Form.Select name="certification" onChange={handleChange}>
                <option>Select</option>
                <option>IP</option>
                <option>ATEX</option>
                <option>IECEX</option>
                <option>UL</option>
                <option>FM</option>
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="painting" className="mb-3">
              <Form.Label>Painting</Form.Label>
              <Form.Select name="painting" onChange={handleChange}>
                <option>Select</option>
                <option>Standard</option>
                <option>Special</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" type="submit">
          Save RFQ
        </Button>
      </Form>
    </Container>
  );
};

export default RFQ;
