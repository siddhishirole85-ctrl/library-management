const express = require("express");
const router = express.Router();

const {
  getBooks,
  addBook,
  updateBook,
  deleteBook,
  getSingleBook
} = require("../controllers/bookController");

// GET ALL BOOKS
router.get("/", getBooks);

// GET SINGLE BOOK
router.get("/:id", getSingleBook);

// ADD BOOK
router.post("/", addBook);

// UPDATE BOOK
router.put("/:id", updateBook);

// DELETE BOOK
router.delete("/:id", deleteBook);

module.exports = router;
