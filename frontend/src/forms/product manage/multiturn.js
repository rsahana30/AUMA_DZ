import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExcelUploadMultiturnGarebox from "../ExcelUploadMultiturnGarebox";

function Multiturn() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("manual");

  // ✅ Only required columns
  const initialFormData = {
    gearbox_type: "",
    gearbox_reduction_ratio: "",
    multi_turn_actuators: "",
    input_mounting_flange_en_iso_5210: "",
    input_mounting_flange_din_3210: "",
    permissible_weight_multi_turn_actuator: "",
    gearbox_factor: "",
    gearbox_max_input_nominal_torque_nm: "",
    gearbox_max_input_modulating_torque_nm: "",
    gearbox_input_shaft_standard_mm: "",
    gearbox_input_shaft_option_mm: "",
    gearbox_weight_kg: "",
    valve_attachment_standard_en_iso_5210: "",
    valve_attachment_option_din_3210: "",
    max_valve_nominal_torque: "",
    max_valve_modulating_torque: ""
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);

  // ✅ Labels exactly as you provided
  const fieldLabels = {
    gearbox_type: "Gearbox Type",
    gearbox_reduction_ratio: "Gearbox Reduction Ratio",
    multi_turn_actuators: "Multi Turn Actuators",
    input_mounting_flange_en_iso_5210: "Input mounting flange EN ISO 5210",
    input_mounting_flange_din_3210: "Input mounting flange DIN 3210",
    permissible_weight_multi_turn_actuator: "Permissible Weight Multi-turn Actuator",
    gearbox_factor: "Gearbox Factor",
    gearbox_max_input_nominal_torque_nm: "Gearbox Max Input Nominal Torque (Nm)",
    gearbox_max_input_modulating_torque_nm: "Gearbox Max Input Modulating Torque (Nm)",
    gearbox_input_shaft_standard_mm: "Gearbox Input Shaft Standard (mm)",
    gearbox_input_shaft_option_mm: "Gearbox Input Shaft Option (mm)",
    gearbox_weight_kg: "Gearbox Weight (kg)",
    valve_attachment_standard_en_iso_5210: "Valve Attachment Standard EN ISO 5210",
    valve_attachment_option_din_3210: "Valve Attachment Option DIN 3210",
    max_valve_nominal_torque: "Max Valve Nominal Torque",
    max_valve_modulating_torque: "Max Valve Modulating Torque"
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        "http://localhost:5000/api/save-multiturn-garebox",
        formData
      );
      toast.success(res.data.message || "Saved successfully!");
      setFormData(initialFormData); // ✅ Reset to empty
    } catch (err) {
      console.error("Error saving Multiturn:", err);
      toast.error(err.response?.data?.error || "Failed to save Multiturn");
    }

    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      <h4>Multiturn Gearbox Management</h4>

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
            className={`nav-link mb-3 ${
              activeTab === "manual"
                ? "active rounded border text-white bg-primary"
                : ""
            }`}
            onClick={() => setActiveTab("manual")}
          >
            Manual Entry
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link mb-3 ${
              activeTab === "excel"
                ? "active rounded border text-white bg-primary"
                : ""
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
                <label className="form-label">{fieldLabels[field]}</label>
                <input
                  type="text"
                  className="form-control"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                />
              </div>
            ))}

            <div className="col-12">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
        {activeTab === "excel" && <ExcelUploadMultiturnGarebox />}
      </div>
    </div>
  );
}

export default Multiturn;
