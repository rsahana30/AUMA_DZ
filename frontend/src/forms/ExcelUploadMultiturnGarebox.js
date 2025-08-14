import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

// 🔹 Utility: normalize header text aggressively
const normalize = (str) =>
  String(str || "")
    .replace(/\r?\n|\r/g, " ") // remove newlines
    .replace(/\s+/g, " ") // collapse spaces
    .replace(/[^a-z0-9 ]/gi, "") // keep only letters/numbers/spaces
    .toLowerCase()
    .trim();

// ✅ Required headers (already normalized form)
 const VALID_HEADERS = [
    "Gearbox Type",
    "Gearbox Reduction Ratio",
    "AUMA multi turn actuators",
    "Input mounting flange EN ISO 5210",
    "Input mounting flange DIN 3210",
    "Permissible weight Multi-turn actuator",
    "Gearbox Factor",
    "Gearbox max input nominal torque(Nm)",
    "Gearbox max input modulating torque(Nm)",
    "Gearbox input shaft_standard(mm)",
    "Gearbox input shaft_option(mm)",
    "Gearbox weight(kg)",
    "valve attachment_standard EN ISO 5210",
    "valve attachment_option Option DIN 3210",
    "Max Valve nominal torque",
    "Max Valve modulating Torque"
  ];


const ExcelUploadMultiturnGarebox = () => {
  const [excelData, setExcelData] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
  const selectedFile = e.target.files[0];
  if (!selectedFile) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    const bstr = evt.target.result;
    const wb = XLSX.read(bstr, { type: "binary" });
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

    // Normalize file headers
    const fileHeaders = jsonData[0]
      ?.filter((h) => h != null && String(h).trim() !== "")
      .map((h) => normalize(h).replace(/\s+/g, "")); // remove spaces after normalize

    const validHeadersNormalized = VALID_HEADERS.map((h) =>
      normalize(h).replace(/\s+/g, "")
    );

    // Find missing headers
    const missingHeaders = validHeadersNormalized.filter(
      (vh) => !fileHeaders.includes(vh)
    );

    if (missingHeaders.length > 0) {
      toast.error(`❌ Invalid Excel File`);
      setFile(null);
      setExcelData([]);
      return;
    }

    // Convert to JSON with objects
    const rawData = XLSX.utils.sheet_to_json(ws, { defval: "" });

    // Remove empty columns (columns where all rows are empty)
    const cleanedData = rawData.map((row) => {
      const newRow = {};
      Object.keys(row).forEach((key) => {
        const allEmpty = rawData.every(
          (r) => r[key] === null || r[key] === undefined || String(r[key]).trim() === ""
        );
        if (!allEmpty) newRow[key] = row[key];
      });
      return newRow;
    });

    setFile(selectedFile);
    setExcelData(cleanedData);
    toast.success("✅ Valid Excel file selected!");
  };
  reader.readAsBinaryString(selectedFile);
};

  const handleFileUpload = async () => {
    if (!file) {
      toast.error("Please select a valid Excel file first.");
      return;
    }

    setLoading(true);
    const formDataExcel = new FormData();
    formDataExcel.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/api//upload-multiturn-garebox",
        formDataExcel,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success(res.data.message || "File uploaded successfully!");
      handleClear();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setExcelData([]);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-3">Upload Multi-turn Excel File</h4>
      <p>
        📥 Download the sample Excel file to see the required format.
        <a href="/Multiturn Gearbox.xlsx" download className="btn btn-link">
          Download Sample
        </a>
      </p>

      <div className="mb-3">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="form-control"
          ref={fileInputRef}
        />
      </div>

      <button
        onClick={handleFileUpload}
        className="btn btn-primary"
        disabled={loading || excelData.length === 0}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {excelData.length > 0 && (
        <button onClick={handleClear} className="btn btn-danger ms-2">
          Clear
        </button>
      )}

      <ToastContainer />

      {excelData.length > 0 && (
        <div className="mt-4 table-responsive">
          <h5>Preview Data</h5>
          <table className="table table-bordered">
            <thead>
              <tr>
                {Object.keys(excelData[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {excelData.map((row, index) => (
                <tr key={index}>
                  {Object.keys(row).map((key) => (
                    <td key={key}>{row[key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExcelUploadMultiturnGarebox;
