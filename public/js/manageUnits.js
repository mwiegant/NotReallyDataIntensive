dndApp.controller('ManageUnitsController', ['$scope', function ($scope) {

  const MAX_RECORDED_ACTIVITIES = 20;
  const UNKNOWN = "?";
  $scope.partyUnitsLoaded = null;

  $scope.availableUnits = [];
  $scope.selectedUnit = null;
  $scope.saveSuccessful = null;
  $scope.saveMessage = null;

  $scope.ancestryOptions = [];
  $scope.experienceOptions = [];
  $scope.equipmentOptions = [];
  $scope.unitTypeOptions = [];

  $scope.level = 0;
  $scope.maxTroops = 0;
  $scope.potentialTroops = 0;

  $scope.finalSums = [];

  $scope.selectUnit = function(unit) {
    $scope.saveSuccessful = null;
    $scope.saveMessage = null;

    // deep copy, so that un-saved changes will completely disappear when a new unit is selected
    $scope.selectedUnit = Object.assign({}, unit);

    // display keywords & refresh the keywords / sums
    loadSelectedKeywords($scope.selectedUnit.Keywords);
    $scope.refreshKeywords();
    $scope.calculateLevel();
  };

  $scope.refreshSums = function() {
    // adjust the auto value sums
    let keywordAutoSums = unitsClient.calculateAutoSums($scope.selectedUnit);

    // store the auto value sums in the selected unit, so that the auto values will immediately be saveable
    $scope.selectedUnit.AUTO_ATT = keywordAutoSums[0];
    $scope.selectedUnit.AUTO_PWR = keywordAutoSums[1];
    $scope.selectedUnit.AUTO_MOR = keywordAutoSums[2];
    $scope.selectedUnit.AUTO_DEF = keywordAutoSums[3];
    $scope.selectedUnit.AUTO_TGH = keywordAutoSums[4];

    // adjust the final sums
    $scope.finalSums = unitsClient.calculateSums($scope.selectedUnit, keywordAutoSums);
  };

  $scope.refreshKeywords = function() {
    let keywords = $scope.selectedUnit.Keywords;
    let keywordsComplete = "";

    keywordsComplete += (keywords.Ancestry || UNKNOWN);
    keywordsComplete += " " + (keywords.Experience || UNKNOWN);
    keywordsComplete += " " + (keywords.Equipment || UNKNOWN);
    keywordsComplete += " " + (keywords.Type || UNKNOWN);

    $scope.selectedUnit.Keywords.Unsaved = keywordsComplete;

    // if the keywords are refreshed, will need to refresh the sums too
    $scope.refreshSums();
  };

  $scope.createUnit = function() {
    $scope.selectedUnit = {
        _id: -1,
        Name : "",
        Keywords : {
          Saved: "",
          Unsaved: "",
          Ancestry: null,
          Experience: null,
          Equipment: null,
          Type: null
        },
        AUTO_ATT : 0,
        AUTO_DEF : 0,
        AUTO_PWR : 0,
        AUTO_TGH : 0,
        AUTO_MOR : 0,
        MAX_STR : 4,
        STR : 4,
        MAN_ATT : 0,
        MAN_DEF : 0,
        MAN_PWR : 0,
        MAN_TGH : 0,
        MAN_MOR : 0,
        Troops: 0,
        ActivityLog: [],
        Alive: true
    };

    loadSelectedKeywords($scope.selectedUnit.Keywords);
    $scope.refreshKeywords();
    $scope.calculateLevel();
  };

  // saves the currently selected unit, using the boolean partyUnitsLoaded to determine which backend endpoint to call
  $scope.saveUnit = function() {
    if ($scope.selectedUnit === null)
      alert("Cannot save unit: there is no unit currently selected.");

    // existing units will always have an id greater than 0
    const isNewUnit = $scope.selectedUnit._id <= 0;
    let keywordsObject = $scope.selectedUnit.Keywords;

    if (isValidPortrait()) {
      if (isNewUnit)
        $scope.selectedUnit._id = Date.now();

      // prior to saving, must set the keywords to be a string, not an object
      $scope.selectedUnit.Keywords = keywordsObject.Unsaved;

      if ($scope.partyUnitsLoaded) {
        unitsClient.saveUnit($scope.selectedUnit, isNewUnit, false, function(response) {
          _saveUnitCallback(response, keywordsObject, isNewUnit);
        });
      } else {
        unitsClient.saveHostile($scope.selectedUnit, isNewUnit, false, function(response) {
          _saveUnitCallback(response, keywordsObject, isNewUnit);
        });
      }

    }
  };

  $scope.killUnit = function() {
    if (confirm("Are you sure you want to kill this unit?")) {

      // existing units will always have an id greater than 0
      const isNewUnit = $scope.selectedUnit._id <= 0;

      if (isNewUnit) {
        $scope.selectedUnit = null;
      }
      else {
        $scope.selectedUnit.Alive = false;

        if ($scope.partyUnitsLoaded) {
          unitsClient.saveUnit($scope.selectedUnit, isNewUnit, false, function(response) {
            $scope.loadPartyUnits();
          });
        } else {
          unitsClient.saveHostile($scope.selectedUnit, isNewUnit, false, function(response) {
            $scope.loadHostileUnits();
          });
        }
      }
    }
  };

  // loads the party's units as the 'available units'
  $scope.loadPartyUnits = function() {
    $scope.partyUnitsLoaded = true;

    unitsClient.loadUnits(null, function(units) {
      _loadUnitsCallback(units);
    });
  };

  // loads the DM's hostile units as the 'available units'
  $scope.loadHostileUnits = function() {
    $scope.partyUnitsLoaded = false;

    unitsClient.loadHostiles(null, function(units) {
      _loadUnitsCallback(units);
    });
  };

  // Determine what level the currently selected unit is, and how many troops are required for the next level
  $scope.calculateLevel = function() {
    const STRENGTH = 0;
    const MIN_TROOPS = 1;
    const MAX_TROOPS = 2;

    let level = 1;
    let strength = 4;
    let minTroops = 0;
    let maxTroops = 0;

    for (level; level < 6; level++) {
      strength = unitConstants.size[level][STRENGTH];
      minTroops = unitConstants.size[level][MIN_TROOPS];
      maxTroops = unitConstants.size[level][MAX_TROOPS];

      if ($scope.selectedUnit.Troops >= minTroops && $scope.selectedUnit.Troops < maxTroops)
        break;
    }

    // for some reason, didn't find the right level (there are only 5 levels)
    if (level > 5) {
      level = "?";
      maxTroops = "?";
    }
    // assuming the level was determined, make sure the unit's strength is adjusted, if needed
    else {
      if ($scope.selectedUnit.MAX_STR != strength)
        $scope.selectedUnit.MAX_STR = strength;

      if ($scope.selectedUnit.STR > $scope.selectedUnit.MAX_STR)
        $scope.selectedUnit.STR = $scope.selectedUnit.MAX_STR;
    }

    $scope.level = level;
    $scope.maxTroops = maxTroops;
  };

  $scope.addTroops = function(){
    appendTroops($scope.potentialTroops);
    recordActivity(`${$scope.selectedUnit.Name} have gained troops! ${$scope.potentialTroops} have joined.`);
  };

  $scope.subtractTroops = function(){
    appendTroops($scope.potentialTroops * -1);
    recordActivity(`${$scope.selectedUnit.Name} have lost troops. ${$scope.potentialTroops} have left this unit.`);
  };

  function appendTroops(potentialTroops) {
    $scope.selectedUnit.Troops += potentialTroops;
    $scope.potentialTroops = 0;

    $scope.calculateLevel();
  }

  function recordActivity(activity) {
    $scope.selectedUnit.ActivityLog.unshift(activity);

    // limit the number of saved activities, so that the database object does not grow forever
    $scope.selectedUnit.ActivityLog = $scope.selectedUnit.ActivityLog.slice(0, MAX_RECORDED_ACTIVITIES);
  }

  function isValidPortrait() {
    const keywords = $scope.selectedUnit.Keywords;
    let isValid = false;

    if ($scope.selectedUnit.Name === undefined || $scope.selectedUnit.Name.length == 0) {
      $scope.saveSuccessful = false;
      $scope.saveMessage = "Error saving unit: the unit must have a name.";
    }
    else if (keywords.Ancestry === UNKNOWN || keywords.Ancestry === null) {
      $scope.saveSuccessful = false;
      $scope.saveMessage = "Error saving unit: please choose an ancestry for this unit.";
    }
    else if (keywords.Experience === UNKNOWN || keywords.Experience === null) {
      $scope.saveSuccessful = false;
      $scope.saveMessage = "Error saving unit: please choose an experience level for this unit.";
    }
    else if (keywords.Equipment === UNKNOWN || keywords.Equipment === null) {
      $scope.saveSuccessful = false;
      $scope.saveMessage = "Error saving unit: please choose an equipment type for this unit.";
    }
    else if (keywords.Type === UNKNOWN || keywords.Type === null) {
      $scope.saveSuccessful = false;
      $scope.saveMessage = "Error saving unit: please choose a unit type for this unit.";
    }
    else {
      isValid = true;
    }

    return isValid;
  }

  function loadSelectedKeywords(keywords) {
    const ANCESTRY = 0;
    const EXPERIENCE = 1;
    const EQUIPMENT = 2;
    const UNIT_TYPE = 3;

    // keywords should always have this order: Ancestry Experience Equipment UnitType
    let splitKeywords = [];

    if (keywords.Unsaved)
      splitKeywords = keywords.Unsaved.split(' ');
    else
      splitKeywords = keywords.Saved.split(' ');

    if ($scope.ancestryOptions.includes(splitKeywords[ANCESTRY]))
      keywords.Ancestry = splitKeywords[ANCESTRY];
    else
      keywords.Ancestry = UNKNOWN;

    if ($scope.experienceOptions.includes(splitKeywords[EXPERIENCE]))
      keywords.Experience = splitKeywords[EXPERIENCE];
    else
      keywords.Experience = UNKNOWN;

    if ($scope.equipmentOptions.includes(splitKeywords[EQUIPMENT]))
      keywords.Equipment = splitKeywords[EQUIPMENT];
    else
      keywords.Equipment = UNKNOWN;

    if ($scope.unitTypeOptions.includes(splitKeywords[UNIT_TYPE]))
      keywords.Type = splitKeywords[UNIT_TYPE];
    else
      keywords.Type = UNKNOWN;
  }

  function _saveUnitCallback(response, keywordsObject, isNewUnit) {
    $scope.selectedUnit.Keywords = keywordsObject;
    $scope.saveSuccessful = response.success;

    $scope.selectedUnit.Keywords.Saved = $scope.selectedUnit.Keywords.Unsaved;

    if (response.success === false) {
      $scope.saveMessage = "Failed to save this unit!";
    }
    else {
      $scope.saveMessage = "Successfully saved this unit!";

      if (isNewUnit) {
        $scope.availableUnits.push(Object.assign({}, $scope.selectedUnit));
      }
      else {
        // update the saved unit in the availableUnits list, so the unit's card will update
        for (let i = 0; i < $scope.availableUnits.length; i++) {
          if ($scope.availableUnits[i]._id === $scope.selectedUnit._id) {
            $scope.availableUnits[i] = Object.assign({}, $scope.selectedUnit);
            break;
          }
        }
      }
    }

    $scope.$apply();
  }

  function _loadUnitsCallback(units) {
    $scope.availableUnits = [];
    $scope.selectedUnit = null;

    units.forEach(function(unit) {
      // prior to adding each unit to the page, must set the keywords to be an object, not a string
      unit.Keywords = {
        Saved: unit.Keywords
      };

      $scope.availableUnits.push(unit);
    });

    $scope.$apply();
  }



  function init() {
    // load constants into the scope, so drop-downs will be populated
    $scope.ancestryOptions = Object.keys(unitConstants.ancestry);
    $scope.experienceOptions = Object.keys(unitConstants.experience);
    $scope.equipmentOptions = Object.keys(unitConstants.equipment);
    $scope.unitTypeOptions = Object.keys(unitConstants.unitType);
  }

  init();
}]);
