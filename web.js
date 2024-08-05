const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create an instance of an Express application
const app = express();

// Use body-parser middleware to parse JSON requests
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Define the port the server will listen on
const PORT = 3001;

// Define the path to your SQLite database file
const dbPath = path.resolve(__dirname, 'data', 'reviews.db'); // Adjust path as needed

// Check if the database file exists, create it if it doesn't
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true }); // Create directories if they don't exist
  fs.closeSync(fs.openSync(dbPath, 'w')); // Create the empty database file
}

// Initialize SQLite database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database connection:', err.message);
  } else {
    createReviewsTable(); // Create reviews table if it doesn't exist
  }
});

// Function to create the reviews table if it doesn't exist
function createReviewsTable() {
  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author TEXT NOT NULL,
      content TEXT NOT NULL,
      rating INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
    } else {
    }
  });
}

// Middleware to enable CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Allow specific methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers
  next();
});

// Route for index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route for about.html
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

// Route for reviews.html
app.get('/reviews', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reviews.html'));
});

// Route for review_sent.html
app.get('/review_sent', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'review_sent.html'));
});

// Define a route for GET requests to save a new review
app.post("/reviews/author=:author/content=:content/rating=:rating", (req, res) => {
  let { author, content, rating } = req.params;
  // Ensure rating is parsed as an integer
  rating = parseInt(rating);

  // Validate rating is within range 1 to 5
  if (isNaN(rating) || rating < 1) {
    rating = 1;
  } else if (rating > 5) {
    rating = 5;
  }
  
  const query = 'INSERT INTO reviews (author, content, rating) VALUES (?, ?, ?)';

  db.run(query, [author, content, rating], function (err) {
    if (err) {
      return res.status(400).send('Error saving review: ' + err.message);
    }
    res.status(201).send('Review saved successfully');
  });
});

// Define a route for GET requests to fetch all reviews
app.get('/reviews/list', (req, res) => {
  const query = 'SELECT * FROM reviews';

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).send('Error fetching reviews: ' + err.message);
    }
    res.status(200).json(rows);
  });
});

// Start the server and have it listen on the specified port
app.listen(PORT, () => {
});
