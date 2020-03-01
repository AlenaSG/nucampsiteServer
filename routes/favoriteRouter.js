const express = require('express');
const bodyParser = require('body-parser');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({user: req.user._id})
    .populate('user')
    .populate('campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if(!favorite) {
            Favorite.create({user: req.user._id, campsites: req.body})
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        } else {
            req.body.forEach(fav => {
                if(!favorite.campsites.includes(fav._id)){
                    favorite.campsites.push(fav._id); 
                } else {
                    console.log(`The campsite with id:${fav._id} is already on the list of favorites.`);
                }
            })
            favorite.save()
            .then(favorite => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
            })
        .catch(err => next(err));
        }
    })
.catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favorites.');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.remove({user: req.user._id})
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

//campsiteId
favoriteRouter.route('/:campsiteId') 
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`GET operation is not supported on /favorites/${req.params.campsiteId}.`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if(!favorite) {
            Favorite.create({user: req.user._id, campsites: [req.params.campsiteId]})
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        } else {
            if(!favorite.campsites.includes(req.params.campsiteId)) {
                favorite.campsites.push(req.params.campsiteId); 
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('This campsite is already a favorite.');
            }
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation is not supported on /favorites/${req.params.campsiteId}.`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if(favorite && favorite.campsites) {
            const i = favorite.campsites.indexOf(req.params.campsiteId);
            if(i >= 0) {
                favorite.campsites.splice(i, 1);
                console.log(`Campsite ${req.params.campsiteId} was deleted from favorites.`);
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            }
        } else {
            console.log("No favorite array.");
            err = new Error(`The user does not have any favorites.`);
            err.status = 404;
            return next(err);
        }
     })
     .catch(err => next(err));
});

module.exports = favoriteRouter;
