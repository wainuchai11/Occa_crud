const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

// GET request to retrieve all items
app.get('/api/items', (req, res) => {
    // Logic to retrieve items from your data source
    const items = [/* ... */];
    res.json(items);
  });
  
  // GET request to retrieve a specific item
  app.get('/api/items/:id', (req, res) => {
    const itemId = req.params.id;
    // Logic to retrieve the specific item by itemId
    const item = {/* ... */};
    res.json(item);
  });
  
  // POST request to create a new item
  app.post('/api/items', (req, res) => {
    const newItem = req.body;
    // Logic to create a new item
    // ...
    res.status(201).json(newItem);
  });
  
  // PUT request to update an existing item
  app.put('/api/items/:id', (req, res) => {
    const itemId = req.params.id;
    const updatedItem = req.body;
    // Logic to update the item by itemId
    // ...
    res.json(updatedItem);
  });
  
  // DELETE request to delete an item
  app.delete('/api/items/:id', (req, res) => {
    const itemId = req.params.id;
    // Logic to delete the item by itemId
    // ...
    res.sendStatus(204);
  });
  

const port = 3000; 
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

