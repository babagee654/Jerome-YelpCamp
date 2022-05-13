const Campground = require('./models/campground.js');
const Review = require('./models/review.js');
const {campgroundSchema, reviewSchema} = require('./schemas');
const ExpressError = require('./utils/ExpressError.js');

// req.isAuthenticate is created by passport. Use it to check if you are logged in.
module.exports.isLoggedIn = (req, res, next) => {
    // console.log("REQ.USER.....", req.user);
    if(!req.isAuthenticated()){
        // console.log(req.path, req.originalUrl);
        req.session.returnTo = req.originalUrl;
        req.flash('error', "You must be logged in!");
        return res.redirect('/login');
    }
    next();
}

module.exports.isAuthor = async function(req, res, next) {
    const {id} = req.params
    const camp = await Campground.findById(id);
    if (!camp.author.equals(req.user._id)){
        req.flash('error', "You don't have permission!");
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

module.exports.isReviewAuthor = async function(req, res, next) {
    const {id, review_id} = req.params
    const review = await Review.findById(review_id);
    console.log(review);
    if (!review.author.equals(req.user._id)){
        req.flash('error', "You don't have permission!");
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

// Turn validation into middleware
module.exports.validateCampground = (req, res, next) => {
    //Use Joi to validate schema, 2nd layer protection.
    const {error} = campgroundSchema.validate(req.body);
    //If error is found during Joi validation
    if (error){
        //Generate error message
        const msg = error.details.map(element => element.message).join(', ');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

// Validation middleware
module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if (error){
        const msg = error.details.map(element => element.message).join(', ');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}