const express = require("express");
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground.js');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');
const CampControl = require('../controllers/campgroundsControl');
const multer  = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({ storage });

// CAMPGROUND ROUTES

// FANCY ROUTING router.route() lets you group verbs with common paths
router.route('/')
    // Index of campgrounds, show all
    .get(catchAsync(CampControl.index))
    // Add new campground to DB through POST, upload images
    .post(isLoggedIn, upload.array('images'), validateCampground, catchAsync(CampControl.createCampground))


// Create new campground
router.get('/new', isLoggedIn, CampControl.renderNewForm)

router.route('/:id')
    // Show specific campground
    .get(catchAsync(CampControl.showCampground))
    // Update specific campground
    .put(isLoggedIn, isAuthor, upload.array('images'), validateCampground, catchAsync(CampControl.updateCampground))

    // Delete specific campground
    .delete(isLoggedIn, isAuthor, catchAsync(CampControl.deleteCampground))


// Edit specific campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(CampControl.renderEditForm))



module.exports = router;