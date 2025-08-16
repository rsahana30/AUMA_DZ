const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const authRoutes = require("./routes/auth");
const rfqRoutes = require("./routes/rfq");
const productRoutes = require("./routes/product");
const selectModelRoutes = require("./routes/model");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", rfqRoutes);
app.use("/api", productRoutes);
app.use("/api", selectModelRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});

