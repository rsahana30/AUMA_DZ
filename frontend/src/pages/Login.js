import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const loginHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/rfq");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        {/* LEFT SIDE IMAGE */}
        <div
          className="col-lg-6 d-none d-lg-flex text-white justify-content-center align-items-center"
          style={{
            background: "linear-gradient(to bottom, #007bff, rgb(4, 0, 255))",
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

        {/* RIGHT SIDE LOGIN FORM */}
        <div className="col-lg-6 d-flex justify-content-center align-items-center">
          <div className="w-100" style={{ maxWidth: "450px" }}>
            <h2 className="text-center mb-4">Login</h2>
            <form onSubmit={loginHandler}>
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
              <button type="submit" className="btn btn-primary w-100">
                Login
              </button>
            </form>
            <p className="text-center mt-3">
              Don't have an account? <a href="/signup">Sign Up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
