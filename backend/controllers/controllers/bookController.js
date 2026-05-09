let books = [
  { id: 1, title: "Atomic Habits" }
];

// GET ALL BOOKS
exports.getBooks = (req, res) => {
  res.json(books);
};

// ADD BOOK
exports.addBook = (req, res) => {

  books.push(req.body);

  res.json({
    message: "Book Added",
    books
  });

};