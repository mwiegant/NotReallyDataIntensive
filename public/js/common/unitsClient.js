/*
  Dedicated client for unit-based operations, to prevent code duplication across controllers.
 */

var unitsClient = {};

/* hostile unit endpoints */
unitsClient.loadHostiles = function(debug, cb) {
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
  xhttp.open("GET", "getAllAliveHostiles", true);
  xhttp.send();
};

unitsClient.getHostileUnit = function(hostileUnitId, debug, cb) {
  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {

    if (this.readyState == 4 && this.status == 200) {

      if (debug === true)
        console.log(`Response from server: ${this.responseText}`);

      let response = JSON.parse(this.responseText);

      if (response.err) {
        console.log(`error from server: ${response.err}`);
      }

      cb(response.unit);
    }
  };
  xhttp.open("GET", `getHostileUnit/${hostileUnitId}`, true);
  xhttp.send();
};

unitsClient.saveHostile = function(_hostile, isNewHostile, debug, cb) {
  let xhttp = new XMLHttpRequest();
  let hostile = Object.assign({}, _hostile);

  delete hostile.$$hashKey;

  xhttp.onreadystatechange = function() {

    if (this.readyState == 4 && this.status == 200) {

      if (debug === true)
        console.log(`Response from server: ${this.responseText}`);

      let response = JSON.parse(this.responseText);

      cb(response);
    }
  };

  if (isNewHostile)
    xhttp.open("POST", "saveHostile", true);
  else
    xhttp.open("POST", "updateHostile", true);

  xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhttp.send(JSON.stringify(hostile));
};

/* unit endpoints */
unitsClient.loadUnits = function(debug, cb) {
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
  xhttp.open("GET", "getAllAliveUnits", true);
  xhttp.send();
};

unitsClient.saveUnit = function(_unit, isNewUnit, debug, cb) {
  let xhttp = new XMLHttpRequest();
  let unit = Object.assign({}, _unit);

  delete unit.$$hashKey;

  xhttp.onreadystatechange = function() {

    if (this.readyState == 4 && this.status == 200) {

      if (debug === true)
        console.log(`Response from server: ${this.responseText}`);

      let response = JSON.parse(this.responseText);

      cb(response);
    }
  };

  if (isNewUnit)
    xhttp.open("POST", "saveUnit", true);
  else
    xhttp.open("POST", "updateUnit", true);

  xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhttp.send(JSON.stringify(unit));
};

/*
  Given a unit with keywords, returns the sums of the Auto values.
 */
unitsClient.calculateAutoSums = function(unit) {
  const empty = [0, 0, 0, 0, 0];
  const keywords = unit.Keywords;
  const ancestryValues = unitConstants.ancestry[keywords.Ancestry] || empty;
  const experienceValues = unitConstants.experience[keywords.Experience] || empty;
  const equipmentValues = unitConstants.equipment[keywords.Equipment] || empty;
  const unitTypeValues = unitConstants.unitType[keywords.Type] || empty;

  let autoSums = [0, 0, 0, 0, 0];

  // refresh auto values
  for (let i = 0; i < 5; i++) {
    autoSums[i] += ancestryValues[i] + experienceValues[i] + equipmentValues[i] + unitTypeValues[i];
  }

  return autoSums;
};

/*
  Given a unit and the sums of the Auto values, returns the sums of the final values (Auto & Manual values added)
 */
unitsClient.calculateSums = function(unit, keywordAutoSums) {
  let sums = [0, 0, 0, 0, 0];

  sums[0] = keywordAutoSums[0] + unit.MAN_ATT;
  sums[1] = keywordAutoSums[1] + unit.MAN_PWR;
  sums[2] = keywordAutoSums[2] + unit.MAN_MOR;
  sums[3] = keywordAutoSums[3] + unit.MAN_DEF;
  sums[4] = keywordAutoSums[4] + unit.MAN_TGH;

  return sums;
};





