// Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import { getToken, logout } from "../utils/auth";

const Navbar = () => {
  const token = getToken();

  return (
    <nav className="navbar navbar-dark bg-dark px-3">
      <Link className="navbar-brand" to="/">MyApp</Link>
      <div>
        {token ? (
          <button className="btn btn-danger" onClick={logout}>Logout</button>
        ) : (
          <>
            <Link className="btn btn-outline-light me-2" to="/login">Login</Link>
            <Link className="btn btn-outline-light" to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
