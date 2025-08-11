import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ Added

function Partturn() {
  const navigate = useNavigate(); // ✅ Hook for navigation

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
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("http://localhost:5000/api/save-partturn", formData);
      setMessage(res.data.message || "Saved successfully!");
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
      setMessage("Failed to save Partturn");
    }

    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <h4>Partturn Management</h4>

      {message && (
        <div className={`alert ${message.includes("Failed") ? "alert-danger" : "alert-success"}`}>
          {message}
        </div>
      )}

      {/* Go Back Button */}
      <button
        type="button"
        className="btn btn-secondary mb-3"
        onClick={() => navigate(-1)} // Go back to previous page
      >
        ← Go Back
      </button>

      <form className="row g-3 mt-3" onSubmit={handleSubmit}>
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
    </div>
  );
}

export default Partturn;
