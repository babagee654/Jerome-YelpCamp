const Campground = require('../models/campground.js');
const Review = require('../models/review.js');

module.exports.postReview = async(req,res) => {
    const {id} = req.params;
    const camp = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    req.flash('success', 'Successfully posted your review!');
    res.redirect(`/campgrounds/${camp._id}`)
}

module.exports.deleteReview = async (req, res) => {
    // res.send("DELETING!!!")
    const {id, review_id} = req.params;
    // Delete review from Campground and Review collections
    const camp = await Campground.findByIdAndUpdate(id, {$pull: {reviews: review_id}});
    const review =  await Review.findByIdAndDelete(review_id);
    req.flash('success', 'Successfully deleted the review!');
    res.redirect(`/campgrounds/${id}`)
}