import React, { useState } from "react";
import * as XLSX from "xlsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ExcelUpload = () => {
  const [excelData, setExcelData] = useState([]);

  // Headers must match these (based on sample.xlsx)
  const expectedHeaders = [
    "Item",
    "Valve Type",
    "Valve Tag No",
    "Valve Size(Inch)",
    "Valve Rating",
    "Type of Duty (On-Off/Modulating)",
    "Raising Stem or not",
    "Valve Torque(Nm)",
    "Valve Top Flange PCD (ISO)",
    "Valve Stem Dia (mm)",
    "Valve Mast (Nm)",
    "Number of turns (for Gate and Globe valves)",
    "quantity"
  ];

  // Normalize header: remove whitespace, lowercase, remove special characters
  const normalize = (str) =>
    str.toString().toLowerCase().replace(/\s+/g, "").replace(/[^\w]/gi, "");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("Please select a file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (json.length === 0) {
        toast.error("Excel file is empty.");
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
        return;
      }

      // All good
      setExcelData(json);
      toast.success("✅ Excel uploaded successfully.");
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-3">Upload Excel File</h4>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <ToastContainer />

      {excelData.length > 0 && (
        <div className="mt-4">
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

export default ExcelUpload;
