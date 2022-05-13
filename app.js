// process.env.NODE_ENV is an environment variable for development/production
// If we're running in development mode: require('dotenv')
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

//Express Mongoose setup
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
// Import method-override for PUT & DELETE
const methodOverride = require('method-override');
// Require ejs-mate
const ejsMate = require('ejs-mate');
// Import ExpressError
const ExpressError = require('./utils/ExpressError');
// Require Routes
const campgroundsRoute = require('./routes/campgrounds.js');
const reviewsRoute = require('./routes/reviews.js');
const usersRoute = require('./routes/users.js')
// Require Session + Flash
const session = require('express-session');
const flash = require('connect-flash');
// Require Passport & User model
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
// Require MongoSanitize + Helmet for Security!
const ExpressMongoSanitize = require('express-mongo-sanitize');
// const helmet = require('helmet');
const helmet = require("helmet");

const MongoDBStore = require('connect-mongo');

// Test mongodb cloud server
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

// Connect to db
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    //useCreateIndex: true, ***no longer supported.
    useUnifiedTopology: true
});

//Check if error connecting to db
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected.");
})

// Set EJS engine as ejsMate instead of default
app.engine('ejs', ejsMate);
// Set path to views, and view engine to "ejs"
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"));

// Setup reading form submits, static, and overriding form method
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Contain static assets (imgs, css, js) in public folder.
app.use(express.static(path.join(__dirname, 'public')))

// Initiate express-mongo-sanitize
app.use(ExpressMongoSanitize())

// Helmet configurations
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];

// Use and configure helmet
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dccfkro1g/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const secret = process.env.SECRET || "JeromeCamp";

// Define session and flash middleware (NOTE: setup before routes)
const sessionConfig = {
    // Save session cookie in DB
    store: MongoDBStore.create({
        mongoUrl: dbUrl,
    }),
    name: 'sesh!',
    secret,
    resave: false,
    saveUninitialized: true,
    // Setup cookie options
    cookie: {
        // Set expiration date (ms): sec, min, hr, day, week
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        // Security reason: Cookie can't be accessed through client-side script. Cannot reveal cookie to third-party
        httpOnly: true,
        // For deployment enable secure: true so cookies only run on HTTPS
        // secure: true,
    }
}
app.use(session(sessionConfig));

// Use flash to enable req.flash
app.use(flash());

// Enable passport
app.use(passport.initialize());
// Allow persistent login sessions
app.use(passport.session())
// Passport should use our local strategy. Model.authenticate() static method is defined by passportLocalMongoose
passport.use(new LocalStrategy(User.authenticate()));
// Tell passport how to serialize a user (how to store the user in a session). Model.(de)serializeUser() defined by passportLocalMongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Define locals for flash, and login check
app.use((req, res, next) => {
    console.log(req.query);
    res.locals.successMsg = req.flash('success');
    res.locals.errorMsg = req.flash('error');
    // Must be after passport to enable req.user.
    res.locals.currentUser = req.user;
    next();
})

// Setup routes
app.use("/campgrounds", campgroundsRoute)
// Need to set option {mergeParams: true} in Reviews Router to access :id param
app.use("/campgrounds/:id/reviews", reviewsRoute)
app.use("/", usersRoute)

// Homepage
app.get('/', (req, res) => {
    res.render('home.ejs')
})

// For every unknown page request
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found!', 404))
})

// Set up error handler
app.use((err, req, res, next) => {
    //Set default status and message
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong!';
    res.status(statusCode).render('error.ejs', { err });
})

const port = process.env.PORT || 3000;
//Listen on localhost:3000
app.listen(port, () => {
    console.log("Listening to port 3000");
})
