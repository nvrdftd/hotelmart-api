'use strict';

var express = require('express'),
    router = express.Router(),
    MongoClient = require('mongodb').MongoClient,
    passport = require('passport'),
    bcrypt = require('bcrypt'),
    config = require('../config'),
    assert = require('assert');

MongoClient.connect(config.mongodb)
  .then(db => {
    router.post('/login', passport.authenticate('local'), (req, res) => {
      res.json({ isAuthenticated: true });
    });

    router.get('/session', (req, res) => {
      if (req.isAuthenticated()) {
        res.json({ isAuthenticated: true });
      } else {
        res.json({ isAuthenticated: false });
      }
    });

    router.post('/register', (req, res) => {
      db.collection('user').findOne({ username: req.body.username })
        .then(user => {
          if(user) {
            res.json({ err: 'Try another username.'})
          } else {
            bcrypt.hash(req.body.password, 15)
              .then(hash => {
                db.collection('user').insertOne({
                  username: req.body.username,
                  password: hash,
                  admin: false
                }).then(result => {
                  res.json({ isAuthenticated: true });
                })
                .catch(err => console.log(err));
              })
              .catch(err => console.log(err));
          }
        })
        .catch(err => console.log(err));
    });

    router.post('/cart/add', (req, res) => {
      if (req.isAuthenticated()) {
        db.collection('cart')
          .findOneAndUpdate({user_id: req.user._id},
            {$set: {user_id: req.user._id, items: req.body}}, {upsert: true})
          .then(r => res.json({ operationStatus: 'Items Successfully Added'}));
      } else {
        res.json({ operationStatus: 'Need to Login'})
      }
    });

    router.get('/logout', (req, res) => {
      req.logout();
      res.json({ isAuthenticated: false });
    });
  })
  .catch(err => console.log(err));

module.exports = router;
