const express = require("express");
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require("../models/user.js");
const passport = require('passport')
const UserControl = require('../controllers/usersController')


// USER ROUTES
// FANCY ROUTING router.route() lets you group verbs with common paths
router.route('/register')
    .get(UserControl.renderRegister)
    .post(catchAsync(UserControl.register))

router.route('/login')
    .get(UserControl.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), UserControl.login)

router.get('/logout', UserControl.logout)

module.exports = router;