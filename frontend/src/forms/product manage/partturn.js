import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExcelUploadPartturnGarebox from "../ExcelUploadPartturnGarebox";

function PartturnGarebox() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("manual");

  const [formData, setFormData] = useState({
    duty_class_name: "",
    description: "",
    valve_max_valve_torque: "",
    valve_flange_iso5211: "",
    valve_max_shaft_diameter: "",
    type: "",
    gearbox_reduction_ratio: "",
    gearbox_factor: "",
    gearbox_turns_90: "",
    gearbox_input_shaft: "",
    gearbox_input_mounting_flange: "",
    gearbox_max_input_torques: "",
    gearbox_weight: "",
    gearbox_additional_weight_extension_flange: "",
    gearbox_handwheel_diameter: "",
    gearbox_manual_force: "",
    
  });

  const [loading, setLoading] = useState(false);

  // Mapping internal keys to human-readable labels
  const labelMap = {
  duty_class_name: "Duty Class",
  description: "Description",
  valve_max_valve_torque: "Max Valve Torque to (Nm)",
  valve_flange_iso5211: "Valve attachment_Flange according to EN ISO 5211",
  valve_max_shaft_diameter: "Valve attachement_Max. Shaft diameter [mm]",
  type: "Gearbox_type",
  gearbox_reduction_ratio: "Gearbox_Reduction ratio",
  gearbox_factor: "Gearbox_Factor",
  gearbox_turns_90: "Gearbox_Turns for 90°",
  gearbox_input_shaft: "Gearbox_Input shaft [mm]",
  gearbox_input_mounting_flange: "Gearbox_Input mounting flange for multi-turn actuator",
  gearbox_max_input_torques: "Gearbox_Max input torques [Nm]",
  gearbox_weight: "Gearbox_weight [kg]",
  gearbox_additional_weight_extension_flange: "Gearbox_Additional weight Extension flange",
  gearbox_handwheel_diameter: "Gearbox_Handwheel Density [mm]",
  gearbox_manual_force: "Gearbox_Manual Force [N]",
};


  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedFormData = { ...formData, [name]: value };

    // Auto-fill description based on Duty Class selection
    if (name === "duty_class_name") {
      if (value === "Duty Class 1") {
        updatedFormData.description = "Motor operation in accordance with EN 15714-2.";
      } else if (value === "Duty Class 2") {
        updatedFormData.description =
          "Motor operation for infrequently operated valves (max. 1,000 cycles)";
      } else if (value === "Duty Class 3") {
        updatedFormData.description =
          "Manual operation in accordance with EN 1074-2 (max. 250 cycles)";
      } else {
        updatedFormData.description = "";
      }
    }

    setFormData(updatedFormData);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Check if all form fields are empty
  const isEmpty = Object.values(formData).every(
    (value) => value === "" || value === null
  );

  if (isEmpty) {
    toast.error("Please fill in at least one field before saving.");
    return;
  }

  setLoading(true);

  try {
    const res = await axios.post(
      "http://localhost:5000/api/save-partturn-garebox",
      formData
    );
    toast.success(res.data.message || "Saved successfully!");
    setFormData({
      duty_class_name: "",
      description: "",
      valve_max_valve_torque: "",
      valve_flange_iso5211: "",
      valve_max_shaft_diameter: "",
      type: "",
      gearbox_reduction_ratio: "",
      gearbox_factor: "",
      gearbox_turns_90: "",
      gearbox_input_shaft: "",
      gearbox_input_mounting_flange: "",
      gearbox_max_input_torques: "",
      gearbox_weight: "",
      gearbox_additional_weight_extension_flange: "",
      gearbox_handwheel_diameter: "",
      gearbox_manual_force: "",
    });
  } catch (err) {
    console.error("Error saving Partturn:", err);
    toast.error(err.response?.data?.error || "Failed to save Partturn");
  }

  setLoading(false);
};

  return (
    <div className="container mt-4">
      <ToastContainer />
      <h4>Partturn Gearbox Management</h4>

      <button
        type="button"
        className="btn btn-secondary mb-3"
        onClick={() => navigate(-1)}
      >
        ← Go Back
      </button>

      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link mb-3 rounded ${
              activeTab === "manual" ? "active border text-white bg-primary" : ""
            }`}
            onClick={() => setActiveTab("manual")}
          >
            Manual Entry
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link mb-3 rounded ${
              activeTab === "excel" ? "active border text-white bg-primary" : ""
            }`}
            onClick={() => setActiveTab("excel")}
          >
            Excel Upload
          </button>
        </li>
      </ul>

      <div className="tab-content mt-3">
        {activeTab === "manual" && (
          <form className="row g-3" onSubmit={handleSubmit}>
            {Object.keys(formData).map((field) => (
              <div className="col-md-6" key={field}>
                <label className="form-label">
                  {labelMap[field] || field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </label>
{field === "type" ? (
  <select
    className="form-select"
    name={field}
    value={formData[field]}
    onChange={handleChange}
  >
    <option value="">Select Gearbox Type</option>
    <option value="GS 50.3">GS 50.3</option>
    <option value="GS 63.3">GS 63.3</option>
    <option value="GS 80.3">GS 80.3</option>
    <option value="GS 100.3">GS 100.3</option>
    <option value="GS 125.3">GS 125.3</option>
    <option value="GS 160.3">GS 160.3</option>
    <option value="GS 200.3">GS 200.3</option>
    <option value="GS 250.3">GS 250.3</option>
  </select>
) : field === "duty_class_name" ? (
  <select
    className="form-select"
    name={field}
    value={formData[field]}
    onChange={handleChange}
  >
    <option value="">Select Duty Class</option>
    <option value="Duty Class 1">Duty Class 1</option>
    <option value="Duty Class 2">Duty Class 2</option>
    <option value="Duty Class 3">Duty Class 3</option>
  </select>
) : (
  <input
    type="text"
    className="form-control"
    name={field}
    value={formData[field]}
    onChange={handleChange}
    readOnly={field === "description"} // optional
  />
)}

              </div>
            ))}

            <div className="col-12">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
        {activeTab === "excel" && <ExcelUploadPartturnGarebox />}
      </div>
    </div>
  );
}

export default PartturnGarebox;
