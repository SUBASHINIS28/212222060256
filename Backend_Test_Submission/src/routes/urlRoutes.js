const express = require('express');
const UrlController = require('../controllers/UrlController');

const router = express.Router();
const urlController = new UrlController();

router.post('/shorturls', async (req, res) => {
  await urlController.createShortUrl(req, res);
});

router.get('/shorturls/:shortcode', async (req, res) => {
  await urlController.getStatistics(req, res);
});

router.get('/:shortcode', async (req, res) => {
  await urlController.redirectToOriginal(req, res);
});

module.exports = router;