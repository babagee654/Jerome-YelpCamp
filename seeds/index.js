const mongoose = require('mongoose');
//Require cities, seedHelpers, and Model
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// Take array and select random index
const seedHelpers = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    // Delete all entries in DB
    await Campground.deleteMany({})
    for (let i = 0; i < 200; i++) {
        // Choose a random city from 1000 choices
        const random1000 = Math.floor(Math.random() * 1000);
        // Generate random price
        const campPrice = Math.floor(Math.random() * 170 + 30);
        const camp = new Campground({
            // Creating temporary author. Must make your own user first
            author: '627d5063e5474e1d9c24a560',
            // Don't use seedHelpers() here b/c you want same array index for city+state.
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            // Add geometry
            geometry: {
                type: "Point",
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            // Populate title using seedHelpers
            title: `${seedHelpers(descriptors)} ${seedHelpers(places)}`,
            // Add random images for seed
            images: [
                {
                    url: 'https://res.cloudinary.com/dccfkro1g/image/upload/v1652446907/YelpCamp/photo-1537225228614-56cc3556d7ed_hidsa1.jpg',
                    filename: 'YelpCamp/photo-1537225228614-56cc3556d7ed_hidsa1',
                }
            ],
            // Placeholder description
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            price: campPrice
        })
        await camp.save();
    }

}

seedDB().then(() => {
    // Close connection when done populating
    mongoose.connection.close();
})