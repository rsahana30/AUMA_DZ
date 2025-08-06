import React from "react";
import { Link, useLocation } from "react-router-dom";
import { getToken, logout } from "../utils/auth";

const Navbar = () => {
  const token = getToken();
  const location = useLocation();

  const pageTitles = {
    "/": "Dashboard",
    "/profile": "Profile",
    "/rfq": "Request for Quotation",
    "/login": "Login",
    "/signup": "Sign Up",
  };

  const pageTitle = pageTitles[location.pathname] || "Page";

  return (
    <nav className="navbar bg-white border rounded shadow-sm px-4 py-3 mb-3 d-flex justify-content-between align-items-center">
      <h3 className="m-0 fw-bold text-body">{pageTitle}</h3>

      <div className="d-flex align-items-center">
        {token ? (
          <button className="btn btn-outline-danger rounded" onClick={logout}>
            Logout
          </button>
        ) : (
          <>
            <Link className="btn btn-outline-secondary me-2 rounded" to="/login">
              Login
            </Link>
            <Link className="btn btn-primary rounded" to="/signup">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;


