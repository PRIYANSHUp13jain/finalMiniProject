// server.js - Main server file
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session configuration - this keeps users logged in
app.use(session({
  secret: 'your_secret_key',  // Change this to a secure random string
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } // 1 hour
}));

// MySQL connection - Connect to your existing database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // Your MySQL username
  password: '9977Hello',      // Your MySQL password here
  database: 'tastetrails'  // Changed to your existing database name
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to tastetrails database successfully');
  
  // We'll use your existing users table - no need to create it
  console.log('Using existing users table from tastetrails database');
});

// Routes - Define what happens when users visit different URLs
app.get('/', (req, res) => {
  // Check if user is logged in
  // if (req.session.loggedin) {
  //   // If logged in, redirect to index.html
  //   res.redirect('/index.html');
  // } else {
    // If not logged in, show login page
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
  // }
});

app.get('/signup', (req, res) => {
  // Show signup page
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// After route checks, serve static files (including your index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Handle signup form submission
app.post('/auth/signup', async (req, res) => {
  // Get data from signup form
  const { username, email, password } = req.body;
  
  // Check if all required fields are provided
  if (!username || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide username, email and password' 
    });
  }
  
  try {
    // Create a secure password hash
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user into your existing table structure
    const query = 'INSERT INTO users (username, email, password, fullname) VALUES (?, ?, ?, ?)';
    
    db.query(query, [username, email, hashedPassword, username], (err, result) => {
      if (err) {
        console.error('Database error during signup:', err);
        
        // Handle duplicate entries
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ 
            success: false, 
            message: 'Username or email already exists' 
          });
        }
        
        return res.status(500).json({ 
          success: false, 
          message: 'Database error during signup' 
        });
      }
      
      // Set session variables to log the user in
      req.session.loggedin = true;
      req.session.username = username;
      
      // Send success response
      res.status(201).json({ 
        success: true, 
        message: 'User registered successfully',
        redirect: '/index.html'
      });
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error during signup process' 
    });
  }
});

// Handle login form submission
app.post('/auth/login', (req, res) => {
  // Get username and password from login form
  const { username, password } = req.body;
  
  // Check if all required fields are provided
  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide username and password' 
    });
  }
  
  // Query the database for the user
  const query = 'SELECT * FROM users WHERE username = ?';
  
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error('Database error during login:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error during login' 
      });
    }
    
    // Check if user exists
    if (results.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Incorrect username or password' 
      });
    }
    
    // Compare the provided password with the stored hash
    try {
      const match = await bcrypt.compare(password, results[0].password);
      
      if (match) {
        // Set session variables to log the user in
        req.session.loggedin = true;
        req.session.username = username;
        
        // Send success response
        res.json({ 
          success: true, 
          message: 'Login successful',
          redirect: '/index.html'
        });
      } else {
        // Password doesn't match
        res.status(401).json({ 
          success: false, 
          message: 'Incorrect username or password' 
        });
      }
    } catch (error) {
      console.error('Error comparing passwords:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error during login process' 
      });
    }
  });
});

// Handle logout
app.get('/logout', (req, res) => {
  // Destroy session and redirect to login page
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error during logout' 
      });
    }
    res.redirect('/');
  });
});

// Check if user is authenticated
app.get('/check-auth', (req, res) => {
  if (req.session.loggedin) {
    res.json({ 
      authenticated: true, 
      username: req.session.username 
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to access the application`);
});