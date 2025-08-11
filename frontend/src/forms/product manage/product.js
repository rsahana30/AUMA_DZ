import React, { useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

function Product() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const options = [
    { value: "partturn", label: "Partturn" },
    { value: "multiturn", label: "Multiturn" }
  ];

  const handleChange = (option) => {
    setSelected(option);

    if (option?.value === "partturn") {
      navigate("/product/partturn");
    } else if (option?.value === "multiturn") {
      navigate("/product/multiturn");
    }
  };

  return (
    <div className="container mt-4">
      <h4>Product Management</h4>
      <div className="mt-3" style={{ width: "220px" }}>
        <Select
          value={selected}
          onChange={handleChange}
          options={options}
          placeholder="-- Select Product Type --"
          styles={{
            control: (base) => ({
              ...base,
              minHeight: "38px",
              fontSize: "14px",
              borderRadius: "6px"
            }),
            menu: (base) => ({
              ...base,
              width: "220px" // Dropdown menu width
            }),
            option: (base, state) => ({
              ...base,
              width: "200px", // Each option width
              backgroundColor: state.isSelected
                ? "#007bff"
                : state.isFocused
                ? "#e6f0ff"
                : "white",
              color: state.isSelected ? "white" : "black"
            })
          }}
        />
      </div>
    </div>
  );
}

export default Product;
