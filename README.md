# MongoDb Data Mapper [![Build Status](https://travis-ci.org/francisbrito/node-mongodb-datamapper.svg?branch=master)](https://travis-ci.org/francisbrito/node-mongodb-datamapper) [![npm version](https://badge.fury.io/js/mongodb-datamapper.svg)](https://badge.fury.io/js/mongodb-datamapper)

# What ?
A data mapper is an abstraction on top of a persistence mechanism. It works as a bridge between domain entities and a data store.

# Why ?
`MongoDb Data Mapper` is easier to test alternative to popular `Active Record`-based ORMs. It achieves so by exposing a minimalist (therefore trivial to mock) API and providing set-up/tear-down methods.

# How ?

```js
const coroutine = require('co');
const mongoDataMapper = require('mongodb-datamapper');

const petsDataMapper = mongoDataMapper({
  connectionUri: 'mongodb://localhost/test',
  collectionName: 'pets',
});

coroutine(function* () {
  // Always `initialize` before querying.
  yield petsDataMapper.initialize();

  const herPets = yield petsDataMapper.find({ owner: 'Sabrina' });

  herPets.forEach(p => console.log(p.name));

  // `destroy` mapper once you're done.
  yield petsDataMapper.destroy();
});
```

Using with your `transform`-s:
```js
const coroutine = require('co');
const mongoDataMapper = require('mongodb-datamapper');

const student = require('./my-awesome-domain/student');

const studentsDataMapper = mongoDataMapper({
  transform: student,
  connectionUri: 'mongodb://localhost/test',
  collectionName: 'students',
});

coroutine(function* () {
  yield studentsDataMapper.initialize();

  const allStudents = yield studentsDataMapper.find();
  const studentsWithHighScores = allStudents.map(s => s.averageScore > 90);

  studentsWithHighScores.forEach(s => {
    s.showOffGoldenStars(); // Assume `student#showOffGoldenStars`
  });

  yield studentsDataMapper.destroy();
});
```
