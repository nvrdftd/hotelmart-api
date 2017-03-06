'use strict';

var express = require('express'),
    helmet = require('helmet'),
    bodyParser = require('body-parser'),
    app = express(),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    passport = require('passport'),
    ObjectID = require('mongodb').ObjectID,
    MongoClient = require('mongodb').MongoClient,
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt'),
    config = require('./config');

MongoClient.connect(config.mongodb)
  .then(db => {

    function cors(req, res, next) {
      res.set({
          'Access-Control-Allow-Origin': config.origin,
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
          'Access-Control-Allow-Credentials': 'true'
      });
      next();
    }

    app.use(cors);

    app.use(session({
      secret: 'hotelmart for premium customers',
      store: new MongoStore({ db: db }),
      resave: true,
      saveUninitialized: false
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy((username, password, done) => {
        db.collection('user').findOne({ username: username })
          .then(user => {
            if (!user) {
              return done(null, false);
            } else {
              bcrypt.compare(password, user.password)
                .then(res => {
                  if (!res) {
                    return done(null, false);
                  } else {
                    return done(null, user._id);
                  }
                })
                .catch(err => console.log(err));
            }
          })
          .catch(err => done(err));
    }));
    passport.serializeUser((_id, done) => done(null, _id));
    passport.deserializeUser((_id, done) => {
      db.collection('user')
        .findOne({ _id: ObjectID.createFromHexString(_id)})
        .then(_id => done(null, _id))
        .catch(err => done(err));
    });

    app.use(helmet());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(express.static('assets'));
    app.use('/categorylist', require('./routes/category'));
    app.use('/product', require('./routes/product'));
    app.use('/user', require('./routes/user'));
    app.use('/admin', require('./routes/admin'));

    app.listen(config.port, function() {
      console.log(`Server running on port ${this.address().port}`);
    });
  })
  .catch(err => console.log(err));
