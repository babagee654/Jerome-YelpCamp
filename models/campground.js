//Create mongoose schema for campgrounds
const { date, number } = require('joi');
const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } };

// https://res.cloudinary.com/dccfkro1g/image/upload/w_300/v1652397263/YelpCamp/ld1aag8emp7mmaqcv6m3.jpg
const ImageSchema = new Schema({
    url: String,
    filename: String
})

// Everytime we call thumbnail, change width to 200px
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})



const campgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    //Create relationship with reviews
    reviews: [
        {
            // Save review ObjectID
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, opts)

// Everytime we call thumbnail, change width to 200px
campgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <h5><a style="color: black; text-decoration: none;" href="/campgrounds/${this._id}">${this.title}</a></h5>
    <p>${this.description.substring(0, 20)}...</p>
    `
});

// Delete reviews after campground has been deleted
campgroundSchema.post('findOneAndDelete', async function (camp) {
    // console.log(camp);
    if (camp) {
        await Review.deleteMany({
            _id: {
                $in: camp.reviews
            }
        })
    }
})

const Campground = mongoose.model('Campground', campgroundSchema)


//Export to use in app.js
module.exports = Campground;