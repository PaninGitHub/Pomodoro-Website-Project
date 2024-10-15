//https://www.youtube.com/watch?v=c_FRNFZENjw&list=PL4cUxeGkcC9jdm7QX143aMLAqyM-jTZ2x&index=4, tutorial 9
require('dotenv').config()
const cors = require('cors')

//Connects to database
const { connectToDb, getDb } = require('../mongodb/db')

//Gets Express
const express = require('express')
const authRoutes = require('./auth-routes')
const passportSteup = require('./passport-setup')
const mongoose = require('mongoose')
const cookieSession = require('cookie-session')
const passport = require('passport');

const app = express();

//set up cookie
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_SECRET]
}));

// Initalize passport 
app.use(passport.initialize());
app.use(passport.session());


//conect to mongo
mongoose.connect(process.env.DB_FULL_URL)
.then(() => console.log('connected to mongodb'))
.catch(err => console.error(`MongoDB connection error: ${err}`));


app.use('/auth', authRoutes);

app.listen(5000, () => {
    console.log('app now listening at port 5000')
})