import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import SelectModel from "./SelectModel";
import { getToken, getUserFromToken } from "../utils/auth";

const RFQ = () => {
  const [user, setUser] = useState(null);
  const token = getToken();
  if (!token) window.location.href = "/login";

  useEffect(() => {
    if (token) {
      const userData = getUserFromToken();
      setUser(userData);
    }
  }, [token]);

  const [dropdowns, setDropdowns] = useState({});
  const [excelData, setExcelData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [showSelectModel, setShowSelectModel] = useState(false);
  const [currentRFQNo, setCurrentRFQNo] = useState(null);
  const [mode, setMode] = useState(""); // manual or upload
  const [manualRow, setManualRow] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [tempExcelData, setTempExcelData] = useState([]);


  const expectedHeaders = [
    "Item",
    "Valve Type",
    "Valve Tag No.",
    "Valve Size (Inch)",
    "Valve Rating",
    "Type of Duty (On-off / Modulating)",
    "Raising Stem or Not",
    "Valve Torque (Nm)",
    "Safety factor",
    "Calculated Torque",
    "Valve Top Flange PCD (ISO)",
    "Valve stem Dia (mm)",
    "Valve MAST (Nm)",
    "Number of Turns (for Gate and Globe valves)",
    "Quantity"
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
    weatherproofType: ["Weather Proof", "Explosion Proof"],
    certification: ["IP", "ATEX", "IECEX", "UL", "FM"],
    painting: ["Standard", "Special"],
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/customers")
      .then((res) => res.json())
      .then((data) => setCustomerOptions(data.customers || []))
      .catch(() => toast.error("Failed to load customers"));
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
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", range: 1 });

      if (rows.length === 0) return toast.error("Excel sheet is empty");

      const uploadedHeaders = Object.keys(rows[0]).map((key) =>
        key.trim().toLowerCase().replace(/\s+/g, "_")
      );

      const expectedTrimmed = expectedHeaders.map((key) =>
        key.trim().toLowerCase().replace(/\s+/g, "_")
      );

      const isSameFormat = expectedTrimmed.every((header) =>
        uploadedHeaders.includes(header)
      );

      if (!isSameFormat) {
        toast.error("⚠️ Uploaded Excel does not match sample format");
        return;
      }

      toast.success("✅ Excel format is valid");
      setExcelData(rows);
      setUploadedFile(file);

      if (rows[0]["Safety factor"]) {
        setDropdowns((prev) => ({
          ...prev,
          safetyFactor: rows[0]["Safety factor"]
        }));
      }
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

  const handleManualRowChange = (e) => {
    setManualRow({ ...manualRow, [e.target.name]: e.target.value });
  };

  const handleManualSave = () => {
    const rowObj = {};
    expectedHeaders.forEach((header) => {
      rowObj[header] = manualRow[header] || "";
    });
    setExcelData([rowObj]);

    if (manualRow["Safety factor"]) {
      setDropdowns((prev) => ({
        ...prev,
        safetyFactor: manualRow["Safety factor"]
      }));
    }

    toast.success("✅ Manual data added");
  };

  const handleSave = async () => {
    if (!dropdowns.customer) return toast.error("Please select a customer");
    if (!excelData.length) return toast.error("Please fill data");

    try {
      const payload = {
        user_id: user.id,
        submitted_by: user.name,
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
        setCurrentRFQNo(data.rfq_no);
        setShowSelectModel(false);
        toast.success(`✅ RFQ ${data.rfq_no} created successfully!`);
      } else {
        toast.error("❌ Failed to create RFQ");
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Server error");
    }
  };

  const handleSimulate = async () => {
    if (!currentRFQNo) {
      if (!dropdowns.customer) return toast.error("Please select a customer");
      if (!excelData.length) return toast.error("Please fill data");

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
          setCurrentRFQNo(data.rfq_no);
          toast.success(`✅ RFQ ${data.rfq_no} created successfully!`);
          setShowSelectModel(true);
        } else {
          toast.error("❌ Failed to create RFQ");
        }
      } catch (err) {
        console.error(err);
        toast.error("❌ Server error");
      }
    } else {
      setShowSelectModel(true);
    }
  };

  const handleTableChange = (e, rowIndex, colKey) => {
    const newData = [...excelData];
    newData[rowIndex][colKey] = e.target.value;
    setExcelData(newData);
  };


  return (
    <div className="container py-4">
      <div className="card shadow">
        <div className="card-body">
          <h3 className="text-primary fw-bold mb-4">Request For Quotation</h3>

          <div className="row">
            {/* Customer */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">{fieldLabels.customer}</label>
              <select
                className="form-select"
                name="customer"
                value={dropdowns.customer || ""}
                onChange={handleDropdownChange}
              >
                <option value="">Select Customer</option>
                {customerOptions.map((name, idx) => (
                  <option key={idx} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Enter RFQ Details Mode */}
            {/* Enter RFQ Details Mode */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Enter RFQ Details</label>
              <Select
                options={[
                  { value: "manual", label: "Manual" },
                  { value: "upload", label: "Upload File" }
                ]}
                onChange={(opt) => {
                  setMode(opt.value);
                  setExcelData([]);
                  setUploadedFile(null);
                  setManualRow({});
                }}
                placeholder="-- Select Mode --"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "38px",
                    fontSize: "14px",
                    borderRadius: "6px"
                  }),
                  menu: (base) => ({
                    ...base,
                    width: "220px" // dropdown menu width
                  }),
                  option: (base, state) => ({
                    ...base,
                    width: "200px", // each option width
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

          {/* Upload File Mode */}
          {mode === "upload" && (
            <div className="mt-4">
              <div className="card p-4 shadow-sm">
                <h5 className="mb-3">Upload RFQ Excel File</h5>
                <p>
                  Download sample to see the required format.
                  <a href="/sample.xlsx" download className="btn btn-link btn-sm ms-2">
                    Download Sample
                  </a>
                </p>

                {/* File Input */}
                <div className="mb-3">
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    className="form-control"
                    ref={fileInputRef}
                    onClick={(e) => (e.target.value = null)}
                    onChange={handleFileUpload}
                  />
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-2 mb-3">
                  <button
                    className="btn btn-primary"
                    disabled={loading || excelData.length === 0}
                  >
                    {loading ? "Uploading..." : "Upload to Server"}
                  </button>

                  {excelData.length > 0 && (
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        setExcelData([]);
                        setUploadedFile(null);
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Preview Table */}
                {excelData.length > 0 && (
                  <div className="table-responsive mt-3">
                    <table className="table table-bordered table-sm w-100">
                      <thead className="table-light">
                        <tr>
                          {Object.keys(excelData[0]).map((key) => (
                            <th key={key}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {excelData.map((row, idx) => (
                          <tr key={idx}>
                            {Object.keys(row).map((col, cidx) => (
                              <td key={cidx}>{row[col]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}




          {/* Manual Mode */}
          {mode === "manual" && (
  <div className="mb-3">
    {/* RFQ-Level Fields */}
    <h5 className="mb-3 text-primary fw-bold">RFQ Details</h5>
    <div className="row">
      {/* Customer */}
      <div className="col-md-4 mb-2">
        <label className="form-label fw-bold">{fieldLabels.customer}</label>
        <select
          className="form-select"
          name="customer"
          value={dropdowns.customer || ""}
          onChange={handleDropdownChange}
        >
          <option value="">Select Customer</option>
          {customerOptions.map((name, idx) => (
            <option key={idx} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* Other RFQ-level fields */}
      {["actuatorVoltage", "communication", "motorDuty", "actuatorSeries"].map((field) => (
        <div className="col-md-4 mb-2" key={field}>
          <label className="form-label fw-bold">{fieldLabels[field]}</label>
          <input
            type="text"
            className="form-control"
            name={field}
            value={dropdowns[field] || ""}
            onChange={handleDropdownChange}
          />
        </div>
      ))}

      {Object.keys(dropdownLabels).map((field) => (
        <div className="col-md-4 mb-2" key={field}>
          <label className="form-label fw-bold">{dropdownLabels[field]}</label>
          <select
            className="form-select"
            name={field}
            value={dropdowns[field] || ""}
            onChange={handleDropdownChange}
          >
            <option value="">Select {dropdownLabels[field]}</option>
            {predefinedValues[field].map((val, idx) => (
              <option key={idx} value={val}>{val}</option>
            ))}
          </select>
        </div>
      ))}
    </div>

    <hr />

    {/* Part-Level Fields */}
    <h5 className="mb-3 text-primary fw-bold">Part Details</h5>
    <div className="row">
      {expectedHeaders.map((h, idx) => (
        <div className="col-md-4 mb-2" key={idx}>
          <label className="form-label">{h}</label>
          <input
            type="text"
            name={h}
            className="form-control"
            value={manualRow[h] || ""}
            onChange={(e) => {
              const value = e.target.value;
              const updatedRow = { ...manualRow, [h]: value };

              // Auto-calculate Calculated Torque
              if (h === "Safety factor" || h === "Valve Torque (Nm)") {
                const safety = parseFloat(
                  h === "Safety factor" ? value : updatedRow["Safety factor"]
                );
                const torque = parseFloat(
                  h === "Valve Torque (Nm)" ? value : updatedRow["Valve Torque (Nm)"]
                );

                if (!isNaN(safety) && !isNaN(torque)) {
                  updatedRow["Calculated Torque"] = (safety * torque).toFixed(2);
                } else {
                  updatedRow["Calculated Torque"] = "";
                }
              }

              setManualRow(updatedRow);
            }}
            placeholder={`Enter ${h}`}
            readOnly={h === "Calculated Torque"} // user can't edit Calculated Torque
          />
        </div>
      ))}
    </div>

    <button className="btn btn-secondary mt-2" onClick={handleManualSave}>
      Save Manual Data
    </button>
  </div>
)}



          {/* Fields + Table */}
          {dropdowns.customer && excelData.length > 0 && (
            <>
              <hr className="my-4" />
              <div className="row">
                {Object.keys(fieldLabels)
                  .filter((f) => f !== "customer")
                  .map((field) => (
                    <div className="col-md-4 mb-3" key={field}>
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
                  <div className="col-md-4 mb-3" key={field}>
                    <label className="form-label fw-bold">{dropdownLabels[field]}</label>
                    <select
                      className="form-select"
                      name={field}
                      value={dropdowns[field] || ""}
                      onChange={handleDropdownChange}
                    >
                      <option value="">Select {dropdownLabels[field]}</option>
                      {predefinedValues[field].map((val, idx) => (
                        <option key={idx} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div className="mt-4 table-responsive">
                <table className="table table-bordered table-sm">
                  <thead className="table-light">
                    <tr>
                      {Object.keys(excelData[0])
                        .filter((key) => key !== "Safety factor" && key !== "Calculated Torque")
                        .map((key, idx) => (
                          <th key={idx}>{key}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {excelData.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        {Object.entries(row)
                          .filter(([key]) => key !== "Safety factor" && key !== "Calculated Torque")
                          .map(([colKey, val], colIdx) => (
                            <td key={colIdx}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={val}
                                  className="form-control form-control-sm"
                                  onChange={(e) => handleTableChange(e, rowIdx, colKey)}
                                />
                              ) : (
                                val
                              )}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Buttons */}
              <div className="text-end mt-4">
                {/* Edit Button */}
                <button
                  className="btn btn-warning px-4 me-3"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={!!currentRFQNo} // disable if RFQ is saved
                >
                  <i className={`bi ${isEditing ? "bi-check-lg" : "bi-pencil-square"} me-2`}></i>
                  {isEditing ? "Save Edits" : "Edit"}
                </button>

                {/* Save Button */}
                <button
                  className="btn btn-success px-4 me-3"
                  onClick={() => {
                    setIsEditing(false); // lock table
                    handleSave();
                  }}
                  disabled={!!currentRFQNo} // same as before
                >
                  <i className="bi bi-save me-2"></i>Save
                </button>

                <button
                  className="btn btn-primary px-4"
                  onClick={handleSimulate}
                >
                  <i className="bi bi-lightning-charge me-2"></i>Simulate
                </button>
              </div>
            </>
          )}

          {showSelectModel && currentRFQNo && (
            <div className="mt-4">
              <SelectModel rfqNo={currentRFQNo} inline />
            </div>
          )}
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default RFQ;
