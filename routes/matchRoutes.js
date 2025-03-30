const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const matchController = require('../controllers/matchController');

router.get('/', auth.authenticate, matchController.getMatches);
router.get('/:matchId/messages', auth.authenticate, matchController.getMatchMessages);

module.exports = router;