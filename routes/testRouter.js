
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
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
            if(!favorite.includes(req.params.campsiteId)) {
                favorite.campsites.push(req.params.campsiteId); 
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                )} 
                .catch(err => next(err));

    } else {
        err = new Error(`Campsite ${req.params.campsiteId} is already in the favorites list.`);
        err.status = 404;
        return next(err);
    } 
})

})
.catch(err => next(err));
})
