const express = require("express");
const app = express();
const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST, // Your database host
  user: process.env.DB_USER, // Your database username
  password: null, // Your database password
  database: process.env.DB_NAME, // Your database name
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Connected to the database");
  }
});

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

// GET request to retrieve all items
app.get("/api/employees", (req, res) => {
  const query = "SELECT * FROM employees";

  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error retrieving employees" });
    }
    res.json(results);
  });
});

// GET request to retrieve a specific item
app.get("/api/items/:id", (req, res) => {
  const itemId = req.params.id;
  // Logic to retrieve the specific item by itemId
  const item = {
    /* ... */
  };
  res.json(item);
});

// Define a route to insert employee data
app.post('/api/employees', (req, res) => {
    const { first_name, last_name, email, role, hire_date } = req.body;
  
    const query = `
      INSERT INTO employees (first_name, last_name, email, role, hire_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;
  
    const values = [first_name, last_name, email, role, hire_date];
  
    connection.query(query, values, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error inserting employee data' });
      }
      res.status(201).json({ message: 'Employee data inserted successfully' });
    });
  });

// PUT request to update an existing item
app.put('/api/employees/:id', (req, res) => {
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
        return res.status(500).json({ error: 'Error updating employee data' });
      }
      res.json({ message: 'Employee data updated successfully' });
    });
  });
// DELETE request to delete an item
app.delete('/api/employees/:id', (req, res) => {
    const employeeId = req.params.id;
  
    const query = 'DELETE FROM employees WHERE id = ?';
  
    connection.query(query, [employeeId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error deleting employee data' });
      }
      res.json({ message: 'Employee data deleted successfully' });
    });
  });

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
