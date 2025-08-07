import React, { useState } from "react";
import * as XLSX from "xlsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ExcelUpload = () => {
  const [excelData, setExcelData] = useState([]);

  // Define expected headers (normalized: lowercase, no space)
  const expectedHeaders = [
    "item",
    "valvetype",
    "valvetagno",
    "valvesize(inch)",
    "valverating",
    "typeofduty(on-off/modulating)",
    "raisingstemornot",
    "valvetorque(nm)",
    "valvetopflangepcd(iso)",
    "valvestemdia(mm)",
    "valvemast(nm)",
    "numberofturns(forgateandglobevalves)"
  ];

  const normalizeHeader = (header) =>
    header?.toString().toLowerCase().replace(/\s+/g, "").trim();

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

      // Normalize uploaded headers
      const uploadedHeaders = Object.keys(json[0]).map(normalizeHeader);

      const missingHeaders = expectedHeaders.filter(
        (header) => !uploadedHeaders.includes(header)
      );

      if (missingHeaders.length > 0) {
        toast.error("Uploaded Excel does not match the required format.");
        console.error("Missing headers:", missingHeaders);
        return;
      }

      // If everything is fine
      setExcelData(json);
      toast.success("Excel uploaded successfully.");
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-3">Upload Excel File</h4>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <ToastContainer />
      <div className="mt-4">
        {excelData.length > 0 && (
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
        )}
      </div>
    </div>
  );
};

export default ExcelUpload;
