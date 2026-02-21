const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");

// Database connection
require("./api/models/db.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Server is running with MongoDB connection");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Dodajte za statičnimi datotekami, pred app.listen
const apiRoutes = require('./api/routes/api');
app.use('/api', apiRoutes);