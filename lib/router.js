(function (module) {
  const config = require('../bin/config.json');
  var express = require('express');
  var async = require("async");
  var sshClient = require('./sshClient');
  var router = express.Router();


  router.get(['/favicon.ico'], function (req, res) {
    res.writeHead(200, {'Content-Type': 'image/x-icon'} );
    res.end();
  });

  router.get('/getValue/:key', function(req, res) {
    let response = {
      succeeded: true,
      result: ''
    };

    let key = req.params.key;

    // reach out to both nodes for a value, in case a user had entered the same key into both nodes
    //   (i.e. set a key "testKey" to value 5, and then to value 6; the key would therefore exist
    //   on both nodes. In this case, return the most recently added value)
    async.series({
      nodeA: function(callback) {
        sshClient.getValue(config.nodeA, key, function(err, value, timestamp) {
          // if there is an error, log it and return no data
          if (err) {
            console.log(`error getting value from nodeA: ${err}`);
            callback(`error getting value from nodeA: ${err}`, null);
          }

          callback(null, {
            value: value,
            timestamp: timestamp
          });
        });
      },

      nodeB: function(callback){
        sshClient.getValue(config.nodeB, key, function(err, value, timestamp) {
          if (err) {
            console.log(`error getting value from nodeB: ${err}`);
            callback(`error getting value from nodeB: ${err}`, null);
          }

          callback(null, {
            value: value,
            timestamp: timestamp
          });
        });
      }
    }, function(err, results) {

      if (err) {
        response.succeeded = false;
        response.result = "one or both nodes appear to have failed or are otherwise non-responsive.";
      }

      else {
        if (results.nodeA !== null) {
          response.result = results.nodeA.value;
        }

        if (results.nodeB !== null && parseInt(results.nodeB.timestamp) > parseInt(results.nodeA.timestamp)) {
          response.result = results.nodeB.value;
        }

        // handle the case where neither node had a value for the provided key
        if(response.result === '') {
          response.result = `could not find a value for the key '${key}' across either node.`;
        }
      }

      res.json(response);
    });
  });

  router.post('/putValue/:key/:value', function(req, res) {
    let response = {
      succeeded: true,
      result: ''
    };

    let key = req.params.key;
    let value = req.params.value;
    let timestamp = Math.floor(new Date() / 1000);  // time since epoch
    let data = `${key} ${value} ${timestamp}`;

    if (parseInt(value) % 2 === 0) {
      sshClient.saveData(config.nodeA, data, function(err) {
        if (err) {
          console.log(err);
          response.succeeded = false;
          response.result = "encountered an issue with the ssh operations.";
        }

        res.json(response);
      });
    }
    else {
      sshClient.saveData(config.nodeB, data, function(err) {
        if (err) {
          console.log(err);
          response.succeeded = false;
          response.result = "encountered an issue with the ssh operations.";
        }

        res.json(response);
      });
    }

  });

  /* For security purposes, error out any remaining GET requests */
  router.get('*', function (req, res) {
    console.error("An error occurred while completing a GET request");

    res.status(500);
    res.send("An error occurred while completing a GET request");
  });

  module.exports = router;

})(module);


