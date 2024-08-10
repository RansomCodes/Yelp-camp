if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();

const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const ExpressError = require('./utils/ExpressError');
const campgroundRoutes = require('./routes/campground');
const reviewsRoutes = require('./routes/reviews');
const User = require('./models/user');
const userRoutes = require('./routes/users');
const { register } = require('module');

const DB_URL = process.env.DB_URL;

mongoose.connect(DB_URL)
    .then(()=>{
        console.log("MONGO CONNECTION OPEN");
    })
    .catch(err=>{
        console.log("MONGO ERROR:",err);
    })

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});

app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const store = MongoStore.create({
    mongoUrl: DB_URL,
    touchAfter: 24 * 60 * 60, //seconds
    crypto: {
        secret: 'thisshouldbeabettersecret'
    }
});

store.on('error', (e) => {
    console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
    store,
    name: 'session',
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({ contentSecurityPolicy: false }));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/"
];

const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
    "https://cdn.maptiler.com/maptiler-sdk-js/v2.0.3/maptiler-sdk.css",
];

const connectSrcUrls = [
    "https://api.maptiler.com/"
];

const fontSrcUrls = [];
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
                "https://res.cloudinary.com/dwhczlwpx/",
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);

app.get('/', (req, res) => {
    res.render('home');
});

app.all('*', (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = "Oh No, Something went wrong!";
    res.status(status).render('error', { err });
});

app.listen(3000, () => {
    console.log("listening at 3000");
});
