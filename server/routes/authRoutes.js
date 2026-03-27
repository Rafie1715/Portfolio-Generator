const express = require('express');
const router = express.Router();
const { loginWithGithub, githubCallback } = require('../controllers/authController');

// Endpoint: /api/auth/github
router.get('/github', loginWithGithub);

// Endpoint: /api/auth/github/callback
router.get('/github/callback', githubCallback);

module.exports = router;