import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getToken, logout } from "../utils/auth";
import { Dropdown } from "react-bootstrap";

const Navbar = () => {
  const token = getToken();
  const navigate = useNavigate();

  const handleSwitchAccount = () => {
    logout(); // or custom logic
    navigate("/login");
  };

  return (
    <nav className="navbar bg-white border rounded shadow-sm px-4 py-3 mb-3 d-flex justify-content-end align-items-center">
      {token ? (
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="light"
            className="bg-transparent border-0 p-0 d-flex align-items-center"
            id="user-dropdown"
          >
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
              style={{
                width: "36px",
                height: "36px",
                fontWeight: "500",
                fontSize: "14px",
                userSelect: "none",
              }}
            >
              X
            </div>
          </Dropdown.Toggle>

          <Dropdown.Menu className="shadow-sm border-0 mt-2 rounded">
            <Dropdown.Item onClick={handleSwitchAccount}>
              Switch Account
            </Dropdown.Item>
            <Dropdown.Item onClick={logout} className="text-danger">
              Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

      ) : (
        <div className="d-flex align-items-center">
          <Link className="btn btn-outline-secondary me-2 rounded" to="/login">
            Login
          </Link>
          <Link className="btn btn-primary rounded" to="/signup">
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;



