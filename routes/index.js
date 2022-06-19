// import packages
const express = require('express')
// grab router portion
const router = express.Router()
// import schema
const Book = require('../models/book')

router.get('/', async (req, res) => {
  // create books varible
  let books
  try {
    books = await Book.find().sort({ createdAt: 'desc' }).limit(10).exec()
  } catch {
    books = []
  }
  res.render('index', { books: books })
})

module.exports = router
