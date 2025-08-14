import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

// 🔹 Normalization: ignores case, spaces, punctuation, newlines
const normalize = (str) =>
  String(str || "")
    .replace(/\r?\n|\r/g, "")
    .replace(/-/g, "")
    .replace(/[_]+/g, "")
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase()
    .trim();

// ✅ Required headers
const VALID_HEADERS = [
  "Duty Class",
  "description",
  "Max Valve Torque to (Nm)",
  "Valve attachment_Flange according to EN ISO 5211",
  "Valve attachement_Max. Shaft diameter [mm]",
  "Gearbox_type",
  "Gearbox_Reduction ratio",
  "Gearbox_Factor",
  "Gearbox_Turns for 90°",
  "Gearbox_Input shaft [mm]",
  "Gearbox_Input mounting flange for multi-turn actuator",
  "Gearbox_Max input torques [Nm]",
  "Gearbox_weight [kg]",
  "Gearbox_Additional weight Extension flange",
  "Gearbox_Handwheel Density [mm]",
  "Gearbox_Manual Force [N]"
];
const VALID_HEADERS_NORMALIZED = VALID_HEADERS.map(normalize);

const ExcelUploadPartturnGarebox = () => {
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

      // Read as array-of-arrays for header validation
      const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      const rawHeaders = jsonData[0] || [];
      const fileHeadersNormalized = rawHeaders.map(normalize);

      // Validate headers
      const missingHeaders = VALID_HEADERS_NORMALIZED.filter(
        (vh) => !fileHeadersNormalized.includes(vh)
      );
      if (missingHeaders.length > 0) {
        toast.error("❌ Invalid Excel File.");
        setFile(null);
        setExcelData([]);
        return;
      }

      // Map file headers → required headers
      const headerMap = {};
      fileHeadersNormalized.forEach((fh, idx) => {
        const matchIndex = VALID_HEADERS_NORMALIZED.indexOf(fh);
        headerMap[rawHeaders[idx]] =
          matchIndex !== -1 ? VALID_HEADERS[matchIndex] : rawHeaders[idx];
      });

      // Keep empty cells & align columns strictly
      const dataObjects = XLSX.utils.sheet_to_json(ws, {
        header: rawHeaders,
        range: 1, // skip header row
        defval: ""
      }).map((row) => {
        const newRow = {};
        rawHeaders.forEach((col) => {
          const cleanKey = headerMap[col] || col;
          newRow[cleanKey] = row[col];
        });
        return newRow;
      });

      setFile(selectedFile);
      setExcelData(dataObjects);
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
        "http://localhost:5000/api/upload-partturn-gearbox",
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
      <h4 className="mb-3">Upload Partturn Gearbox Excel File</h4>
      <p>
        📥 Download the sample Excel file to see the required format.
        <a href="/Partturn Gearbox.xlsx" download className="btn btn-link">
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

export default ExcelUploadPartturnGarebox;
