// app.js (or index.js)

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs'); 
const mysql = require('mysql');
const session = require('express-session');
const path = require('path'); // Import the 'path' module
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'views'))); // Assuming your static files are in the 'public' directory
const connection = mysql.createConnection({
    host: '127.0.0.1', // MySQL host
    user: 'root', // MySQL username
    password: '', // MySQL password
    database: 'root' // MySQL database name
  });
  
  // Connect to the database
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return;
    }
    console.log('Connected to MySQL database');
  });
  //////////////////////////////////////////////////////////////////////////////////////
  
  // Set up session middleware
  app.use(
    session({
      secret: 'aastmt',
      resave: false,
      saveUninitialized: true
    })
  );
// let departments = []; // Sample data, replace this with your database operations
// let users = []; // Sample data, replace this with your database operations
app.get('/', (req, res) => {
    res.render('index'); 
});
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    connection.query("SELECT * FROM employees where Username = ? AND Password = ? ", [username, password], (err, results) => {
      if (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ success: false, message: 'Error fetching users' });
        return;
      }
      if (results.length > 0){
        req.session.loggedin = true;
        req.session.username = username;
        console.log(username);
        res.redirect('/Dashboard'); 
      } else {
        res.status(500).json({ success: false, message: 'Authentication failed' });
      }
      
    });
});
app.get('/Dashboard', (req, res) => {

    if (!req.session.loggedin) {
      res.redirect('/');
      return; 
    }
  
    connection.query('SELECT * FROM employees', (err, results) => {
        if (err) {
          console.error('Error fetching users:', err);
          res.status(500).json({ error: 'Error fetching users' });
          return;
        }
        res.status(200).render('dashboard', { dashboard: results, username: req.session.username });
      });
    
    });
  // Se
// Route for adding departments
app.post('/api/adddepartment', (req, res) => {
    const { id, Name } = req.body;

    connection.query("SELECT * FROM departments where id = ? AND Name = ? ", [id, Name], (err, results) => {
      if (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ success: false, message: 'Error fetching users' });
        return;
      }
      if (results.length > 0){
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect('/dashboard'); 
      } else {
        res.status(500).json({ success: false, message: 'Authentication failed' });
      }
      
    });
});

// Route for adding users
app.post('/api/adduser', (req, res) => {
    const { username, password , departmentid} = req.body;

    // Process the signup data (e.g., insert into database)
    // Your code here to handle user signup
    connection.query("INSERT INTO employees (Username, Password, DepartmentID) VALUES (?, ?)", [username, password,departmentid], (err, results) => {
        if (err) {
            console.error('Error adding user:', err);
            res.status(500).json({ success: false, message: 'Error adding user' });
            return;
        }
        res.redirect('/user');
        //res.status(200).send('User added successfully!');
    });

    // For demonstration purposes, log the received data
    console.log('Received signup data:');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('DepartmentID:', departmentid)
});

// Other routes for handling user deletion, etc.
app.get('/api/deletedepartment', (req, res) => {
    const { id } = req.body;

    connection.query("DELETE FROM departments WHERE id = ?", [id], (err, results) => {
        if (err) {
            console.error('Error deleting department:', err);
            res.status(500).json({ success: false, message: 'Error deleting department' });
            return;
        }
        res.redirect('/dashboard');
        //res.status(200).send('User added successfully!');
    });
});
//sigout
app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
  });


// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
