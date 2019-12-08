(function (module) {
  var express = require('express');
  var path = require('path');
  var router = express.Router();

  router.get(['/favicon.ico'], function (req, res) {
    res.writeHead(200, {'Content-Type': 'image/x-icon'} );
    res.end();
    return;
  });

  router.get('/getValue/:key', function(req, res) {
    let response = {
      successed: true,
      result: ''
    };


    // mongoClient.getHostileUnit(req.params.hostileUnitId, function(err, unit) {
    //   if (err) {
    //     response.success = false;
    //     response.error = err;
    //   }
    //   else {
    //     response.unit = unit;
    //   }
    //
    //   res.json(response);
    // });

    response.successed = false;
    response.result = "backend call for 'getValue' not yet implemented";

    res.json(response);
  });

  router.post('/putValue/:key/:value', function(req, res) {
    let response = {
      successed: true,
      result: ''
    };

    // mongoClient.updateHostile(req.body, function(err) {
    //   if (err) {
    //     response.success = false;
    //     response.error = err;
    //   }
    //
    //   res.json(response);
    // });

    response.successed = false;
    response.result = "backend call for 'putValue' not yet implemented";

    res.json(response);
  });

  // /* hostile unit endpoints */
  // router.get('/getAllAliveHostiles', function(req, res) {
  //   mongoClient.getAllAliveHostiles(function(err, units) {
  //     res.json(units);
  //   });
  // });
  //
  // router.get('/getHostileUnit/:hostileUnitId', function(req, res) {
  //   let response = {
  //     success: true
  //   };
  //
  //   mongoClient.getHostileUnit(req.params.hostileUnitId, function(err, unit) {
  //     if (err) {
  //       response.success = false;
  //       response.error = err;
  //     }
  //     else {
  //       response.unit = unit;
  //     }
  //
  //     res.json(response);
  //   });
  // });
  //
  // router.post('/updateHostile', function(req, res) {
  //   let response = {
  //     success: true
  //   };
  //
  //   mongoClient.updateHostile(req.body, function(err) {
  //     if (err) {
  //       response.success = false;
  //       response.error = err;
  //     }
  //
  //     res.json(response);
  //   });
  // });
  //
  // router.post('/saveHostile', function(req, res) {
  //   let response = {
  //     success: true
  //   };
  //
  //   mongoClient.saveHostile(req.body, function(err) {
  //     if (err) {
  //       response.success = false;
  //       response.error = err;
  //     }
  //
  //     res.json(response);
  //   });
  // });
  //
  // /* unit endpoints */
  // router.get('/getAllAliveUnits', function(req, res) {
  //   mongoClient.getAllAliveUnits(function(err, units) {
  //     if (err)
  //       console.log(`error getting all alive units: ${err}`);
  //
  //     res.json(units);
  //   });
  // });
  //
  // router.post('/updateUnit', function(req, res) {
  //   let response = {
  //     success: true
  //   };
  //
  //   mongoClient.updateUnit(req.body, function(err) {
  //     if (err) {
  //       response.success = false;
  //       response.error = err;
  //     }
  //
  //     res.json(response);
  //   });
  // });
  //
  // router.post('/saveUnit', function(req, res) {
  //   let response = {
  //     success: true
  //   };
  //
  //   mongoClient.saveUnit(req.body, function(err) {
  //     if (err) {
  //       response.success = false;
  //       response.error = err;
  //     }
  //
  //     res.json(response);
  //   });
  // });
  //
  // /* encounter endpoints */
  // router.get('/getEncounters', function(req, res) {
  //   mongoClient.getEncounters(function(encounters) {
  //     res.json(encounters);
  //   });
  // });
  //
  // router.post('/updateEncounter', function(req, res) {
  //   let response = {
  //     success: true
  //   };
  //
  //   mongoClient.updateEncounter(req.body, function(err) {
  //     if (err) {
  //       response.success = false;
  //       response.error = err;
  //     }
  //
  //     res.json(response);
  //   });
  // });
  //
  // router.post('/saveEncounter', function(req, res) {
  //   let response = {
  //     success: true
  //   };
  //
  //   mongoClient.saveEncounter(req.body, function(err) {
  //     if (err) {
  //       response.success = false;
  //       response.error = err;
  //     }
  //
  //     res.json(response);
  //   });
  // });

  /* For security purposes, error out any remaining GET requests */
  router.get('*', function (req, res) {
    console.error("An error occurred while completing a GET request");

    res.status(500);
    res.send("An error occurred while completing a GET request");
    return;
  });

  module.exports = router;

})(module);


