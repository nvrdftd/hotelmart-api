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
        res.status(401).json({ isAuthenticated: false });
      }
    });

    router.post('/register', (req, res) => {
      let collection = db.collection('user');
      collection.findOne({ username: req.body.username })
        .then(user => {
          if(user) {
            res.sendStatus(400);
          } else {
            bcrypt.hash(req.body.password, 15)
              .then(hash => {
                collection.insertOne({
                  username: req.body.username,
                  password: hash,
                  firstname: req.body.firstname,
                  lastname: req.body.lastname,
                  home_address: req.body.home_address,
                  admin: false
                }).then(result => {
                  req.login(result.insertedId, (err) => {
                    if (err) {
                      console.log(err);
                    }
                    res.json({ isAuthenticated: true });
                  });
                })
                .catch(err => console.log(err));
              })
              .catch(err => console.log(err));
          }
        })
        .catch(err => console.log(err));
    });

    router.post('/cart/update', (req, res) => {
      if (req.isAuthenticated()) {
        let collection = db.collection('cart');
        collection.findOneAndUpdate(
          { user_id: req.user._id },
          { $set: { cart: req.body.cart }},
          { upsert: true }
        ).then(r => res.json({ opStatus: 'Items Successfully Added'}));
      } else {
        res.sendStatus(401);
      }
    });

    router.get('/cart/retrieve', (req, res) => {
      if (req.isAuthenticated()) {
        let collection = db.collection('cart');
        collection.findOne(
          { user_id: req.user._id },
          { _id: 0, cart: 1 }
        ).then(doc => res.json({ cart: doc.cart || [] }));
      } else {
        res.sendStatus(401);
      }
    });

    router.get('/logout', (req, res) => {
      req.logout();
      res.json({ isAuthenticated: false });
    });
  }).catch(err => console.log(err));

module.exports = router;
