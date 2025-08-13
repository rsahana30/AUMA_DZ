import React, { useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

function Product() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const options = [
    { value: "partturn garebox", label: "Partturn Garebox" },
    { value: "multiturn garebox", label: "Multiturn Garebox" },
    { value: "multiturn actuator", label: "Multiturn Actuator" }
  ];

  const handleChange = (option) => {
    setSelected(option);

    if (option?.value === "partturn garebox") {
      navigate("/product/partturnGarebox");
    } else if (option?.value === "multiturn garebox") {
      navigate("/product/multiturnGarebox");
    } else if (option?.value === "multiturn actuator") {
      navigate("/product/multiturnActuator");
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
