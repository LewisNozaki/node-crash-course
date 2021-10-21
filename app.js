// Imports
const express = require('express');
const morgan = require('morgan');
const mongoose = require("mongoose");
const Blog = require("./models/blog");
const Author = require("./models/author");

const path = require("path");
const rootDir = require("./helpers/path-helper");

require("dotenv").config({ path: path.join(rootDir, "secure", ".env") });

const PORT = process.env.PORT || 3000;

// express app
const app = express();

// Connects to MongoDB Atlas
// const dbURI = "mongodb+srv://kenji:07011990@cluster0.ydpsu.mongodb.net/MongoDB-Tutorial?retryWrites=true&w=majority";
mongoose.connect(process.env.dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => {
    console.log("connected to MongoDB Atlas");
    
    app.listen(PORT, () => console.log("server running on port", PORT));
  })
  .catch(err => console.log(err));

// listen for requests
// const PORT = 3000;
// app.listen(PORT, () => console.log("server running on port", PORT));

// register view engine
app.set('view engine', 'ejs');

// middleware & static files
app.use(express.static('public'));
app.use(morgan('dev'));

/////////////////////////////////////////
/* Mongoose and MongoDB sandbox routes */
/////////////////////////////////////////

// Post (using get here but, this is how to post new data)
app.get("/add-blog", (req, res) => {
  const blog = new Blog({
    title: "Luigi Buys a Haunted Mansion.. Again",
    snippet: "You won't expected what's inside...",
    body: "Luigi recently bought a mansion for a great price. After venturing inside he found that there were unexpected guests living there. Living, being the keyword... They were all ghosts! Luigi being the money saver that he is intends to take care of the problem himself. Perhaps he is a little in over his head?",
    email: "luigi@mario.com"
  });

  blog.save()
      .then(result => res.send(result))
      .catch(err => console.log(err));
});

// Get all (how to get all blogs in the blogs collection, example)
app.get("/all-blogs", (req, res) => {
  Blog.find()
      .then(results => res.send(results))
      .catch(err => console.log(err));
});

// Get single (how to retrieve one blog)
app.get("/single-blog", (req, res) => {
  Blog.findById("616f9b96c181b193dcc4620d")
      .then(results => res.send(results))
      .catch(err => console.log(err));
})

// testing - push using findOneAndUpdate & $push
app.get("/test", async (req, res) => {
  try {
    const author = await new Author({ firstName: "Kenji", lastName: "Nozaki"});
    
    const results = await Blog.findOneAndUpdate(
      { email: "luigi@mario.com" }, 
      { $push: {
        author: author
      }},
      { new: true }
      );
    
    res.send(results);
  } catch (err) {
    res.send(err);
  }
});

// testing 2 - modify with regular promises
app.get("/test2", (req, res) => {
  const id = "616fc9de28f6d15d26559ffe";

  Blog.findById(id)
    .then(result => {
      let authorIndex = result.author.findIndex(item => item.firstName === "Ivy");
      
      result.author[authorIndex].firstName = "Butters";

      result.markModified("author");

      return result.save();
    })
    .then(result => res.send(result))
    .catch(err => console.log(err));
});


// testing 3 - push with async await
app.get("/test3", async (req, res) => {
  const id = "616fc9de28f6d15d26559ffe";

  try {
    const blog = await Blog.findById(id);

    const person = await new Author({ firstName: "Jeffrey", lastName: "Nozaki" });

    blog.author.push(person);

    const result = await blog.save();

    res.send(result);
  } catch (err) {
    res.send(err);
  }
});


// testing 4 - modify with async await
app.get("/test4", async (req, res) => {
  const id = "616fc9de28f6d15d26559ffe";

  try {
    const blog = await Blog.findById(id);

    let authIndex = await blog.author.findIndex(item => item.firstName === "Kenji");

    blog.author[authIndex].firstName = "Lewis";

    blog.markModified("author");

    const result = await blog.save();

    res.send(result);
  } catch (err) {
    res.send(err);
  }
});

// test 5 - new entry
app.get("/test5", async (req, res) => {
  try {
    const blog = await new Blog({
      title: "Yet again, Bowser kidnaps Peach",
      snippet: "I mean, really...",
      body: "You would think that Bowser would reconsider his life choices. But, here we are again.",
      email: "bowser@mario.com",
      messages: [
        { userId: "Baby Bowser", text: "That's my dad!" }
      ]
    });

    const result = await blog.save();

    res.send(result);
  } catch (err) {
    res.send(err)
  }
});



// Middleware examples
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

app.get('/', (req, res) => {
  const blogs = [
    {title: 'Yoshi finds eggs', snippet: 'Lorem ipsum dolor sit amet consectetur'},
    {title: 'Mario finds stars', snippet: 'Lorem ipsum dolor sit amet consectetur'},
    {title: 'How to defeat bowser', snippet: 'Lorem ipsum dolor sit amet consectetur'},
  ];
  res.render('index', { title: 'Home', blogs });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

app.get('/blogs/create', (req, res) => {
  res.render('create', { title: 'Create a new blog' });
});

// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});
