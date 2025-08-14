import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExcelUploadMultiturnActuator from "../ExcelUploadMultiturnActuator";

function MultiturnActuator() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("manual");

  const [formData, setFormData] = useState({
    actuator_type: "",
    output_speed_rpm_50hz: "",
    output_speed_rpm_60hz: "",
    torque_range_min_nm: "",
    torque_range_s2_15_max_nm: "",
    torque_range_s2_30_max_nm: "",
    run_torque_s2_15_max_nm: "",
    run_torque_s2_30_max_nm: "",
    number_of_starts_max_per_hour: "",
    valve_attachment_standard_en_iso_5210: "",
    valve_attachment_option_din_3210: "",
    valve_attachment_max_density_rising_stem_mm: "",
    handwheel_density_mm: "",
    handwheel_reduction_ratio: "",
    weight_approx_kg: ""
  });

  const [loading, setLoading] = useState(false);

  // Mapping internal keys to human-readable labels (no \n)
  const labelMap = {
    actuator_type: "Actuator Type",
    output_speed_rpm_50hz: "Output Speed RPM 50Hz",
    output_speed_rpm_60hz: "Output Speed RPM 60Hz",
    torque_range_min_nm: "Torque Range Min. (Nm)",
    torque_range_s2_15_max_nm: "Torque Range S2-15 Min Max. (Nm)",
    torque_range_s2_30_max_nm: "Torque Range S2-30 Min Max. (Nm)",
    run_torque_s2_15_max_nm: "Run Torque S2-15 Min Max. (Nm)",
    run_torque_s2_30_max_nm: "Run Torque S2-30 Min Max. (Nm)",
    number_of_starts_max_per_hour: "Number of Starts Max. [1/h]",
    valve_attachment_standard_en_iso_5210: "Valve Attachment Standard EN ISO 5210",
    valve_attachment_option_din_3210: "Valve Attachment Option DIN 3210",
    valve_attachment_max_density_rising_stem_mm: "Valve Attachment Max Density Rising Stem [mm]",
    handwheel_density_mm: "Handwheel Density [mm]",
    handwheel_reduction_ratio: "Handwheel Reduction Ratio",
    weight_approx_kg: "Weight Approx. [kg]"
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
        "http://localhost:5000/api/save-multiturn-actuator",
        formData
      );
      toast.success(res.data.message || "Saved successfully!");
      setFormData({
        actuator_type: "",
        output_speed_rpm_50hz: "",
        output_speed_rpm_60hz: "",
        torque_range_min_nm: "",
        torque_range_s2_15_max_nm: "",
        torque_range_s2_30_max_nm: "",
        run_torque_s2_15_max_nm: "",
        run_torque_s2_30_max_nm: "",
        number_of_starts_max_per_hour: "",
        valve_attachment_standard_en_iso_5210: "",
        valve_attachment_option_din_3210: "",
        valve_attachment_max_density_rising_stem_mm: "",
        handwheel_density_mm: "",
        handwheel_reduction_ratio: "",
        weight_approx_kg: ""
      });
    } catch (err) {
      console.error("Error saving Multiturn:", err);
      toast.error(err.response?.data?.error || "Failed to save Multiturn");
    }

    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      <h4>Multiturn Actuator Management</h4>

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
                  {labelMap[field] || field}
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
        {activeTab === "excel" && <ExcelUploadMultiturnActuator />}
      </div>
    </div>
  );
}

export default MultiturnActuator;
