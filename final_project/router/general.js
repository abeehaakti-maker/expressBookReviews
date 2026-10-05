const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

// ---------- Register ----------
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password required" });
  if (isValid(username)) return res.status(409).json({ message: "User already exists!" });
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// ---------- Core routes ----------
public_users.get('/', (req, res) => res.status(200).send(JSON.stringify(books, null, 4)));

public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book);
});

public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();
  const result = Object.keys(books)
    .filter(k => books[k].author.toLowerCase() === author)
    .map(k => ({ isbn: k, ...books[k] }));
  if (!result.length) return res.status(404).json({ message: "No books found for this author" });
  return res.status(200).json({ booksbyauthor: result });
});

public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();
  const result = Object.keys(books)
    .filter(k => books[k].title.toLowerCase() === title)
    .map(k => ({ isbn: k, ...books[k] }));
  if (!result.length) return res.status(404).json({ message: "No books found with this title" });
  return res.status(200).json({ booksbytitle: result });
});

public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book.reviews);
});

// ---------- Axios client functions (Promise callbacks / async-await) ----------

// Get all books - Promise callbacks
const getAllBooks = () =>
  axios.get(`${BASE_URL}/`)
    .then(response => { console.log("All books:", response.data); return response.data; })
    .catch(err => console.error("Error fetching books:", err.message));

// Get book by ISBN - Promise callbacks
const getBookByISBN = (isbn) =>
  axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then(response => { console.log("Book by ISBN:", response.data); return response.data; })
    .catch(err => console.error("Error fetching book by ISBN:", err.message));

// Get books by author - async/await
const getBooksByAuthor = async (author) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    console.log("Books by author:", response.data);
    return response.data;
  } catch (err) {
    console.error("Error fetching books by author:", err.message);
  }
};

// Get books by title - async/await
const getBooksByTitle = async (title) => {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    console.log("Books by title:", response.data);
    return response.data;
  } catch (err) {
    console.error("Error fetching books by title:", err.message);
  }
};

// Routes that use the Axios functions, so they can be tested with cURL
public_users.get('/async/books', async (req, res) => res.json(await getAllBooks()));
public_users.get('/async/isbn/:isbn', async (req, res) => res.json(await getBookByISBN(req.params.isbn)));
public_users.get('/async/author/:author', async (req, res) => res.json(await getBooksByAuthor(req.params.author)));
public_users.get('/async/title/:title', async (req, res) => res.json(await getBooksByTitle(req.params.title)));

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
