import React, { useEffect, useState } from "react";
import axios from "axios";

const SelectModel = ({ rfqNo, inline }) => {
  const [modelData, setModelData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Loading...</p>;

  if (!modelData.length) {
    return <p>No matching gearbox found.</p>;
  }

  return (
    <div className={inline ? "flex flex-col gap-2" : "p-4 border rounded-lg"}>
      <h3 className="text-lg font-bold mb-2">Selected Gearbox Model</h3>
      {modelData.map((item) => (
        <div
          key={item.id}
          className="border p-3 rounded-lg shadow-sm bg-white"
        >
          <p><strong>RFQ No:</strong> {item.rfq_no}</p>
          <p><strong>Valve Type:</strong> {item.valveType}</p>
          <p><strong>Quantity:</strong> {item.quantity}</p>
          <p><strong>Calculated Torque:</strong> {item.calculatedTorque}</p>
          <p><strong>Actuator :</strong> {item.actuatorSeries}</p>
          {/* <p><strong>Actuator Type (from multiturn_actuator):</strong> {item.ActuatorType}</p> */}
          <p><strong>AUMA Electric Actuator :</strong> {item.actuatorSeries+ " + " + "AC" + " + "+ item.GearboxType}</p>
          <p><strong>Input Torque:</strong> {item.calculatedTorque/item.GearboxFactor}</p>
          <p><strong>Gearbox Reduction Ratio:</strong> {item.GearboxReductionRatio}</p>
          <p><strong>Factor:</strong> {item.GearboxFactor}</p>
          <p><strong>Gearbox Type:</strong> {item.GearboxType}</p>
           <p><strong>Max Allowable Stem Dia :</strong> {item.maximum_allowable_stem_dia}</p>
        </div>
      ))}
    </div>
  );
};

export default SelectModel;
