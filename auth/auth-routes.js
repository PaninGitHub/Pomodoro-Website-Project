require('dotenv').config()
const router = require('express').Router();
const passport = require('passport');

//Auth Login
router.get('/', (req, res) => {
    
});

//Auth Logout
router.get('/logout', (req, res) => {
    //Handle with Passport
    res.send('logging out')
});

//Auth with Google
router.get('/google', passport.authenticate('google', {
    scope:['profile']
}));

//Callback route for google to redirect to
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    res.redirect('/profile')
});

module.exports = router;