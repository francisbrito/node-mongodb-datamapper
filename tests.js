'use strict';

const spy = require('spy');
const test = require('blue-tape');
const Promise = require('bluebird');
const coroutine = require('co');

const mongoDataMapper = require('./');

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
  const expectedConnectionUri = 'mongodb://localhost/test';
  const expectedCollectionName = 'docs';
  const mockDb = {
    close: spy(),
    collection: spy(),
  };
  mockDb.close.mock(Promise.resolve());
  const mockDriver = {
    MongoClient: {
      connect: spy(),
    },
  };
  mockDriver.MongoClient.connect.mock(Promise.resolve(mockDb));
  const subject = mongoDataMapper({
    driver: mockDriver,
    connectionUri: expectedConnectionUri,
    collectionName: expectedCollectionName,
  });

  t.ok(subject.initialize, 'should respond to `#initialize`.');

  yield subject.initialize();

  t.ok(
    mockDriver.MongoClient.connect.called &&
    mockDriver.MongoClient.connect.calledWith(expectedConnectionUri),
    'should have connected to db.'
  );

  t.ok(subject.initialized, 'should have been initialized.');

  yield subject.destroy();
}));

test('mapper can be destroyed', coroutine.wrap(function* (t) {
  const subject = mongoDataMapper({
    connectionUri: 'mongodb://localhost/test',
    collectionName: 'docs',
  });

  yield subject.initialize();
  yield subject.destroy();

  t.notOk(subject.initialized, 'should have been destroyed.');
}));
