import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const ExcelUploadPartturn = () => {
  const [excelData, setExcelData] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const expectedHeaders = [
    "parent_id",
    "duty_class_name",
    "description",
    "valve_max_valve_torque",
    "valve_flange_iso5211",
    "valve_max_shaft_diameter",
    "type",
    "gearbox_reduction_ratio",
    "gearbox_factor",
    "gearbox_turns_90",
    "gearbox_input_shaft",
    "gearbox_input_mounting_flange",
    "gearbox_max_input_torques",
    "gearbox_weight",
    "gearbox_additional_weight_extension_flange",
    "gearbox_handwheel_diameter",
    "gearbox_manual_force",
    "valve_type",
    "protection_type",
    "painting",
    "price"
  ];

  const normalize = (str) =>
    str.toString().toLowerCase().replace(/\s+/g, "").replace(/[^\w]/gi, "");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("Please select a file.");
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (json.length === 0) {
          toast.error("Excel file is empty.");
          setLoading(false);
          return;
        }

        const uploadedHeaders = Object.keys(json[0]).map(normalize);
        const requiredHeaders = expectedHeaders.map(normalize);

        const missing = requiredHeaders.filter(
          (h) => !uploadedHeaders.includes(h)
        );

        if (missing.length > 0) {
          toast.error("❌ Uploaded Excel is not in the required format.");
          console.error("Missing headers:", missing);
          setLoading(false);
          return;
        }

        setExcelData(json);
        toast.success("✅ Excel data loaded successfully. Ready for upload.");
      } catch (error) {
        toast.error("Error reading the Excel file.");
        console.error("File read error:", error);
      }
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    if (excelData.length === 0) {
      toast.error("No data to upload. Please select and load an Excel file first.");
      return;
    }

    setLoading(true);
    try {
      await Promise.all(excelData.map(async (row) => {
        await axios.post("http://localhost:5000/api/save-partturn", row);
      }));
      toast.success("Data uploaded successfully!");
      setExcelData([]); // Clear data after successful upload
      fileInputRef.current.value = "";
    } catch (err) {
      console.error("Error uploading data:", err);
      toast.error(err.response?.data?.error || "Failed to upload data");
    }
    setLoading(false);
  };

  const handleClear = () => {
    setExcelData([]);
    fileInputRef.current.value = "";
    toast.info("Data cleared.");
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-3">Upload Part-turn Excel File</h4>
      <p>
        Download the sample Excel file to see the required format.
        <a href="/partturn.xlsx" download className="btn btn-link">
          Download Sample
        </a>
      </p>
      <div className="mb-3">
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="form-control" ref={fileInputRef} />
      </div>
      <button onClick={handleUpload} className="btn btn-primary" disabled={loading || excelData.length === 0}>
        {loading ? "Uploading..." : "Upload to Server"}
      </button>
      {excelData.length > 0 && (
        <button onClick={handleClear} className="btn btn-danger ms-2">
          Clear
        </button>
      )}
      <ToastContainer />

      {excelData.length > 0 && (
        <div className="mt-4">
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

export default ExcelUploadPartturn;