'use strict';

const spy = require('spy');
const test = require('blue-tape');
const Promise = require('bluebird');
const coroutine = require('co');

const mongoDataMapper = require('./');

const CONNECTION_URI = 'mongodb://localhost/test';
const COLLECTION_NAME = 'docs';

test('factory should throw if required parameters are missing', coroutine.wrap(function* (t) {
  t.throws(
    () => mongoDataMapper(),
    /`options` is missing/,
    'should throw if `options` is missing.'
  );

  t.throws(
    () => mongoDataMapper({}),
    /`options.connectionUri` is missing/,
    'should throw if `options.connectionUri` is missing.'
  );

  t.throws(
    () => mongoDataMapper({
      connectionUri: 'mongodb://localhost/test',
    }),
    /`options.collectionName` is missing/,
    'should throw if `options.collectionName` is missing.'
  );
}));

test('mapper can be initialized', coroutine.wrap(function* (t) {
  const expectedConnectionUri = CONNECTION_URI;
  const expectedCollectionName = COLLECTION_NAME;
  const driverMock = createDriverMock();
  const subject = mongoDataMapper({
    driver: driverMock,
    connectionUri: expectedConnectionUri,
    collectionName: expectedCollectionName,
  });

  t.ok(subject.initialize, 'should respond to `#initialize`.');

  yield subject.initialize();

  t.ok(
    driverMock.MongoClient.connect.called &&
    driverMock.MongoClient.connect.calledWith(expectedConnectionUri),
    'should have connected to db.'
  );

  t.ok(subject.initialized, 'should have been initialized.');

  yield subject.destroy();
}));

test('mapper can be destroyed', coroutine.wrap(function* (t) {
  const dbMock = createDbMock();
  const driverMock = createDriverMock(dbMock);
  const subject = mongoDataMapper({
    driver: driverMock,
    connectionUri: CONNECTION_URI,
    collectionName: COLLECTION_NAME,
  });

  yield subject.initialize();
  yield subject.destroy();

  t.ok(dbMock.close.called, 'should have closed db.');

  t.notOk(subject.initialized, 'should have been destroyed.');
}));

function createDbMock() {
  const dbMock = {
    close: spy(),
    collection: spy(),
  };

  dbMock.close.mock(Promise.resolve());

  return dbMock;
}

function createDriverMock(dbMock) {
  const driverMock = {
    MongoClient: {
      connect: spy(),
    },
  };

  driverMock.MongoClient.connect.mock(Promise.resolve(dbMock || createDbMock()));

  return driverMock;
}
