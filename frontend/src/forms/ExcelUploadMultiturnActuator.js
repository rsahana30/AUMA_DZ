import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const VALID_HEADERS = [
  "Actuator Type",
  "Output speed rpm (50Hz)",
  "Output speed rpm (60Hz)",
  "Torque range min (Nm)",
  "Torque range S2-15 min/max (Nm)",
  "Torque range S2-30 min/max (Nm)",
  "Run torque S2-15 min/max (Nm)",
  "Run torque S2-30 min/max (Nm)",
  "Number of starts max (1h)",
  "Valve attachment standard EN ISO 5210",
  "Valve attachment option DIN 3210",
  "Valve attachment max. density rising stem (mm)",
  "Handwheel density (mm)",
  "Handwheel reduction ratio",
  "Weight approx (kg)",
];

// === Helper functions ===
function normalizeHeader(str) {
  const tokens = String(str || "")
    .normalize("NFKD")
    .replace(/\r?\n|\r/g, " ")
    .replace(/[^a-z0-9]+/gi, " ")
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const dedup = [];
  for (let i = 0; i < tokens.length; i++) {
    if (i === 0 || tokens[i] !== tokens[i - 1]) dedup.push(tokens[i]);
  }

  return { spaced: dedup.join(" "), nospace: dedup.join("") };
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function hasHeader(expectedKey, fileKeys) {
  if (fileKeys.includes(expectedKey)) return true;
  for (const fk of fileKeys) {
    if (levenshtein(expectedKey, fk) <= 2) return true;
  }
  return false;
}

const ExcelUploadMultiturnActuator = () => {
  const [excelData, setExcelData] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        if (!rows || rows.length === 0) {
          toast.error("The Excel file is empty.");
          return;
        }

        const fileHeaderRow = rows[0]
          ?.filter((h) => h != null && String(h).trim() !== "")
          .map((h) => normalizeHeader(h).nospace) || [];

        const expectedKeys = VALID_HEADERS.map((h) => normalizeHeader(h).nospace);

        const missing = expectedKeys.filter((expKey) => !hasHeader(expKey, fileHeaderRow));
        if (missing.length > 0) {
          const missingReadable = missing.map((mk) => {
            const idx = expectedKeys.indexOf(mk);
            return idx >= 0 ? VALID_HEADERS[idx] : mk;
          });
          toast.error(`❌ Invalid Excel File`);
          setFile(null);
          setExcelData([]);
          return;
        }

        // Remove _EMPTY columns here
       // Remove columns where all rows are empty
const rawData = XLSX.utils.sheet_to_json(ws, { defval: "" });
const cleanedData = rawData.map(row => {
  const newRow = {};
  Object.keys(row).forEach(key => {
    const allEmpty = rawData.every(r => String(r[key] || "").trim() === "");
    if (!allEmpty) {
      newRow[key] = row[key];
    }
  });
  return newRow;
});


        setFile(selectedFile);
        setExcelData(cleanedData);
        setShowPreview(false);
        toast.success("✅ Valid Excel file selected");
      } catch (err) {
        console.error("Error reading Excel:", err);
        toast.error("Failed to read the Excel file.");
      }
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
      const res = await axios.post("http://localhost:5000/api/upload-multiturn-actuator", formDataExcel, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message || "File uploaded successfully!");
      setShowPreview(true); // Now show preview after successful upload
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
    setShowPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-3">Upload Multi-turn Actuator Excel File</h4>

      <p className="mb-2">
        📥 Download the sample Excel file to see the required format.
        <a href="/Multiturn Actuators.xlsx" download className="btn btn-link">
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

      {showPreview && excelData.length > 0 && (
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
              {excelData.map((row, idx) => (
                <tr key={idx}>
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

export default ExcelUploadMultiturnActuator;
