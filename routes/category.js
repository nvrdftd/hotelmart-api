'use strict';

var express = require('express'),
    router = express.Router(),
    assert = require('assert'),
    MongoClient = require('mongodb').MongoClient,
    config = require('../config');

MongoClient.connect(config.mongodb)
  .then(db => {
    router.get('/', (req, res) => {
      db.collection('category').find({})
        .toArray()
        .then(arr => {
          res.json(arr);
        })
        .catch(err => console.log(err));
    });
  })
  .catch(err => console.log(err));

module.exports = router;
