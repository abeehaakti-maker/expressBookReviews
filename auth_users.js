const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => users.some(u => u.username === username);
const authenticatedUser = (username, password) =>
  users.some(u => u.username === username && u.password === password);

// Login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password required" });
  if (!authenticatedUser(username, password))
    return res.status(401).json({ message: "Invalid login. Check username and password" });

  const accessToken = jwt.sign({ data: password }, "access", { expiresIn: 60 * 60 });
  req.session.authorization = { accessToken, username };
  return res.status(200).json({ message: "Customer successfully logged in" });
});

// Add / modify review (review text sent as query param)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;
  if (!books[isbn]) return res.status(404).json({ message: "Book not found" });
  if (!review) return res.status(400).json({ message: "Review text required" });

  books[isbn].reviews[username] = review;
  return res.status(200).json({
    message: `The review for the book with ISBN ${isbn} has been added/updated.`,
    reviews: books[isbn].reviews
  });
});

// Delete own review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  if (!books[isbn]) return res.status(404).json({ message: "Book not found" });

  delete books[isbn].reviews[username];
  return res.status(200).json({
    message: `Review for the ISBN ${isbn} posted by the user ${username} deleted.`
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
