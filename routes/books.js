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
    res.redirect(`books/${newBook.id}`)
  } catch {
    renderNewPage(res, book, true)
  }
})

// show book info
router.get('/:id', async (req, res) => {
  try {
    // capture our book, with author info populated
    const book = await Book.findById(req.params.id)
                           .populate('author')
                           .exec()
    // go to show page with book passed in
    res.render('books/show', { book: book })
  } catch {
    // go home due to error
    res.redirect('/')
  }
})

// Edit Book route
router.get('/:id/edit', async (req, res) => {
  try {
    // capture the book
    const book = await Book.findById(req.params.id)
    renderEditPage(res, book)
  } catch {
    res.redirect('/')
  }
})

// Update Book route
router.put('/:id', async (req, res) => {
  // create temp book
  let book

  try {
    book = await Book.findById(req.params.id)
    // update params
    book.title = req.body.title
    book.author = req.body.author
    book.publishDate = new Date(req.body.publishDate)
    book.pageCount = req.body.pageCount
    book.description = req.body.description
    if(req.body.cover != null && req.body.cover !== '') {
      saveCover(book, req.body.cover)
    }
    // add to db
    await book.save()
    res.redirect(`/books/${book.id}`)
  } catch {
    // check if book is valid
    if(book != null) {
      renderEditPage(res, book, true)
    } else {
      res.redirect('/')
    }
  }
})

// delete book page
router.delete('/:id', async (req, res) => {
  // create book temp
  let book
  try {
    // capture the book
    book = await Book.findById(req.params.id)
    // remove from db
    await book.remove()
    // on success
    res.redirect('/books')
  } catch {
    // check book validity
    if(book != null) {
      res.render('books/show', {
        book: book,
        errorMessage: 'Could not remove book'
      })
    } else {
      // could not find a book
      res.redirect('/')
    }
  }
})

async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, 'new')
}

async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError = false) {
  try {
    // get all Authors
    const authors = await Author.find({})
    // config params being sent to server
    const params = {
      authors: authors,
      book: book
    }
    if(hasError) {
      if(form === 'edit') {
        params.errorMessage = 'Error Updating Book'
      } else {
        params.errorMessage = 'Error Creating Book'
      }
    }
    // successful
    res.render(`books/${form}`, params)
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
