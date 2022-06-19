// import packages
const multer = require('multer')
const express = require('express')
const path = require('path')
const fs = require('fs')
// grab router portion
const router = express.Router()
// import schema
const Book = require('../models/book')
const Author = require('../models/author')
// mime types
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
// config uploadPath
const uploadPath = path.join('public', Book.coverImageBasePath)
// config multer
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype))
  }
})

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
router.post('/', upload.single('cover'), async (req, res) => {
  // check for submitted file's validity
  const fileName = req.file != null ? req.file.filename : null

  // create new book
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    coverImageName: fileName,
    description: req.body.description
  })

  try {
    // save to db
    const newBook = await book.save()
    // res.redirect(`books/${newBook.id}`)
    res.redirect(`books`)
  } catch {
    // remove any files added during error
    if(book.coverImageName != null)
      removeBookCover(book.coverImageName)

    renderNewPage(res, book, true)
  }
})

function removeBookCover(fileName) {
  // unlink the file from the project
  fs.unlink(path.join(uploadPath, fileName), err => {
    if(err) console.error(err)
  })
}

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

module.exports = router




















