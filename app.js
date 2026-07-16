const express = require('express');
const mysql = require('mysql2');
const app = express();
const multer = require('multer')

// Set view engine (assuming you’re using EJS)
app.set('view engine', 'ejs');
// enable static files
app.use(express.static('public'));
//enable form processing
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images'); // Specify the destination folder for uploaded images
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); 
  }
});
const upload = multer({ storage: storage });

// MySQL connection
const connection = mysql.createConnection({
  host: 'c237-adib-mysql.mysql.database.azure.com',
  user: 'c237_019',
  password: 'c237019@2026!',
  database: 'c237_019_team2_userdb'
});

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    return;
  }
  console.log('Connected to MySQL!');
});

// Define routes
app.get('/', (req, res) => {
  const sql = 'SELECT * FROM products';
  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.send('Error retrieving products');
    }
    res.render('index', { products: results });
  });
});

app.get('/product/:id', (req, res) => {
// Extract the product ID from the request parameters
const productId = req.params.id;
const sql = 'SELECT * FROM products WHERE productId = ?';
// Fetch data from MySQL based on the product ID
connection.query( sql , [productId], (error, results) => {
if (error) {
console.error('Database query error:', error.message);
return res.send('Error Retrieving product by ID');
}
// Check if any product with the given ID was found
if (results.length > 0) {
// Render HTML page with the product data
res.render('product', { product: results[0] });
} else {
// If no product with the given ID was found
res.send('Product not found');
}
});
});

app.get('/addProduct', (req, res) => {
res.render('addProduct');
});

app.post('/addProduct', upload.single('image'), (req, res) => {
// Extract product data from the request body
const {name, quantity, price} = req.body;
let image;
if (req.file) {
    image = req.file.filename;
}  else {
      image = null; 
}

const sql = 'INSERT INTO products (productName, quantity, price, image) VALUES (?, ?, ?, ?)';
// Insert the new product into the database
connection.query( sql , [name, quantity, price, image], (error, results) => {
if (error) {
// Handle any error that occurs during the database operation
console.error("Error adding product:", error);
res.send('Error adding product');
} else {
// Send a success response
res.redirect('/');
}
});
});

app.get('/editProduct/:id', (req,res) => {
const productId = req.params.id;
const sql = 'SELECT * FROM products WHERE productId = ?';
// Fetch data from MySQL based on the product ID
connection.query( sql , [productId], (error, results) => {
if (error) {
console.error('Database query error:', error.message);
return res.send('Error retrieving product by ID');
}
// Check if any product with the given ID was found
if (results.length > 0) {
// Render HTML page with the product data
res.render('editProduct', { product: results[0] });
} else {
// If no product with the given ID was found, render a 404 page or handle it accordingly
res.send('Product not found');
}
});
});

app.post('/editProduct/:id', (req, res) => {
const productId = req.params.id;
// Extract product data from the request body
const { name, quantity, price } = req.body;
const sql = 'UPDATE products SET productName = ? , quantity = ?, price = ? WHERE productId = ?';
// Insert the new product into the database
connection.query( sql , [name, quantity, price, productId], (error, results) => {
if (error) {
// Handle any error that occurs during the database operation
console.error("Error updating product:", error);
res.send('Error updating product');
} else {
// Send a success response
res.redirect('/');
}
});
});

app.get('/deleteProduct/:id', (req, res) => {
const productId = req.params.id;
const sql = 'DELETE FROM products WHERE productId = ?';
connection.query( sql , [productId], (error, results) => {
if (error) {
// Handle any error that occurs during the database operation
console.error("Error deleting product:", error);
res.send('Error deleting product');
} else {
// Send a success response
res.redirect('/');
}
});
});

// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
