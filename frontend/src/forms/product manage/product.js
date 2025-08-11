import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Product() {
  const [selected, setSelected] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.value;
    setSelected(value);

    if (value === "partturn") {
      navigate("/product/partturn");
    } else if (value === "multiturn") {
      navigate("/multiturn");
    }
  };

  return (
    <div className="container mt-4">
      <h4>Product Management</h4>
      <div className="mt-3">
        <select
          className="form-select"
          value={selected}
          onChange={handleChange}
        >
          <option value="">-- Select Product Type --</option>
          <option value="partturn">Partturn</option>
          <option value="multiturn">Multiturn</option>
        </select>
      </div>
    </div>
  );
}

export default Product;
