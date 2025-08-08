import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getToken, logout, getUserFromToken } from "../utils/auth";
import { Dropdown, Form, InputGroup } from "react-bootstrap";

const Navbar = () => {
  const token = getToken();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      const userData = getUserFromToken();
      setUser(userData);
    }
  }, [token]);

  const handleSwitchAccount = () => {
    logout(); // or custom logic
    navigate("/login");
  };

  return (
    <nav className="navbar bg-white border shadow-sm px-4 py-3 d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center">
        <Link to="#" className="navbar-brand">
          <img src="/auma.svg" alt="Logo" style={{ height: "20px" }} />
        </Link>
      </div>

      <div className="flex-grow-1 mx-4" style={{ maxWidth: "600px" }}>
        <InputGroup>
          <Form.Control
            type="search"
            placeholder="Search..."
            className="form-control-sm"
          />
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
        </InputGroup>
      </div>

      {token ? (
        <div className="d-flex align-items-center">
          <i
            className="bi bi-bell fs-5 me-3"
            style={{ cursor: "pointer" }}
          ></i>
          <Dropdown align="end" className="me-3">
            <Dropdown.Toggle
              variant="light"
              className="bg-transparent border-0 p-0"
            >
              Help
            </Dropdown.Toggle>
            <Dropdown.Menu className="shadow-sm border-0 mt-2 rounded">
              <Dropdown.Item>Help Center</Dropdown.Item>
              <Dropdown.Item>Support</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item>Report an Issue</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

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
                {user ? user.email.charAt(0).toUpperCase() : "X"}
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow-sm border-0 mt-2 rounded">
              {user && (
                <div className="px-3 py-2">
                  <p className="fw-bold mb-0">{user.name}</p>
                  <p className="text-muted mb-1">{user.email}</p>
                  <p
                    className="badge bg-primary text-uppercase mb-0"
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {user.role}
                  </p>
                </div>
              )}
              <Dropdown.Divider />
              <Dropdown.Item as={Link} to="/profile">
                Profile
              </Dropdown.Item>
              <Dropdown.Item onClick={handleSwitchAccount}>
                Switch Account
              </Dropdown.Item>
              <Dropdown.Item onClick={logout} className="text-danger">
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
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



