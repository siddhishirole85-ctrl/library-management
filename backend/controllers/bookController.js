const db = require("../config/db");

// GET ALL BOOKS
exports.getBooks = (req, res) => {
  db.query("SELECT * FROM books", (err, result) => {
    if (err) return res.json({ message: "Error fetching books" });

    res.json(result);
  });
};

// ADD BOOK
exports.addBook = (req, res) => {
  const { title } = req.body;

  db.query("INSERT INTO books (title) VALUES (?)", [title], (err) => {
    if (err) return res.json({ message: "Error adding book" });

    res.json({ message: "Book added successfully" });
  });
};

// GET SINGLE BOOK
exports.getSingleBook = (req, res) => {
  const id = req.params.id;

  db.query("SELECT * FROM books WHERE id = ?", [id], (err, result) => {
    if (err || result.length === 0)
      return res.json({ message: "Book not found" });

    res.json(result[0]);
  });
};

// UPDATE BOOK
exports.updateBook = (req, res) => {
  const id = req.params.id;
  const { title } = req.body;

  db.query(
    "UPDATE books SET title = ? WHERE id = ?",
    [title, id],
    (err) => {
      if (err) return res.json({ message: "Error updating book" });

      res.json({ message: "Book updated successfully" });
    }
  );
};

// DELETE BOOK
exports.deleteBook = (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM books WHERE id = ?", [id], (err) => {
    if (err) return res.json({ message: "Error deleting book" });

    res.json({ message: "Book deleted successfully" });
  });
};