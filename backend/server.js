const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const authRoutes = require("./routes/auth");

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);

app.listen(process.env.PORT, () => {
  console.log(`✅ Server running on port ${process.env.PORT}`);
});
