const express = require('express');
const router = express.Router();
const {
	getGithubData,
	savePortfolioDraft,
	savePortfolio,
	getPortfolioByUsername,
	trackProjectClick,
	trackModalEvent,
	getPortfolioAnalytics,
	getDomainStatus,
	triggerDeploy,
	getPortfolioOgImage,
	getShareMetadata
} = require('../controllers/portfolioController');

router.get('/data', getGithubData); // Rute privat (butuh token)
router.post('/save-draft', savePortfolioDraft);
router.post('/save', savePortfolio); // Rute privat (butuh token)
router.post('/:username/click', trackProjectClick);
router.post('/:username/modal-event', trackModalEvent);
router.get('/:username/analytics', getPortfolioAnalytics);
router.get('/:username/domain-status', getDomainStatus);
router.post('/:username/deploy', triggerDeploy);
router.get('/:username/og.svg', getPortfolioOgImage);
router.get('/:username/share', getShareMetadata);

// Rute PUBLIK: Menggunakan parameter dinamis :username
router.get('/:username', getPortfolioByUsername); 

module.exports = router;