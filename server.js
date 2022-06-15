// ///////////////////////////
// check our enviroment type
// ///////////////////////////
if(process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

// /////////////////
// import packages
// /////////////////
const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')

const indexRouter = require('./routes/index')

// ///////////////////////
// configure express app
// ///////////////////////
app.set('view engine', 'ejs')
// location of views
app.set('views', __dirname + '/views')
// location of layouts
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
// location of public files
app.use(express.static('public'))

// //////////////
// configure DB
// //////////////
const mongoose = require('mongoose')
// set up connection
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true })
// check connection
const db = mongoose.connection
// if we run into an error on connection
db.on('error', error => console.error(error))
// if initial connection was successful
db.once('open', () => console.log('Connected to Mongoose'))

// set up our router
app.use('/', indexRouter)

// ////////////////
// listen on PORT
// ////////////////
app.listen(process.env.PORT || 3000)
