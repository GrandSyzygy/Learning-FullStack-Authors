// import packages
const mongoose = require('mongoose')
const Book = require('./book')

// create schema
const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})

// run before removal
authorSchema.pre('remove', function(next) {
  Book.find({ author: this.id }, (err, books) => {
    // error occurred
    if(err) {
      // pass error to next function
      next(err)
    } else if(books.length > 0) { // this author has books associated, so do not remove
      next(new Error('This author has books still'))
    } else {
      // it's safe to continue and remove the author
      next()
    }
  })
})

module.exports = mongoose.model('Author', authorSchema)
