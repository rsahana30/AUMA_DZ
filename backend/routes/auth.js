const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const con = require("../db/connection");
require("dotenv").config();

// Signup
router.post("/signup", (req, res) => {
  const { name, email, password, role } = req.body;
  const hash = bcrypt.hashSync(password, 10);

  const query = "INSERT INTO users_auma (name,email,password,role) VALUES (?, ?, ?,?)";
  con.query(query, [name, email, hash, role], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Signup failed", detail: err });
    }
    res.json({ message: "Signup successful" });
  });
});

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";
  con.query(query, [email], (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = results[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ name: user.name, id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  });
});

module.exports = router;
