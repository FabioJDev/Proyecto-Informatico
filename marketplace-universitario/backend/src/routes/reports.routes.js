const express = require('express');
const router = express.Router();

const reportsController = require('../controllers/reports.controller');
const { verifyJWT, requireRole } = require('../middlewares/auth.middleware');

router.use(verifyJWT);

// [ADMIN] Global metrics by month
router.get('/admin', requireRole('ADMIN'), reportsController.adminReport);

// [EMPRENDEDOR] Personal order summary
router.get('/entrepreneur', requireRole('EMPRENDEDOR'), reportsController.entrepreneurReport);

module.exports = router;
