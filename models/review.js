//Create mongoose schema for reviews
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    text: String,
    rating: {
        type: Number,
        required: true
    }
});

const Review = mongoose.model("Review", reviewSchema);

//Export to use in app.js
module.exports = Review;