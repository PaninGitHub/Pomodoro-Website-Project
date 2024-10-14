require('dotenv').config()
require('./auth')
const cors = require('cors')
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const logger = require('morgan');
const session = require('express-session')
const MongoStore = require('connect-mongo')
const path = require('path')

//Idk but it might mess with google aut

//Initializes App
const app = express();

//Disabled because I guess this interferences with the user cookies???
//app.use(session({ secret: process.env.APP_SECRET, resave: false, saveUninitialized: true}));
app.use(express.json())
app.use(cors());

//Initalizes Passport
app.use(session({
    secret: process.env.ACCESS_TOKEN_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DB_FULL_URL,
        touchAfter: 24 * 3600 //Time period in seconds
    })
}))
app.use(passport.initialize());
app.use(passport.session());

//middleware function
//checks if the request has a user (if yes, next(). if no, send 401)
//connect.sid is the session id
function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}

//connect to mongodb through mongoose
mongoose.connect(process.env.DB_FULL_URL)
.then(() => console.log('Mongoose connected on index.js'))
.catch(err => console.error(`MongoDB connection error: ${err}`));

//Maintains state idk
app.use(express.static(path.join(__dirname, '..')))
app.use(passport.authenticate('session'));

//Creates a cookie
passport.serializeUser((user, done) => {
    console.log("Serialized User ", user._id)
    process.nextTick(function() {
      done(null, user); //Gets user id and converts the ObjectId to a string ._id.toString()
    });
  })
  
  //Finds cookie via id
  passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
      done(null, user);
    }).catch(err => {
      console.log(`Error: Problem with deserializing user: ${err}`)
    });
  })


app.get('/posts', (req, res) => {
    res.json(posts)
})

app.post('/login', (req, res) => {
    // Authenticate User
    const username = req.body.username
    const user = { name: username }
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    res.json({ accessToken: accessToken})
})

//Routing for Google OAuth2.0
app.get('/', (req, res) => {
    res.send('<a href="/auth/google">Authenticate with Google</a>')
});

//
app.get('/auth/google',
    //Scope -> It's like discord scope. It allows you to access specific infomation about th e Google user
    passport.authenticate('google', { scope: ['email', 'profile']})
)

//the url is linked to the web application in Google API. 
app.get('/google/callback',
    passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/auth/google/failure'
    })
)

app.get('/auth/google/failure', (req, res) => {
    res.send('something went wrong..')
})

//Login and Logout

//Runs when user is logged in
app.get('/protected', isLoggedIn, (req, res) => {
    res.send(`Hello ${req.user}`);
})

app.get('/logout', (req, res) => {
    req.logout(err => {
        console.log(err);
    });
    req.session.destroy();
    res.send('Goodbye!');
})

//

//Listens to the route
app.listen(5000, () => console.log('listening on: 5000'));