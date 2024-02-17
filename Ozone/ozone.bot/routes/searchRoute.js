const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

router.post('/searchUniversity', searchController.searchUniversity);
router.post('/searchWhatsapp', searchController.searchWhatsapp);

module.exports = router;
