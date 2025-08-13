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
    parent_id: "",
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
    valve_type: "",
    protection_type: "",
    painting: "",
    price: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/save-partturn", formData);
      toast.success(res.data.message || "Saved successfully!");
      setFormData({
        parent_id: "",
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
        valve_type: "",
        protection_type: "",
        painting: "",
        price: ""
      });
    } catch (err) {
      console.error("Error saving Partturn:", err);
      toast.error(
        err.response?.data?.error || "Failed to save Partturn"
      );
    }

    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      <h4>Partturn Management</h4>

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
            className={`nav-link mb-3 rounded ${activeTab === "manual" ? "active border text-white bg-primary" : ""}`}
            onClick={() => setActiveTab("manual")}
          >
            Manual Entry
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link mb-3 rounded ${activeTab === "excel" ? "active border text-white bg-primary" : ""}`}
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
                  {field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </label>
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
