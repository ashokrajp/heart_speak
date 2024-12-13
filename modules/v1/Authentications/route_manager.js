const express = require('express');

const router = express.Router();

const middleware = require('../../../middleware/headerValidators');

const authRoutes = require('./routes/auth_routes');

const serviceRoute = require('./routes/service_route')

// router.use('/', middleware.decryption);

// router.use('/', middleware.validateHeaderApiKey);

// router.use('/', middleware.validateHeaderToken);

router.use(authRoutes);

router.use(serviceRoute)

module.exports = router;