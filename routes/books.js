// import packages
//const multer = require('multer')
const express = require('express')
// grab router portion
const router = express.Router()
// import schema
const Book = require('../models/book')
const Author = require('../models/author')

// mime types
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

// All Books route
router.get('/', async (req, res) => {
  // create the query object
  let query = Book.find()

  // title filter
  if(req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }

  // pub. before filter
  if(req.query.publishedBefore != null && req.query.publishedBefore != '') {
    query = query.lte('publishDate', query.publishedBefore)
  }

  // pub. after filter
  if(req.query.publishedAfter != null && req.query.publishedAfter != '') {
    query = query.gte('publishDate', query.publishedAfter)
  }
  
  try {
    // capture all books
    const books = await query.exec()
    res.render('books/index', {
      books: books,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// New Book route
router.get('/new', async (req, res) => {
  renderNewPage(res, new Book())
})

// Create Book route
router.post('/', async (req, res) => {
  // create new book
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description
  })

  // add book file into the model
  saveCover(book, req.body.cover)

  try {
    // save to db
    const newBook = await book.save()
    // res.redirect(`books/${newBook.id}`)
    res.redirect(`books`)
  } catch {
    renderNewPage(res, book, true)
  }
})

async function renderNewPage(res, book, hasError = false) {
  try {
    // get all Authors
    const authors = await Author.find({})
    // config params being sent to server
    const params = {
      authors: authors,
      book: book
    }
    if(hasError) params.errorMessage = 'Error creating Book'
    // successful
    res.render('books/new', params)
  } catch {
    // redirect on error
    res.redirect('/books')
  }
}

function saveCover(book, coverEncoded) {
  if(coverEncoded == null) return

  // parse the cover
  const cover = JSON.parse(coverEncoded)

  // check if parse info is valid and the file type is correct 
  if(cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, 'base64')
    book.coverImageType = cover.type
  }
}

module.exports = router
