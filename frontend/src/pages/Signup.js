import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("customer");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const signupHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/auth/signup", {
        name,
        email,
        password,
        role,
      });
      toast.success("Signup successful!");
      navigate("/login");
    } catch (err) {
      console.log(err.message)
      toast.error("Signup failed");
    }
  };

  return (
    <div className="container-fluid vh-100">
      <ToastContainer />
      <div className="row h-100">
        <div className="col-lg-6 d-flex justify-content-center align-items-center">
          <div className="w-100" style={{ maxWidth: "450px" }}>
            <h2 className="text-center mb-4">Sign Up</h2>
            <form onSubmit={signupHandler}>
              <div className="form-group mb-3">
                <input
                  className="form-control"
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <input
                  className="form-control"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group mb-4">
                <input
                  className="form-control"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group mb-4">
                <input
                  className="form-control"
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="role"
                    id="customerRole"
                    value="customer"
                    checked={role === "customer"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="customerRole">
                    Customer
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="role"
                    id="adminRole"
                    value="admin"
                    checked={role === "admin"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="adminRole">
                    Admin
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100"
              >
                Sign Up
              </button>
            </form>
            <p className="text-center mt-3">
              Already have an account? <a href="/login">Login</a>
            </p>
          </div>
        </div>
        <div
          className="col-lg-6 d-none d-lg-flex text-white justify-content-center align-items-center"
          style={{
            background: "linear-gradient(to bottom, #007bff,rgb(4, 0, 255))",
          }}
        >
          <div className="text-center">
            <img
              src="https://www.auma.com/static/img/icons/auma_r_solutions_white_svg.svg"
              alt="Login Illustration"
              className="img-fluid p-3"
              style={{ width: "25em", height: "auto" }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Signup;
