const express = require('express');
const bodyParser = require('body-parser');
const Favourites = require('../models/favourite');
const cors =require('./cors');
var authenticate =require('../authenticate');
const Dishes = require('../models/dishes');

const favouriteRouter =express.Router();

favouriteRouter.use(bodyParser.json());
favouriteRouter.route('/')
.options(cors.corsWithOptions,(req, res) => { res.sendStatus(200); })
.get(cors.cors ,authenticate.verifyUser,(req,res,next)=>{
    Favourites.findOne({})
    .populate('user')
    .populate('dishes')
    .then((favourites)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favourites);
    },(err)=> next(err))
    .catch((err)=>next(err));
})
.post(cors.cors ,authenticate.verifyUser,(req,res , next)=>{
    Favourites.findOne({})
    .then((fav)=>{
    if(fav!=null){
        req.body.forEach(element => {
            console.log(element.id);
            fav.dishes.push(element.id);
            fav.save();
        });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(fav);
    }else{
        Favourites.create({user:req.user._id})
        .then((fav)=>{
            req.body.forEach(element => {
                console.log(element.id);
                fav.dishes.push(element.id);
                fav.save();
            });
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(fav);
        },(err)=>next(err))
        .catch((err)=>next(err))    
    }
    })
    .catch((err)=>next(err));
})
.put(cors.cors ,(req,res,next)=>{
    res.statusCode = 403;
    res.end('PUT operation not supported on /favourites');
})
.delete(cors.cors,authenticate.verifyUser, (req ,res, next)=>{
    Favourites.remove({})
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
});


favouriteRouter.route('/:dishId')
.options(cors.corsWithOptions,authenticate.verifyUser,(req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next)=>{
    res.statusCode = 403;
    res.end('PUT operation not supported on /favourites');
})
.post(cors.cors,authenticate.verifyUser,(req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        Favourites.findOne({})
        .then((fav)=>{
            console.log(fav);
            if(fav!= null){
                console.log(fav.dishes);
                fav.dishes.push(req.params.dishId);
                fav.save();
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fav);
            }else{
                Favourites.create({user:req.user._id, dishes: dish._id})
                .then((favourite)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourite);
                },(err)=>next(err))
                .catch((err)=>next(err))
            }
        },(err)=>next(err))
    .catch((err)=>next(err));
    })
})
.put(cors.cors,(req,res,next)=>{
    res.statusCode = 403;
    res.end('PUT operation not supported on /favourites');
})
.delete(cors.cors,authenticate.verifyUser,(req,res,next)=>{
    Favourites.findOne({})
    .then((fav)=>{
        var index= fav.dishes.indexOf(req.params.dishId)
        fav.dishes.splice(index,1);
        fav.save();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(fav);
    },(err)=>next(err))
    .catch((err)=>next(err));
});

module.exports =favouriteRouter;
