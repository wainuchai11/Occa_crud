const express = require("express");
const app = express();
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const xlsx = require("xlsx");
const fs = require("fs");
const multer = require("multer");
const swaggerUi = require('swagger-ui-express');
const specs = require('swagger-jsdoc'); // Path to your swagger configuration file

require("dotenv").config();

const secretKey = process.env.JWT_SECRET;

const connection = mysql.createConnection({
  host: process.env.DB_HOST, // Your database host
  user: process.env.DB_USER, // Your database username
  password: null, // Your database password
  database: process.env.DB_NAME, // Your database name
});

function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Token is missing" });
  }

  jwt.verify(token.split(" ")[1], secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token verification failed" });
    }

    console.log(decoded);
    const { role } = decoded;
    if (role !== "1") {
      return res.status(403);
    }

    req.user = decoded;
    next();
  });
}

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Connected to the database");
  }
});

app.use(express.json());


// Set up the multer middleware for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

// GET request to retrieve all items
app.get("/api/employees", (req, res) => {
  const { name } = req.query;

  let query = "SELECT * FROM employees";
  let values = [];

  if (name) {
    query = `
    SELECT * FROM employees
    WHERE first_name LIKE ? OR last_name LIKE ?
  `;
    values = [`%${name}%`, `%${name}%`];
  }

  connection.query(query, values, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error retrieving employee data" });
    }
    res.json(results);
  });
});

// Define a route to insert employee data
app.post("/api/employees", verifyToken, (req, res) => {
  const { first_name, last_name, email, role, hire_date } = req.body;

  const query = `
      INSERT INTO employees (first_name, last_name, email, role, hire_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;

  const values = [first_name, last_name, email, role, hire_date];

  connection.query(query, values, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error inserting employee data" });
    }
    res.status(201).json({ message: "Employee data inserted successfully" });
  });
});

// PUT request to update an existing item
app.put("/api/employees/:id", verifyToken, (req, res) => {
  const employeeId = req.params.id;
  const { first_name, last_name, email, role, hire_date } = req.body;

  const query = `
      UPDATE employees
      SET first_name = ?, last_name = ?, email = ?, role = ?, hire_date = ?
      WHERE id = ?
    `;

  const values = [first_name, last_name, email, role, hire_date, employeeId];

  connection.query(query, values, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error updating employee data" });
    }
    res.json({ message: "Employee data updated successfully" });
  });
});

// DELETE request to delete an item
app.delete("/api/employees/:id", verifyToken, (req, res) => {
  const employeeId = req.params.id;

  const query = "DELETE FROM employees WHERE id = ?";

  connection.query(query, [employeeId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting employee data" });
    }
    res.json({ message: "Employee data deleted successfully" });
  });
});

app.post(
  "/api/import-employees-excel",
  verifyToken,
  upload.single("excelFile"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = xlsx.read(req.file.buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    // Assuming the first row contains headers
    const headers = rows[0];
    const employees = [];

    for (let i = 1; i < rows.length; i++) {
      const employee = {};
      for (let j = 0; j < headers.length; j++) {
        employee[headers[j]] = rows[i][j];
      }
      employees.push(employee);
    }

    const insertQuery = `
      INSERT INTO employees (first_name, last_name, email, role, hire_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;

    employees.forEach((employee) => {
      const values = [
        employee.first_name,
        employee.last_name,
        employee.email,
        employee.role,
        employee.hire_date,
      ];

      connection.query(insertQuery, values, (err) => {
        if (err) {
          console.error("Error inserting employee:", err);
        }
      });
    });

    res.json({ message: "Employees imported successfully" });
  }
);

// Generate a JWT
app.get("/api/token/generator", (req, res) => {
  const payload = {
    role: req.query.role,
  };
  const token = jwt.sign(payload, secretKey);

  res.json({ token });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
