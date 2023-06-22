const express = require('express');
const cookieParser = require('cookie-parser');
const app = express()
const router = express.Router();
app.use(cookieParser())
const {
    registerAdmin,
    loginAdmin,
    registerCandidate
} = require('../controllers/admin.controller');

router.post('/api/admin/register', registerAdmin);
router.post('/api/admin/login', loginAdmin);
router.post('/api/registerCandidate', registerCandidate);
module.exports = router;