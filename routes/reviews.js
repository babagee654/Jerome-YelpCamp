const express = require("express");
// Merge params in middleware, with router params.
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground.js');
const Review = require('../models/review.js');
const {isLoggedIn, validateReview, isReviewAuthor} = require('../middleware');
const ReviewControl = require('../controllers/reviewsController')

// REVIEW ROUTES
router.post('/', isLoggedIn, validateReview, catchAsync(ReviewControl.postReview))

router.delete('/:review_id', isLoggedIn, isReviewAuthor, catchAsync(ReviewControl.deleteReview))

module.exports = router;