import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap-icons/font/bootstrap-icons.css";


const RFQ = () => {
  const [dropdowns, setDropdowns] = useState({});
  const [excelData, setExcelData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [customerOptions, setCustomerOptions] = useState([]);
  const simulateRef = useRef(null);

  const expectedHeaders = [
    "type",
    "valve_tag",
    "valve_type",
    "valve_size",
    "valve_class",
    "valve_rating",
    "valve_material",
    "valve_model",
    "valve_end_connection",
    "valve_operator",
    "valve_flange_iso5211",
    "valve_max_valve_torque",
  ];

  const fieldLabels = {
    customer: "Customer",
    safetyFactor: "Safety Factor",
    actuatorVoltage: "Actuator Voltage",
    communication: "Communication",
    motorDuty: "Motor Duty",
    actuatorSeries: "Actuator Series",
  };

  const dropdownLabels = {
    controllerType: "Controller Type (AM/AC)",
    gearBoxLocation: "Gear Box Location",
    weatherproofType: "Weatherproof / Explosion Proof",
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
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (rows.length === 0) {
        toast.error("Excel sheet is empty");
        return;
      }

      const uploadedHeaders = Object.keys(rows[0]).map((key) =>
        key.trim().toLowerCase().replace(/\s+/g, "_")
      );
      const expectedTrimmed = expectedHeaders.map((key) =>
        key.trim().toLowerCase()
      );

      const isSameFormat = expectedTrimmed.every((header) =>
        uploadedHeaders.includes(header)
      );

      if (!isSameFormat) {
        toast.error("\u26A0\uFE0F Uploaded Excel does not match sample format");
      } else {
        toast.success("\u2705 Excel format is valid");
      }

      setExcelData(rows);
      setUploadedFile(file);
    };
    reader.readAsBinaryString(file);
  };

  const handleRemoveFile = () => {
    setExcelData([]);
    setUploadedFile(null);
  };

  const handleDownloadFile = () => {
    if (uploadedFile) {
      const url = URL.createObjectURL(uploadedFile);
      const link = document.createElement("a");
      link.href = url;
      link.download = uploadedFile.name;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleSubmit = async () => {
    if (!dropdowns.customer) {
      toast.error("Please select a customer");
      return;
    }

    if (!excelData.length) {
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
        setExcelData([]);
        setDropdowns({});
        setUploadedFile(null);
      } else {
        toast.error("Failed to submit RFQ");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const handleSimulate = () => {
    toast.info("Simulate clicked");
    if (simulateRef.current) {
      simulateRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSave = () => {
    toast.success("Saved successfully");
  };

  const handleEdit = () => {
    toast.info("Edit mode activated");
  };

  return (
    <>
      <div className="p-4 border rounded shadow bg-white">
        <h3 className="mb-4 text-primary fw-bold">Request For Quotation</h3>

        <div className="row mb-4">
          <div className="col-md-6 mb-3 ps-4">
            <label className="form-label fw-bold">{fieldLabels.customer}</label>
            <select
              className="form-select"
              name="customer"
              onChange={handleDropdownChange}
              value={dropdowns.customer || ""}
            >
              <option value="">Select Customer</option>
              {customerOptions.map((name, idx) => (
                <option key={idx} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="col-md-6 mb-3 pe-4">
            <label className="form-label fw-bold">Upload RFQ (Excel)</label>
            <input
              type="file"
              accept=".xlsx, .xls"
              className="form-select"
              onClick={(e) => (e.target.value = null)}
              onChange={handleFileUpload}
            />
            {uploadedFile && (
              <div className="mt-2 d-flex align-items-center gap-2">
                <span>• {uploadedFile.name}</span>
                <button className="btn btn-sm btn-outline-primary" onClick={handleDownloadFile} title="Download file">
                  <i className="bi bi-download"></i>
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={handleRemoveFile} title="Delete file">
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            )}
            {!uploadedFile && (
              <div className="mt-2">
                <small>Need a template? <a href="/sample.xlsx" download>Download sample file</a></small>
              </div>
            )}
          </div>
        </div>

        {dropdowns.customer && excelData.length > 0 && (
          <>
            <div className="row">
              {Object.keys(fieldLabels)
                .filter((field) => field !== "customer")
                .map((field) => (
                  <div className="col-md-4 mb-3 px-4" key={field}>
                    <label className="form-label fw-bold">{fieldLabels[field]}</label>
                    <input
                      type="text"
                      className="form-control"
                      name={field}
                      value={dropdowns[field] || ""}
                      onChange={handleDropdownChange}
                      placeholder={`Enter ${fieldLabels[field]}`}
                    />
                  </div>
                ))}

              {Object.keys(dropdownLabels).map((field) => (
                <div className="col-md-4 mb-3 px-4" key={field}>
                  <label className="form-label fw-bold">{dropdownLabels[field]}</label>
                  <select
                    className="form-select"
                    name={field}
                    value={dropdowns[field] || ""}
                    onChange={handleDropdownChange}
                  >
                    <option value="">Select {dropdownLabels[field]}</option>
                    {predefinedValues[field].map((value, idx) => (
                      <option key={idx} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div ref={simulateRef} className="mt-5">
              <h5 className="fw-bold">Preview of Uploaded Excel Data</h5>
              <div className="table-responsive">
                <table className="table table-bordered table-sm">
                  <thead className="table-light">
                    <tr>
                      {Object.keys(excelData[0]).map((key, idx) => (
                        <th key={idx}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {excelData.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((val, i) => (
                          <td key={i}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-12 mt-4 px-4 text-end">
              <button className="btn btn-primary px-4 me-3" onClick={handleSimulate}>
                <i className="bi bi-lightning-charge me-2"></i>Simulate
              </button>
              <button className="btn btn-success px-4 me-3" onClick={handleSave}>
                <i className="bi bi-save me-2"></i>Save
              </button>
              <button className="btn btn-warning px-4 me-3" onClick={handleEdit}>
                <i className="bi bi-pencil-square me-2"></i>Edit
              </button>
              <button className="btn btn-danger px-4" onClick={handleSubmit}>
                <i className="bi bi-send me-2"></i>Submit RFQ
              </button>
            </div>
          </>
        )}
      </div>
      <ToastContainer />
    </>
  );
};

export default RFQ;