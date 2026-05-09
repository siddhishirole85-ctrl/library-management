const express = require("express");

const cors = require("cors");

const app = express();

app.use(express.json());

app.use(cors());

// IMPORT ROUTES
const authRoutes = require("./routes/authRoutes");

const bookRoutes = require("./routes/bookRoutes");

// USE ROUTES
app.use("/api/auth", authRoutes);

app.use("/api/books", bookRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});