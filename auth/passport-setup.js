require('dotenv').config()
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20')
const User = require('../models/user-model')
const crypto = require('crypto');
const { deserialize } = require('v8');


passport.serializeUser((user, done) => {
    console.log('serialized user')
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        console.log('deserialized user')
        done(null, user);
    })
});



passport.use(
    new GoogleStrategy({
        // Options for the google strat
        callbackURL: '/auth/google/redirect',
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }, (accessToken, refreshToken, profile, done) => {
        // Passport callback function
        console.log('passport callback function fired');
        //Check if user already exists in our db
        User.findOne({googleId: profile.id}).then((currentUser) => {
            if(currentUser){
                // already have the user
                console.log('user is: ', currentUser)
                done(null, currentUser)
            } else {
                //otherwise, Mmkes new user
                let temp_id = crypto.randomBytes(8).toString("hex");
                new User({
                    username: profile.displayName,
                    googleId: profile.id, 
                    configId: temp_id
                }).save().then((newUser) => {
                    console.log('new user crated: ' + newUser);
                    done(null, newUser);
                });
            }
        })

    })
)