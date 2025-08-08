import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Spinner } from "react-bootstrap";

const SelectModel = ({ rfqNo }) => {
  const [lineItems, setLineItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [matchingModels, setMatchingModels] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedModelsMap, setSelectedModelsMap] = useState({});
  const [quotationNumber, setQuotationNumber] = useState(null);
  const [loadingQuotation, setLoadingQuotation] = useState(false);

  // Load RFQ items on mount or when rfqNo changes
  useEffect(() => {
    if (!rfqNo) return;
    setLoading(true);
    axios
      .get(`http://localhost:5000/api/rfq-details/${rfqNo}`)
      .then((res) => {
        setLineItems(res.data);
        setLoading(false);
        // After loading line items, set default models for those without a selected model
        autoSelectDefaultModels(res.data);
      })
      .catch((err) => {
        alert("Failed to load RFQ rows");
        setLoading(false);
      });
  }, [rfqNo]);

  // Auto-select first matching model for line items missing selectedModel
  const autoSelectDefaultModels = async (items) => {
    // Filter items needing default selection: no selectedModel in map AND no auma_model assigned
    const itemsNeedingSelection = items.filter(
      (item) => !selectedModelsMap[item.id] && (!item.auma_model || item.auma_model === "")
    );

    if (itemsNeedingSelection.length === 0) return;

    for (const item of itemsNeedingSelection) {
      try {
        const res = await axios.post("http://localhost:5000/api/get-matching-models", {
          valveType: item.valveType,
          valveTorque: item.valveTorque,
          safetyFactor: item.safetyFactor,
          protection_type: item.protection_type || item.weatherproofType,
          painting: item.painting,
        });

        const firstModel = res.data?.[0];
        if (firstModel) {
          // Update backend with default selected model
          await axios.put(`http://localhost:5000/api/update-valve-row/${item.id}`, {
            selectedModel: firstModel,
          });

          // Update local UI state immediately
          setSelectedModelsMap((prev) => ({
            ...prev,
            [item.id]: firstModel,
          }));
        }
      } catch (error) {
        console.error("Error auto-selecting default model for item:", item.id, error);
      }
    }
  };

  // Fetch models when opening modal for changing/selecting model on a row
  const fetchMatchingModels = async (item) => {
    setSelectedItem(item);
    try {
      const res = await axios.post("http://localhost:5000/api/get-matching-models", {
        valveType: item.valveType,
        valveTorque: item.valveTorque,
        safetyFactor: item.safetyFactor,
        protection_type: item.protection_type || item.weatherproofType,
        painting: item.painting,
      });
      setMatchingModels(res.data || []);
      setShowModal(true);
    } catch (err) {
      alert("Error fetching matching models");
    }
  };

  // On selecting a model from modal
  const handleSelectModel = async (model) => {
    if (!selectedItem) return;

    try {
      await axios.put(`http://localhost:5000/api/update-valve-row/${selectedItem.id}`, {
        selectedModel: model,
      });

      // Update local state and close modal
      setSelectedModelsMap((prev) => ({
        ...prev,
        [selectedItem.id]: model,
      }));
      setShowModal(false);
      setSelectedItem(null);

      // Refresh line items to get any updates from backend
      const res = await axios.get(`http://localhost:5000/api/rfq-details/${rfqNo}`);
      setLineItems(res.data);
    } catch (err) {
      alert("Failed to assign model");
    }
  };

  // Check if all models are selected (either from map or auma_model present)
  const allModelsSelected = lineItems.every(
    (item) => selectedModelsMap[item.id] || (item.auma_model && item.auma_model !== "")
  );

  // Handle convert to quotation button click and download PDF automatically
  const handleConvertToQuotation = async () => {
    if (!rfqNo) return;

    setLoadingQuotation(true);
    try {
      // First generate quotation number
      const res = await axios.post(`http://localhost:5000/api/generate-quotation/${rfqNo}`);
      const { quotationNumber: qno } = res.data;
      setQuotationNumber(qno);
      alert(`Quotation Number generated: ${qno}`);

      // Then download the PDF (make sure your backend supports this endpoint)
      const pdfRes = await axios.get(`http://localhost:5000/api/download-quotation-pdf/${qno}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([pdfRes.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `quotation_${qno}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert("Error generating quotation or downloading PDF");
      console.error(err);
    }
    setLoadingQuotation(false);
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h4>Select Models for RFQ: {rfqNo}</h4>
      <Table striped bordered>
        <thead>
          <tr>
            <th>AUMA Model(Actuator)</th>
            <th>Valve Type</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item) => {
            const selectedModel = selectedModelsMap[item.id];
            let price = "-";
            let totalPrice = "-";
            let modelDisplay = <em>Not selected</em>;

            if (selectedModel) {
              price = selectedModel.price;
              totalPrice = (item.quantity || 1) * price;
              modelDisplay = selectedModel.child_id;
            } else if (item.auma_model) {
              modelDisplay = item.auma_model;
            }

            return (
              <tr key={item.id}>
                <td>{selectedModel?.type || item.type || "—"}</td>
                <td>{item.valveType}</td>
                <td>{item.quantity ?? "—"}</td>
                <td>{price}</td>
                <td>{totalPrice}</td>
                <td>
                  <Button
                    variant="link"
                    onClick={() => fetchMatchingModels(item)}
                    title="Change or select model"
                  >
                    {(selectedModel || item.auma_model) ? " ? " : "Select ( ? )"}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {/* Model selection Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Matching Model</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {matchingModels.length === 0 ? (
            <p>No matching models found.</p>
          ) : (
            <Table hover size="sm">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Valve Type</th>
                  <th>Torque Max</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {matchingModels.map((m) => (
                  <tr key={m.child_id}>
                    <td>{m.type}</td>
                    <td>{m.valve_type}</td>
                    <td>{m.valve_max_valve_torque}</td>
                    <td>{m.price}</td>
                    <td>
                      <Button size="sm" onClick={() => handleSelectModel(m)}>
                        Select
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
      </Modal>

      {/* Convert to Quotation Button only */}
      <div className="mt-3">
        <Button
          onClick={handleConvertToQuotation}
          disabled={!allModelsSelected || loadingQuotation}
          variant="primary"
        >
          {loadingQuotation ? "Converting..." : "Convert to Quotation"}
        </Button>
      </div>
    </div>
  );
};

export default SelectModel;
