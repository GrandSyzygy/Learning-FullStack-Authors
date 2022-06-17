// import packages
const express = require('express')
// grab router portion
const router = express.Router()
// import schema
const Author = require('../models/author')

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
    //res.redirect(`authors/${newAuthor.id}`)
    res.redirect(`authors`)
  } catch {
    res.render('authors/new', {
      author: author,
      errorMessage: 'Error creating Author'
    })
  }
})

module.exports = router
