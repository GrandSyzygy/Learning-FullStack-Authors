// import packages
const express = require('express')
// grab router portion
const router = express.Router()

router.get('/', (req, res) => {
  res.render('index')
})

module.exports = router
