// components/Sidebar.js
import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => (
  <div className="bg-light border-end" style={{ width: "200px", height: "100vh" }}>
    <div className="list-group list-group-flush">
      <Link to="/" className="list-group-item list-group-item-action">Dashboard</Link>
      <Link to="/profile" className="list-group-item list-group-item-action">Profile</Link>
      <Link to="/rfq" className="list-group-item list-group-item-action">RFQ</Link>
    </div>
  </div>
);

export default Sidebar;
