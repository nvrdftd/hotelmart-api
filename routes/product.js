'use strict';

var express = require('express'),
    router = express.Router(),
    assert = require('assert'),
    MongoClient = require('mongodb').MongoClient,
    config = require('../config');

MongoClient.connect(config.mongodb)
  .then(db => {
    router.get('/recommended', (req, res) => {
      const query = {};
      db.collection('product')
        .find(query)
        .toArray()
        .then(arr => res.json({ items: arr }))
        .catch(err => console.log(err));
    });
  })
  .catch(err => console.log(err));

module.exports = router;
