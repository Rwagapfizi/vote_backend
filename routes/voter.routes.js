const express = require('express');
const cookieParser = require('cookie-parser');
const app = express()
const router = express.Router();
app.use(cookieParser())
// const authenticateUser = require('../middlewares/authenticateUser');
const { authenticateUser } = require('../middlewares/authenticateUser');
const {
    registerVoter,
    loginVoter,
    voteForCandidate,
    logout,
    getVoterData
} = require('../controllers/voter.controller');

router.post('/api/voter/register', registerVoter);
router.post('/api/voter/login', loginVoter);
// Protected route
router.get('/voter/data', authenticateUser, getVoterData);
router.post('/api/vote', voteForCandidate);
router.post('/api/voter/logout', logout);
module.exports = router;