// pages/Signup.js
import React, { useState } from "react";
import axios from "axios";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signupHandler = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/signup", { email, password });
      alert("Signup successful");
    } catch (err) {
      alert("Signup failed");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Signup</h2>
      <form onSubmit={signupHandler}>
        <input className="form-control mb-2" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="form-control mb-2" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="btn btn-success">Signup</button>
      </form>
    </div>
  );
};

export default Signup;
