// import packages
const express = require('express')
// grab router portion
const router = express.Router()
// import schema
const Author = require('../models/author')
const Book = require('../models/book')

// All Authors route
router.get('/', async (req, res) => {
  // store search options
  let searchOptions = {}

  // check if a name was passed to the server
  if(req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try {
    // capture all authors
    const authors = await Author.find(searchOptions)

    // display the data to index
    res.render('authors/index', {
      authors: authors,
      searchOptions: req.query
    })
  } catch {
    // redirect to HOMEPAGE if error occurs
    res.redirect('/')
  }
})

// New Authors route
router.get('/new', (req, res) => {
  res.render('authors/new', { author: new Author() })
})

// Create Author route
router.post('/', async (req, res) => {
  const author = new Author({
    name: req.body.name
  })

  try {
    // populate the author after it's been added to the DB
    const newAuthor = await author.save()
    // reroute the user
    res.redirect(`authors/${author.id}`)
  } catch {
    res.render('authors/new', {
      author: author,
      errorMessage: 'Error creating Author'
    })
  }
})

// Find single Author
router.get('/:id', async (req, res) => {
  try{
    // capture author
    const author = await Author.findById(req.params.id)
    // capture books
    const books = await Book.find({ author: author.id }).limit(6).exec()
    // if every is good
    res.render('authors/show', {
      author: author,
      booksByAuthor: books
    })
  } catch {
    // failed capturing either
    res.redirect('/')
  }
})

// Edit an Author
router.get('/:id/edit', async (req, res) => {
  try
  {
    // find an author by the passed in :id
    const author = await Author.findById(req.params.id)
    res.render('authors/edit', { author: author })
  } catch {
    // redirect home on error
    res.redirect('/authors')
  }
})

// Update an Author
router.put('/:id', async (req, res) => {
  // create author temp
  let author
  try {
    // get existing author
    author = await Author.findById(req.params.id)
    // update author params
    author.name = req.body.name
    // add to the DB
    await author.save()
    // reroute the user
    res.redirect(`/authors/${author.id}`)
  } catch {
    // check author validity
    if(author == null) {
      // could not find author
      res.redirect('/')
    } else {
      // could not save to db
      res.render('authors/edit', {
        author: author,
        errorMessage: 'Error updating Author'
      })
    }
  }
})

// Delete an Author
router.delete('/:id', async (req, res) => {
   // create author temp
  let author
  try {
    // get existing author
    author = await Author.findById(req.params.id)
    // remove from the DB
    await author.remove()
    // reroute the user
    res.redirect('/authors')
  } catch {
    // check author validity
    if(author == null) {
      // could not find author
      res.redirect('/')
    } else {
      // could not remove from db
      res.redirect(`/authors/${author.id}`)
    }
  }
})

module.exports = router




















