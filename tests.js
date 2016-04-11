'use strict';

const test = require('blue-tape');
const coroutine = require('co');

const mongoDataMapper = require('./');

test('factory should throw if required parameters are missing', coroutine.wrap(function* (t) {
  t.throws(
    () => mongoDataMapper(),
    /`options` is missing./,
    'should throw if `options` is missing.'
  );
}));
