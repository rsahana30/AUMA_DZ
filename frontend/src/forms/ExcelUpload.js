import React, { useState } from "react";
import * as XLSX from "xlsx";

const ExcelUpload = () => {
  const [excelRows, setExcelRows] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setExcelRows(jsonData);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = () => {
    // Example fetch, adjust API URL accordingly
    fetch("http://localhost:5000/api/upload-excel-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: excelRows }),
    })
      .then((res) => res.json())
      .then((data) => alert("Upload successful"))
      .catch((err) => alert("Upload failed"));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload RFQ Excel File</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <button onClick={handleSubmit}>Submit RFQ</button>

      <h3>Preview Excel Rows</h3>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          {excelRows.length > 0 && (
            <tr>
              {Object.keys(excelRows[0]).map((key, index) => (
                <th key={index}>{key}</th>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {excelRows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.values(row).map((value, colIndex) => (
                <td key={colIndex}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExcelUpload;
