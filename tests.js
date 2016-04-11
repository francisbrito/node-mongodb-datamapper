'use strict';

const test = require('blue-tape');
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
