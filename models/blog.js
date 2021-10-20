// Import Mongoose
const mongoose = require("mongoose");

// Create a variable to access the Schema method from Mongoose
// This creates a constructor function
const Schema = mongoose.Schema;

// Create a new instance of a Schema
const blogSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  snippet: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  }
}, { timestamps: true });


// Create a Model - The model uses the schema instance we created above to create a document
// when the data comes in and then does the CRUD operations to the DB. For good practice, 
// we should name the model the "singular" of the collection name (so blog instead of blogs
// user instead of users).

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;

