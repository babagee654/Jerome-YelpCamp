const Campground = require('../models/campground.js');
const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mbxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mbxToken});

module.exports.index = async (req,res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index.ejs', {campgrounds})
}

module.exports.renderNewForm = (req,res) => {
    res.render('campgrounds/new.ejs');
}

module.exports.createCampground = async(req,res) => {
    // Get geoData
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    // req.body.campground b/c name="campground[title]"
    const newCamp = new Campground(req.body.campground);
    // Add geodata to campground
    newCamp.geometry = geoData.body.features[0].geometry;
    // Add user who created this campground
    newCamp.author = req.user._id
    //Add images
    newCamp.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    await newCamp.save();
    console.log(newCamp);
    // Call flash message for successful creation
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${newCamp._id}`)
}

module.exports.showCampground = async (req,res) => {
    const {id} = req.params
    const camp = await Campground.findById(id)
    .populate({
        path: 'reviews', populate: {path: 'author'}
    })
    .populate('author', 'username');
    // If can't find camp
    if(!camp){
        req.flash('error', "Sorry, unable to find that campground.");
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show.ejs', {camp})
}

module.exports.renderEditForm = async (req,res) => {
    const {id} = req.params
    const camp = await Campground.findById(id);
    // If can't find camp
    if(!camp){
        req.flash('error', "Sorry, unable to find that campground.");
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit.ejs', {camp})
}
module.exports.updateCampground = async(req,res) => {
    const {id} = req.params
    // ...req.body.campground - uses spread operator (...), unpack elements in array OR properties in an object
    const updates = {...req.body.campground}
    const updatedCamp = await Campground.findByIdAndUpdate(id, updates)
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}))
    updatedCamp.images.push( ...imgs );
    // Delete images from cloud and db
    if (req.body.deleteImages){
        for (let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await updatedCamp.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    }
    await updatedCamp.save()
    req.flash('success', 'Successfully updated the campground!');
    res.redirect(`/campgrounds/${updatedCamp._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const {id} = req.params
    const deletedCamp = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the campground!');
    res.redirect('/campgrounds')
}

