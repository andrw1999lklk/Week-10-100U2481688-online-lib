// This code runs with mongoose v7 plus
var express = require('express')
const { default: mongoose } = require('mongoose')
let Books = require('./BooksSchema') // Import the Mongoose Model
let connectDB = require('./MongoDBConnect').default // Import the connection function
const cors = require('cors')
console.log("Server2k25")
var app = express()

// Middleware
app.use(express.json()) // For parsing application/json
app.use(express.urlencoded({extended:false})) // For parsing application/x-www-form-urlencoded

app.use(cors()) // Enable CORS
console.log('BOOKS',Books) // Log the imported Mongoose Model

// --- Basic Routes ---

app.get('/', (req,res) =>{
  console.log("this is default")
  res.send("This is default")
})

app.get('/about', (req,res) => {
  res.send("mongodb express React and mongoose app,React runs in another application")
  // Example: Counting documents using Mongoose Model
  Books.countDocuments().exec()
    .then(count=>{
      console.log("Total documents Count before addition :", count)
    })
    .catch(err => {
      console.error(err)
    })
})

// --- GET Routes (Read Operations) ---

// Get all books using callbacks (old style)
app.get('/allbooksold', function(req,res){
  Books.find(function(err, allbook){
    if (err) {
      console.log(err)
    } else {
      res.json(allbook)
    }
  });
});

// Get all books using async/await (modern style)
app.get('/allbooks', async(req,res)=>{
  const d = await Books.find();
  return res.json(d)
})

// Get a single book by ID using callbacks (old style)
app.get('/getbookold/:id', function(req, res) {
  let id = req.params.id
  Books.findById(id, function(err, book) {
    console.log("found book"+book)
    res.json(book)
  });
})

// Get a single book by ID using async/await (modern style)
app.get('/getbook/:id', async(req, res) => {
  let id = req.params.id;
  let book = await Books.findById(id)
  if(book) {
    console.log("found book"+book)
    res.json(book)
  } else {
    console.log("No book found or Error")
    // Note: A 404 response is more appropriate here for production
    // res.status(404).json({ message: "No book found" });
  }
})

// --- POST Route (Create Operation) ---

// Add a new book
app.post('/addbooks', function(req,res){
  console.log("Ref", req.body)
  let newbook = new Books(req.body)
  console.log("newbook->",newbook)
  newbook.save()
    .then(todo => {
      res.status(200).json({ 'books': 'book added successfully'})
    })
    .catch(err => {
      res.status(400).send('adding new book failed')
    })
})

// --- POST Route (Update Operation) ---

// Update a book by ID (Mongoose v7+ - async/await, no callbacks)
app.post('/updatebook/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Optional: whitelist fields to prevent unintended updates
    const update = {
      booktitle: req.body.booktitle,
      PubYear: req.body.PubYear,
      author: req.body.author,
      Topic: req.body.Topic,
      formate: req.body.formate,
    };
    
    console.log("update request:", { id, update });
    
    // Perform the update
    const updatedBook = await Books.findByIdAndUpdate(
      id,
      { $set: update }, // use $set to avoid replacing the whole document
      {
        new: true, // return the updated doc
        runValidators: true, // enforce schema validation on updates
        // omitUndefined: true // optional: ignore fields that are undefined
      }
    );

    if (!updatedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    // You can return the updated document or just a message
    return res.status(200).json({
      message: 'book updated successfully',
      book: updatedBook
    });
    
  } catch (err) {
    console.error('update error:', err);
    return res.status(500).json({
      error: 'failed to update book',
      details: err.message
    });
  }
});

// --- POST Route (Delete Operation) ---

// Delete a book by ID
app.post('/deleteBook/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log("Deleting Book:", id);
    
    const deletedBook = await Books.findByIdAndDelete(id);

    if (!deletedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.status(200).send('Book Deleted');
    
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete book', details: err.message });
  }
});

// --- Server Startup ---

(async () => {
  await connectDB(); // Promise-based connection
  app.listen(5000, () => console.log('✅ Server running on port 5000'));
})();