'use strict';
const assert = require('assert');

const merge = require('merge-descriptors');
const mongodb = require('mongodb');
const manageable = require('manageable');

const IDENTITY_FUNCTION = d => d;

/**
 * Creates a MongoDb Data Mapper.
 * @param   {Object}    options
 * @param   {Object}    [options.driver]        A MongoDb driver.
 * @param   {Function}  [options.transform]     A transformation function to be applied to docs.
 * @param   {String}    options.connectionUri   A MongoDb connection string.
 * @param   {String}    options.collectionName  Name of the collection to operate with.
 * @return  {Object} An object implementing the data mapper interface.
 */
function createMongoDbDataMapper(options) {
  assert(options, '`options` is missing.');
  assert(options.connectionUri, '`options.connectionUri` is missing.');
  assert(options.collectionName, '`options.collectionName` is missing.');

  const driver = options.driver || mongodb;
  const transform = options.transform || IDENTITY_FUNCTION;
  const connectionUri = options.connectionUri;
  const collectionName = options.collectionName;

  let db;
  let collection;

  const openConnection = function* () {
    db = yield driver.MongoClient.connect(connectionUri);
    collection = db.collection(collectionName);
  };
  const closeConnection = function* () {
    yield db.close();
  };

  const mapper = merge(
    {
      *find(opts) {
        const documents = yield queryAsCursor(opts, collection)
        .map(transform)
        .toArray();

        return documents;
      },
      *findOne(query) {
        const opts = Object.assign(query, { limit: 1 });
        const document = yield queryAsCursor(opts, collection)
        .next();

        return transform(document);
      },
      *create(fields) {
        yield collection.inserOne(transform(fields));
      },
      *remove(query) {
        yield collection.findOneAndRemove(query);
      },
      *update(opts) {
        const fields = transform(opts.fields);
        const result = yield collection.findOneAndUpdate(opts.query, fields);

        return transform(result.value);
      },
    },
    manageable({ destroy: closeConnection, initialize: openConnection })
  );

  return mapper;
}

function queryAsCursor(options, collection) {
  const skip = options.skip;
  const query = options.query;
  const limit = options.limit;
  const sorting = options.sorting;
  const projection = options.projection;

  return collection
  .find(query)
  .skip(skip)
  .sort(sorting)
  .limit(limit)
  .project(projection);
}

module.exports = createMongoDbDataMapper;
