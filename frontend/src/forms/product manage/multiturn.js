import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Multiturn() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nominal_maximum_valve_torque: "",
    standard_en_iso_5210: "",
    option_din_3210: "",
    type: "",
    reduction_ratio: "",
    factor: "",
    suitable_auma_multi_turn_actuator: "",
    din_3210: "",
    actuator_series: ""
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
      const res = await axios.post(
        "http://localhost:5000/api/save-multiturn",
        formData
      );
      toast.success(res.data.message || "Saved successfully!");
      setFormData({
        nominal_maximum_valve_torque: "",
        standard_en_iso_5210: "",
        option_din_3210: "",
        type: "",
        reduction_ratio: "",
        factor: "",
        suitable_auma_multi_turn_actuator: "",
        din_3210: "",
        actuator_series: ""
      });
    } catch (err) {
      console.error("Error saving Multiturn:", err);
      toast.error(
        err.response?.data?.error || "Failed to save Multiturn"
      );
    }

    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      <h4>Multiturn Management</h4>

      <button
        type="button"
        className="btn btn-secondary mb-3"
        onClick={() => navigate(-1)}
      >
        ← Go Back
      </button>

      <form className="row g-3 mt-3" onSubmit={handleSubmit}>
        {Object.keys(formData).map((field) => (
          <div className="col-md-6" key={field}>
            <label className="form-label">
              {field
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
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
    </div>
  );
}

export default Multiturn;
