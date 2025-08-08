import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import SelectModel from "./SelectModel";

const RFQ = () => {
  const [dropdowns, setDropdowns] = useState({});
  const [excelData, setExcelData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [showSelectModel, setShowSelectModel] = useState(false);
  const [currentRFQNo, setCurrentRFQNo] = useState(null);

  const expectedHeaders = [
    "valve_size_(inch)",
    "valve_rating",
    "type_of_duty_(on-off_/_modulating)",
    "raising_stem_or_not",
    "valve_torque_(nm)",
    "valve_top_flange_pcd_(iso)",
    "valve_stem_dia_(mm)",
    "valve_mast_(nm)",
    "number_of_turns_(for_gate_and_globe_valves)",
    "quantity"
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
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (rows.length === 0) return toast.error("Excel sheet is empty");

      const uploadedHeaders = Object.keys(rows[0]).map((key) =>
        key.trim().toLowerCase().replace(/\s+/g, "_")
      );

      const expectedTrimmed = expectedHeaders.map((key) =>
        key.trim().toLowerCase()
      );

      const isSameFormat = expectedTrimmed.every((header) =>
        uploadedHeaders.includes(header)
      );

      isSameFormat
        ? toast.success("✅ Excel format is valid")
        : toast.error("⚠️ Uploaded Excel does not match sample format");

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

  const handleSave = async () => {
    if (!dropdowns.customer) return toast.error("Please select a customer");
    if (!excelData.length) return toast.error("Please upload an Excel sheet");

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
      // Trigger save if RFQ not yet generated
      if (!dropdowns.customer) return toast.error("Please select a customer");
      if (!excelData.length) return toast.error("Please upload an Excel sheet");

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
      // RFQ already exists, just show SelectModel
      setShowSelectModel(true);
    }
  };


  return (
    <div className="container py-4">
      <div className="card shadow">
        <div className="card-body">
          <h3 className="text-primary fw-bold mb-4">Request For Quotation</h3>

          {/* Customer & Upload */}
          <div className="row">
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

            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Upload RFQ (Excel)</label>
              <input
                type="file"
                className="form-control"
                accept=".xlsx, .xls"
                onClick={(e) => (e.target.value = null)}
                onChange={handleFileUpload}
              />
              {uploadedFile ? (
                <div className="mt-2 d-flex align-items-center gap-2">
                  <span>• {uploadedFile.name}</span>
                  <button className="btn btn-sm btn-outline-primary" onClick={handleDownloadFile}>
                    <i className="bi bi-download" />
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={handleRemoveFile}>
                    <i className="bi bi-trash" />
                  </button>
                </div>
              ) : (
                <div className="mt-2">
                  <small>
                    Need a template? <a href="/sample.xlsx" download>Download sample file</a>
                  </small>
                </div>
              )}
            </div>
          </div>

          {/* Manual Entry Fields */}
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

              {/* Excel Table */}
              <div className="mt-4">
                {/* <h5 className="fw-bold">Uploaded RFQ File</h5> */}
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
                          {Object.values(row).map((val, i) => <td key={i}>{val}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="text-end mt-4">
                <button
                  className="btn btn-success px-4 me-3"
                  onClick={handleSave}
                  disabled={!!currentRFQNo}
                >
                  <i className="bi bi-save me-2"></i>Save
                </button>

                <button className="btn btn-primary px-4" onClick={handleSimulate} >
                  <i className="bi bi-lightning-charge me-2"></i>Simulate
                </button>
              </div>
            </>
          )}

          {/* RFQ Number & SelectModel */}
          {/* {currentRFQNo && (
            <div className="alert alert-info mt-5 fs-5 fw-bold">
              ✅ RFQ Number: <span className="text-primary">{currentRFQNo}</span>
            </div>
          )} */}

          {showSelectModel && currentRFQNo && (
            <div className="mt-4">
              {/* <h5 className="fw-bold mb-3">Select Matching AUMA Models</h5> */}
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
