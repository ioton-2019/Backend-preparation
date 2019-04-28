/* globals requireWrapper */

/** This module defines the mongoose schema for an example
 *
 * @author Arne Rolf
 *
 * @module models/example/index.js
 * @type {mongoose schema}
 */

const mongoose = require('mongoose')
const logger = requireWrapper('helpers/logger')

const Schema = mongoose.Schema
const ExampleSchema = new Schema(
  {
    title: { type: String, required: true }
  },
  {
    _id: true,
    collection: 'Examples',
    timestamps: true
  }
)

const mongooseOptions = {
  useNewUrlParser: true,
  socketTimeoutMS: 0,
  keepAlive: true,
  autoReconnect: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 1000
}

let connectionString = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/Example`

if (process.env.DB_USER && process.env.DB_PASS) {
  connectionString = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/Example?authSource=admin`
}

mongoose.Promise = global.Promise

logger.info('MongoDB: trying initial connection');

(async () => {
  try {
    const db = await mongoose.createConnection()

    db.on('error', e => logger.error(`MongoDB: error ${e}`))
    db.on('connected', e => logger.info(`MongoDB: is connected`))
    db.on('disconnecting', () => logger.warn('MongoDB: is disconnecting!'))
    db.on('disconnected', () => logger.warn('MongoDB: is disconnected!'))
    db.on('reconnected', () => logger.info(`MongoDB: is reconnected`))
    db.on('timeout', e => logger.warn(`MongoDB: timeout ${e})`))
    db.on('close', () => logger.warn('MongoDB: connection closed'))

    db.openUri(connectionString, mongooseOptions)

    module.exports = db.model('Example', ExampleSchema)
  } catch (err) {
    logger.error('MongoDB: Initial connection failed!')
    logger.error('Make sure MongoDB is running an connection URL is correct!')
    logger.error(err)
  }
})()
