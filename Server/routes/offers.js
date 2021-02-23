const errors = require('restify-errors');
const Offer = require('../models/Offer');
const resMaker = require('../utils/response');

async function createOffer(req, res, next){
    try {
        const offer = await Offer.query().insert(req.body);
        res.send(resMaker.success({ offer }));
        next();
    } catch (error) {
        console.error(error)
        return next(new errors.InternalError('Error: 141'));
    }
}

async function updateOffer(req, res, next){
    try {
        await Offer.query().update(req.body).where('id', req.params.id);
        res.send(resMaker.success());
        next();
    } catch (error) {
        console.error(error)
        return next(new errors.InternalError('Error: 142'));
    }
}

async function deleteOffer(req, res, next){
    try {
        await Offer.query().delete().where('id', req.params.id);
        res.send(resMaker.success());
        next();
    } catch (error) {
        console.error(error)
        return next(new errors.InternalError('Error: 143'));
    }
}

module.exports = { createOffer, updateOffer, deleteOffer };