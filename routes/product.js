'use strict';

var express = require('express'),
    router = express.Router(),
    MongoClient = require('mongodb').MongoClient,
    config = require('../config');

MongoClient.connect(config.mongodb)
  .then(db => {
    let collection = db.collection('product');

    router.get('/recommended', (req, res) => {
      const query = {};
      collection.find(query)
        .toArray()
        .then(arr => res.json({ items: arr }))
        .catch(err => console.log(err));
    });

    router.post('/search', (req, res) => {
      let query = {};
      if (req.body.text) {
        query = { $text: { $search: req.body.text }};
      } else if (req.body.category) {
        query = { category: req.body.category };
      }
      collection.find(query)
        .toArray()
        .then(arr => res.json({ items: arr }))
        .catch(err => console.log(err));
    });
  })
  .catch(err => console.log(err));

module.exports = router;
