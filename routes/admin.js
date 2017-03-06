'use strict';

var express = require('express'),
    router = express.Router(),
    MongoClient = require('mongodb').MongoClient,
    fileUploader = require('express-fileupload'),
    path = require('path'),
    config = require('../config');

MongoClient.connect(config.mongodb)
  .then(db => {

    router.use(fileUploader());

    router.get('/', (req, res) => {
      if (req.isAuthenticated()) {
        db.collection('user')
          .findOne({ _id: ObjectID.createFromHexString(req.user._id), admin: true })
          .then(user => res.json({ isAuthenticated: true, admin: true }))
          .catch(err => res.sendStatus(401));
      } else {
        res.sendStatus(401);
      }
    });

    router.get('/search', (req, res) => {
      const query = { category: req.body.category, name: req.body.text };
      collection.find(query)
        .toArray()
        .then(arr => res.json({ items: arr }))
        .catch(err => console.log(err));
    });

    router.post('/:method', (req, res) => {
      const method = req.params.method;
      let collection = db.collection('product');
      if (method == 'add') {
        collection.insert(req.body)
          .then(r => res.json({ msg: 'The product has been updated.' }))
          .catch(err => res.status(404).json({ msg: 'Can\'t find the product.' }));
      } else if (method == 'update') {
        collection.findOneAndUpdate({ _id: req.body._id }, req.body)
          .then(r => res.json({ msg: 'The product has been updated.' }))
          .catch(err => res.status(404).json({ msg: 'Can\'t find the product.' }));
      } else if (method == 'delete') {
        collection.remove({ _id: req.body._id })
          .then(r => res.json({ msg: 'The product has been deleted.' }))
          .catch(err => res.status(404).json({ msg: 'Can\'t find the product.' }));
      } else if (method == 'upload') {
        if (!req.files) {
          res.status(400).json({ msg: 'Something wrong with your file.' });
        } else {
          let img = req.files.img;
          img.mv(path.join('..', '/assets/img/', img.name), err => {
            if (err) {
              res.status(500).json({ msg: 'We\'ve encountered some internal issue. Please try again.' })
            } else {
              res.json({ msg: 'File uploaded successfully!' })
            }
          });
        }
      }
    });
  })
  .catch(err => console.log(err));

module.exports = router;
