// routes/scraperRouter.js
const express = require('express');
const { parseLink } = require('../../Controller/link/shinLink'); // Import the controller

const router = express.Router();

// Define the route to parse a link and fetch product data
router.post('/parse-link', parseLink);

module.exports = router;
