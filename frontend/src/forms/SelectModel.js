import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Table, Button, Modal } from "react-bootstrap";

const SelectModel = ({ rfqNo, inline }) => {
  const [modelData, setModelData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModels, setSelectedModels] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ rfqItemId: null, items: [] });

  useEffect(() => {
    if (!rfqNo) return;
    setLoading(true);

    axios
      .get(`http://localhost:5000/api/select-model/${rfqNo}`)
      .then((res) => {
        setModelData(res.data);
      })
      .catch((err) => {
        console.error("Error fetching model data", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [rfqNo]);

  const groupedData = useMemo(() => {
    return modelData.reduce((acc, item) => {
      const key = item.id;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  }, [modelData]);

  useEffect(() => {
    const initialSelection = {};
    Object.entries(groupedData).forEach(([rfqItemId, items]) => {
      if (items.length > 0) {
        initialSelection[rfqItemId] = items[0];
      }
    });
    setSelectedModels(initialSelection);
  }, [groupedData]);

  const handleShowModal = (rfqItemId, items) => {
    setModalData({ rfqItemId, items });
    setShowModal(true);
  };

  const handleSelectModel = (rfqItemId, model) => {
    setSelectedModels((prev) => ({
      ...prev,
      [rfqItemId]: model,
    }));
    setShowModal(false);
  };

  if (loading) return <p>Loading...</p>;

  if (!modelData.length) {
    return <p>No matching gearbox found.</p>;
  }

  return (
    <div className={inline ? "flex flex-col gap-2" : "p-4 border rounded-lg"}>
      <h3 className="text-lg font-bold mb-2">Selected Gearbox Model</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Valve Type</th>
            <th>Calculated Torque (Nm)</th>
            <th>Gearbox Type</th>
            <th>Input Torque (Nm)</th>
            <th>Reduction Ratio</th>
            <th>Factor</th>
            <th>Max Stem Dia (mm)</th>
            <th>AUMA Electric Actuator</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(selectedModels).map(([rfqItemId, selected]) => (
            <tr key={rfqItemId}>
              <td>{selected.valveType}</td>
              <td>{selected.calculatedTorque}</td>
              <td>{selected.GearboxType}</td>
              <td>{(selected.calculatedTorque / selected.GearboxFactor).toFixed(2)}</td>
              <td>{selected.GearboxReductionRatio}</td>
              <td>{selected.GearboxFactor}</td>
              <td>{selected.maximum_allowable_stem_dia}</td>
              <td>{selected.actuatorSeries + " + AC + " + selected.GearboxType}</td>
              <td>
                <Button onClick={() => handleShowModal(rfqItemId, groupedData[rfqItemId])} size="sm">
                  Change
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Select a Gearbox for RFQ Item {modalData.rfqItemId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Valve Type</th>
                <th>Calculated Torque (Nm)</th>
                <th>Gearbox Type</th>
                <th>Input Torque (Nm)</th>
                <th>Reduction Ratio</th>
                <th>Factor</th>
                <th>Max Stem Dia (mm)</th>
                <th>AUMA Electric Actuator</th>
                <th>Select</th>
              </tr>
            </thead>
            <tbody>
              {modalData.items.map((item) => (
                <tr key={item.GearboxType}>
                  <td>{item.valveType}</td>
                  <td>{item.calculatedTorque}</td>
                  <td>{item.GearboxType}</td>
                  <td>{(item.calculatedTorque / item.GearboxFactor).toFixed(2)}</td>
                  <td>{item.GearboxReductionRatio}</td>
                  <td>{item.GearboxFactor}</td>
                  <td>{item.maximum_allowable_stem_dia}</td>
                  <td>{item.actuatorSeries + " + AC + " + item.GearboxType}</td>
                  <td>
                    <Button onClick={() => handleSelectModel(modalData.rfqItemId, item)} size="sm">
                      Select
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SelectModel;