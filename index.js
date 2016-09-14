var fs = require('fs');

var express = require('express');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

var secret = require('./secret');

var app = express();

var database = {
};

app.use(express.static('public'));
app.use(passport.initialize());

var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID:  '689026946763-rtsrhg52nra9oai4tk7gb05fs8f1t43l.apps.googleusercontent.com',
    clientSecret: secret,
    callbackURL: "http://localhost:8080/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
      var user = database[accessToken] = {
        googleId: profile.id,
        accessToken: accessToken
    };
    return cb(null, user);
  }
));

passport.use(new BearerStrategy(
  function(token, done) {
      if (!(token in database)) {
          return done(null, false);
      }
      return done(null, database[token]);
  }
));

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', {failureRedirect: '/login', session: false}),
  function(req, res) {
    fs.readFile('public/logged-in.html', function(err, html) {
        html = html.toString();
        html = html.replace('<!--{script}-->', '<script>var AUTH_TOKEN="' + req.user.accessToken + '"; history.replaceState(null, null, "/logged-in.html");</script>');
        res.send(html);
    });
});

app.get('/restricted', passport.authenticate('bearer', {session: false}), function(req, res) {
    return res.send("You got me");
});

app.listen(8080);
