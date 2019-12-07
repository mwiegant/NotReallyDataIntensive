(function (module) {
  const UNITS = 'units';
  const HOSTILES = 'hostiles';
  const ENCOUNTERS = "encounters";

  const MongoClient = require('mongodb').MongoClient;
  const url = 'mongodb://localhost:27017';
  const dbName = 'dnd';
  const client = new MongoClient(url);

  let mongoClient = {};

  /*
  To prevent issues from connecting multiple times, immediately connect as soon as this file is exported
   */
  client.connect(function(err) {
    if (err)
      console.error(`Error while opening a connection to MongoDB: ${err}`);
    else
      console.log('Successfully connected to MongoDB.');
  });

  /* hostile unit endpoints */
  mongoClient.getAllAliveHostiles = function(callback) {
    const collection = client.db(dbName).collection(HOSTILES);
    const query = {Alive: true};

    collection.find(query).toArray(function(err, docs) {
      if (err)
        console.error(err);

      callback(err, docs);
    });
  };

  mongoClient.getHostileUnit = function(hostileUnitId, callback) {
    const collection = client.db(dbName).collection(HOSTILES);
    const query = {_id: parseFloat(hostileUnitId) };

    /*
      For some reason, mongo isn't finding the document I'm querying...
     */

    collection.findOne(query, function(err, doc) {
      if (err)
        console.error(err);

      callback(null, doc);
    });
  };

  mongoClient.updateHostile = function(_hostile, callback) {
    const collection = client.db(dbName).collection(HOSTILES);
    const query = {
      _id: _hostile._id
    };

    const hostile = Object.assign({}, _hostile);

    delete hostile._id;

    const update = {
      $set: hostile
    };

    const upsert = {
      upsert: true
    };

    collection.updateOne(query, update, upsert, function(err, res) {
      if (err)
        console.error(`Error updating hostile unit with id ${_hostile._id}: ${err}`);

      callback(err);
    })
  };

  mongoClient.saveHostile = function(hostile, callback) {
    const collection = client.db(dbName).collection(HOSTILES);

    collection.insertOne(hostile, function(err, res) {
      if (err)
        console.error(`Error inserting hostile unit with id ${hostile._id}: ${err}`);

      callback(err);
    })
  };

  /* Unit endpoints */
  mongoClient.getAllAliveUnits = function(callback) {
    const collection = client.db(dbName).collection(UNITS);
    const query = {Alive: true};

    collection.find(query).toArray(function(err, docs) {
      if (err)
        console.error(err);

      callback(err, docs);
    });
  };

  mongoClient.updateUnit = function(_unit, callback) {
    const collection = client.db(dbName).collection(UNITS);
    const query = {
      _id: _unit._id
    };

    const unit = Object.assign({}, _unit);

    delete unit._id;

    const update = {
      $set: unit
    };

    const upsert = {
      upsert: true
    };

    collection.updateOne(query, update, upsert, function(err, res) {
      if (err)
        console.error(`Error updating unit with id ${_unit._id}: ${err}`);

      callback(err);
    })
  };

  mongoClient.saveUnit = function(unit, callback) {
    const collection = client.db(dbName).collection(UNITS);

    collection.insertOne(unit, function(err, res) {
      if (err)
        console.error(`Error inserting unit with id ${unit._id}: ${err}`);

      callback(err);
    })
  };

  /* encounter endpoints */
  mongoClient.getEncounters = function(callback) {
    const collection = client.db(dbName).collection(ENCOUNTERS);
    const query = {Deleted: false};

    collection.find(query).toArray(function(err, docs) {
      if (err)
        console.error(err);

      callback(docs);
    });
  };

  mongoClient.updateEncounter = function(_encounter, callback) {
    const collection = client.db(dbName).collection(ENCOUNTERS);
    const query = {
      _id: _encounter._id
    };

    const encounter = Object.assign({}, _encounter);

    delete encounter._id;

    const update = {
      $set: encounter
    };

    const upsert = {
      upsert: true
    };

    collection.updateOne(query, update, upsert, function(err, res) {
      if (err)
        console.error(`Error updating encounter with id ${_encounter._id}: ${err}`);

      callback(err);
    })
  };

  mongoClient.saveEncounter = function(encounter, callback) {
    const collection = client.db(dbName).collection(ENCOUNTERS);

    collection.insertOne(encounter, function(err, res) {
      if (err)
        console.error(`Error inserting encounter with id ${encounter._id}: ${err}`);

      callback(err);
    })
  };

  module.exports = mongoClient;

})(module);


