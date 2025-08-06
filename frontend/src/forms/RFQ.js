import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RFQTable from "./RFQTable";

const RFQ = () => {
  const [dropdowns, setDropdowns] = useState({});
  const [excelData, setExcelData] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [excelUploaded, setExcelUploaded] = useState(false);

  const fieldLabels = {
    customer: "Customer",
    safetyFactor: "Safety Factor",
    actuatorVoltage: "Actuator Voltage",
    communication: "Communication",
    motorDuty: "Motor Duty",
    actuatorSeries: "Actuator Series",
    // controllerType: "Controller Type (AM/AC)",
    // gearBoxLocation: "Gear Box Location",
    // weatherproofType: "Weatherproof / Explosion Proof",
    // certification: "Certification Requirement",
    // painting: "Painting (Standard / Special)",
  };

  const dropdownLabels = {
    controllerType: "Controller Type (AM/AC)",
    gearBoxLocation: "Gear Box Location",
    weatherproofType: "Weather Proof / Explosion Proof",
    certification: "Certification Requirement",
    painting: "Painting (Standard / Special)",
  };

  const predefinedValues = {
    controllerType: ["AM", "AC"],
    gearBoxLocation: ["Germany", "India", "Korea"],
    weatherproofType: ["Weatherproof", "Explosion Proof"],
    certification: ["IP", "ATEX", "IECEX", "UL", "FM"],
    painting: ["Standard", "Special"],
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/customers")
      .then((res) => res.json())
      .then((data) => setCustomerOptions(data.customers || []))
      .catch((err) => {
        console.error("Failed to load customers", err);
        toast.error("Failed to load customers");
      });
  }, []);

  const handleDropdownChange = (e) => {
    setDropdowns({ ...dropdowns, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);
      setExcelData(rows);
      setExcelUploaded(true);
      toast.success("Excel sheet uploaded");
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async () => {
    if (!dropdowns.customer) {
      toast.error("Please select a customer");
      return;
    }

    if (!excelUploaded) {
      toast.error("Please upload an Excel sheet");
      return;
    }

    try {
      const payload = {
        manualFields: dropdowns,
        excelRows: excelData,
      };

      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`RFQ submitted: ${data.rfq_no}`);
      } else {
        toast.error("Failed to submit RFQ");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  return (
    <>
      <div className="">
        <div className="p-4 border rounded shadow-sm bg-white">
          <h3 className="mb-4 text-primary fw-bold">RFQ Upload</h3>

          {/* Customer Dropdown and Excel Upload */}
          <div className="row mb-4">
            <div className="col-md-6 ps-4">
              <label className="form-label fw-bold">{fieldLabels.customer}</label>
              <select
                className="form-select"
                name="customer"
                onChange={handleDropdownChange}
              >
                <option value="">Select Customer</option>
                {customerOptions.map((name, idx) => (
                  <option key={idx} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6 pe-4">
              <label className="form-label fw-bold">Upload Excel Sheet</label>
              <input
                type="file"
                accept=".xlsx, .xls"
                className="form-control"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {dropdowns.customer && excelUploaded && (
            <div className="row">
              {Object.keys(fieldLabels)
                .filter((field) => field !== "customer")
                .map((field) => (
                  <div className="col-md-4 mb-3 px-4" key={field}>
                    <label className="form-label fw-bold">{fieldLabels[field]}</label>
                    <input
                      type="text"
                      className="form-control fw-light"
                      name={field}
                      onChange={handleDropdownChange}
                      placeholder={`Enter ${fieldLabels[field]}`}
                    />
                  </div>
                ))}

              {Object.keys(dropdownLabels).map((field) => (
                <div className="col-md-4 mb-3 px-4" key={field}>
                  <label className="form-label fw-bold">{dropdownLabels[field]}</label>
                  <select
                    className="form-select fw-light"
                    name={field}
                    onChange={handleDropdownChange}
                  >
                    <option value="">Select {dropdownLabels[field]}</option>
                    {predefinedValues[field].map((value, idx) => (
                      <option key={idx} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <div className="col-12 mt-3 px-4">
                <button className="btn btn-success px-4" onClick={handleSubmit}>
                  Submit RFQ
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
      <RFQTable />
      <ToastContainer />
    </>
  );
};

export default RFQ;
