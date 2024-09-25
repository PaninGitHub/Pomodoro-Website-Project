require('dotenv').config()
const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cors = require('cors')
//Connects to database
const { connectToDb, getDb } = require('../mongodb/db')
//Schema for User
const User = require('../models/user-model')

//Lsitens to connectDb app
let db;

//Opens dbs
let db_config;
let db_user;


connectToDb((err) => {
    if(!err){
        db = getDb() //Returns database object
        db_config = db.collection('user_configs');
        db_user  = db.collection('user_database');
        console.log("Loaded databases")
    }
})

//Express
const app = express();
app.use(cors());

//Creates a cookie
passport.serializeUser((user, done) => {
  done(null, user.id);
})

//Finds cookie via id
passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user.id);
  }).catch(err => {
    console.log(`Error: Problem with deserializing user: ${err}`)
  });
})

//Is a middleware software
//The url is linked to the web application in Google API. 
passport.use(new GoogleStrategy({
    //Below tells us our google thingy
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/google/callback",
    passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, done) {
    //Find if there is a user with that specific token id
    db_user.findOne({googleId:profile.id})
    .then((currentUser) => {
        //If finds user
        if(currentUser)
        {
          console.log('user is', currentUser)
          done(null, currentUser)
        } 
        //If it doesn't find it, create a user with that id via Mongoose (look in ChatGPT)
        else 
        {
            //Creates a new user via Schema async
            new User({
              username: profile.displayName,
              googleId: profile.id,
              configId: "N/A"
              }).save().then((newUser) => {
              console.log('New user created!: ' + newUser)
              }).catch(err => {
                console.log(`Error: Problem with saving a new user (${googleId}) to database: ${err}`)
                done(null, currentUser)
              });
        }
        //Fetch document id and send it to the front end to load up MongoDB document (TODO)
    })
    .catch(err => {
      res.status(500).json({error: 'Could not load user document. Please report error.'})
  })
    //Does smth idk
    return done(null, profile)
  }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done){
    done(null, user);
})