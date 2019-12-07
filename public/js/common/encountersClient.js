/*
  Dedicated client for encounter-based operations, to prevent code duplication across controllers.
 */

var encountersClient = {};

encountersClient.loadEncounters = function(debug, cb) {
  var xhttp = new XMLHttpRequest();
  var unitsInResponse = [];
  var units = [];

  xhttp.onreadystatechange = function() {

    if (this.readyState == 4 && this.status == 200) {

      if (debug === true)
        console.log(`Response from server: ${this.responseText}`);

      unitsInResponse = JSON.parse(this.responseText);

      unitsInResponse.forEach(function(unit) {
        units.push(unit);
      });

      cb(units);
    }
  };
  xhttp.open("GET", "getEncounters", true);
  xhttp.send();
};

encountersClient.saveEncounter = function(_encounter, isNewEncounter, debug, cb) {
  let xhttp = new XMLHttpRequest();
  let encounter = Object.assign({}, _encounter);

  delete encounter.$$hashKey;

  xhttp.onreadystatechange = function() {

    if (this.readyState == 4 && this.status == 200) {

      if (debug === true)
        console.log(`Response from server: ${this.responseText}`);

      let response = JSON.parse(this.responseText);

      cb(response);
    }
  };

  if (isNewEncounter)
    xhttp.open("POST", "saveEncounter", true);
  else
    xhttp.open("POST", "updateEncounter", true);

  xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhttp.send(JSON.stringify(encounter));
};