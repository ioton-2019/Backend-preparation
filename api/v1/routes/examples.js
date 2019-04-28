/* globals requireWrapper */

const ExampleModel = requireWrapper('models/example/')
const express = require('express')
const exampleRouter = express.Router({ mergeParams: true })

exampleRouter.route('/')
  .get((req, res, next) => {
    ExampleModel.find({}, (err, items) => {
      if (!err) res.status(200).json(items)
      else {
        err.status = 400
        next(err)
      }
    })
  })
  .post((req, res, next) => {
    const survey = new ExampleModel(req.body)
    survey.save(err => {
      if (!err) res.status(201).json(survey)
      else {
        err.status = 400
        err.message += ` in fields: ${Object.getOwnPropertyNames(err.errors)}`
        next(err)
      }
    })
  })
  .put((req, res, next) => {
    res.status(405).json({ 'error': { 'message': 'Not Allowed! Put to URL without id', 'code': 405 } })
  })
  .patch((req, res, next) => {
    res.status(405).json({ 'error': { 'message': 'Not Allowed! Patch to URL without id', 'code': 405 } })
  })
  .delete((req, res, next) => {
    res.status(405).json({ 'error': { 'message': 'Not Allowed! Delete to URL without id', 'code': 405 } })
  })

exampleRouter.route('/:id')
  .get((req, res, next) => {
    ExampleModel.findOne({ _id: req.params.id }, (err, item) => {
      if (!err) res.status(200).json(item)
      else {
        err.status = 404
        err.message = `Could not find by this id: ${req.params.id}`
        next(err)
      }
    })
  })
  .post((req, res, next) => {
    res.status(405).json({ 'error': { 'message': 'Not Allowed! Post to URL with id', 'code': 405 } })
  })
  .delete((req, res, next) => {
    res.set('Content-Type', 'application/json')
    ExampleModel.findOneAndRemove({ _id: req.params.id }, (err, item) => {
      if (!err) res.status(204).end()
      else {
        err.status = 404
        err.message = `Could not find and delete by this id: ${req.params.id}`
        next(err)
      }
    })
  })
  .put((req, res, next) => {
    let err = {}
    if (req.params.id !== req.body._id) {
      err = {
        'status': 400,
        'message': 'Request id is not equal to object id'
      }
      next(err)
    } else {
      for (let key in ExampleModel.schema.paths) {
        if (!(key in req.body)) {
          if (ExampleModel.schema.paths[key].isRequired === true) {
            err = {
              'status': 400,
              'message': 'Request is missing the required field : ' + key + '.'
            }
          }
          if (ExampleModel.schema.paths[key].options.default !== undefined) {
            req.body[key] = ExampleModel.schema.paths[key].options.default
          }
        }
      }
      if (Object.keys(err).length !== 0) next(err)
      else {
        if (req.body.__v !== undefined) delete req.body.__v
        if (req.body._id !== undefined) delete req.body._id
        ExampleModel.findByIdAndUpdate(req.params.id, req.body, { new: true }, (err, item) => {
          if (!err) res.status(200).json(item)
          else {
            err.status = 400
            next(err)
          }
        })
      }
    }
  })
  .patch((req, res, next) => {
    res.set('Content-Type', 'application/json')
    if (req.params.id !== req.body._id) {
      const err = {
        'status': 400,
        'message': 'Request ID is not equal to object ID'
      }
      next(err)
    } else {
      if (req.body.__v !== undefined) delete req.body.__v
      if (req.body._id !== undefined) delete req.body._id
      ExampleModel.findByIdAndUpdate(req.params.id, req.body, { upsert: true, new: true }, (err, item) => {
        if (!err) res.status(200).json(item)
        else {
          err.status = 404
          next(err)
        }
      })
    }
  })

module.exports = exampleRouter
