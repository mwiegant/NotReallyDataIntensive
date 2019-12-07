dndApp.controller('ManageEncountersController', ['$scope', function ($scope) {

  $scope.availableEncounters = [];
  $scope.availableUnits = [];
  $scope.selectedEncounter = null;
  $scope.saveSuccessful = null;
  $scope.saveMessage = null;

  $scope.selectEncounter = function(encounter) {
    $scope.saveSuccessful = null;
    $scope.saveMessage = null;

    // deep copy, so that un-saved changes will completely disappear when a new unit is selected
    $scope.selectedEncounter = Object.assign({}, encounter);
  };

  $scope.createEncounter = function() {
    $scope.selectedEncounter = {
      _id: -1,
      Name : "",
      Status : "Disabled",
      SelectedHostile : null,
      Rewards : "",
      Deleted : false
    };
  };

  $scope.saveEncounter = function() {
    if ($scope.selectedEncounter === null)
      alert("Cannot save encounter: there is no encounter currently selected.");

    // existing encounters will always have an id greater than 0
    const isNewEncounter = $scope.selectedEncounter._id <= 0;

    // during the save, the hostile unit object is overwritten (only the object's id is needed)
    // for this reason, grab the selected hostile now, so the whole object can be retrieved after the save
    let selectedHostile = $scope.selectedEncounter.SelectedHostile;

    if (isValidEncounter()) {
      if (isNewEncounter)
        $scope.selectedEncounter._id = Date.now();

      // be sure to save the id of the selected hostile
      $scope.selectedEncounter.SelectedHostile = $scope.selectedEncounter.SelectedHostile._id;

      encountersClient.saveEncounter($scope.selectedEncounter, isNewEncounter, false, function(response) {
        $scope.selectedEncounter.SelectedHostile = selectedHostile;
        $scope.saveSuccessful = response.success;

        if (response.success === false) {
          $scope.saveMessage = "Failed to save this encounter!";
        }
        else {
          $scope.saveMessage = "Successfully saved this encounter!";

          if (isNewEncounter) {
            $scope.availableEncounters.push(Object.assign({}, $scope.selectedEncounter));
          }
          else {
            // update the saved encounter in the availableEncounters list, so the encounter's card will update
            for (let i = 0; i < $scope.availableEncounters.length; i++) {
              if ($scope.availableEncounters[i]._id === $scope.selectedEncounter._id) {
                $scope.availableEncounters[i] = Object.assign({}, $scope.selectedEncounter);
                break;
              }
            }
          }
        }

        $scope.$apply();
      });
    }
  };

  $scope.deleteEncounter = function() {
    if (confirm("Are you sure you want to delete this encounter?")) {

      // existing encounters will always have an id greater than 0
      const isNewEncounter = $scope.selectedEncounter._id <= 0;

      if (isNewEncounter) {
        $scope.selectedEncounter = null;
      }
      else {
        $scope.selectedEncounter.Deleted = true;

        // be sure to save the id of the selected hostile
        $scope.selectedEncounter.SelectedHostile = $scope.selectedEncounter.SelectedHostile._id;

        encountersClient.saveEncounter($scope.selectedEncounter, isNewEncounter, false, function(response) {
          $scope.selectedEncounter = null;
          loadEncounters();
        });
      }
    }
  };

  function isValidEncounter() {
    let isValid = false;

    // required: name, a selected unit, and rewards

    if ($scope.selectedEncounter.Name === undefined || $scope.selectedEncounter.Name.length == 0) {
      $scope.saveSuccessful = false;
      $scope.saveMessage = "Error saving encounter: the encounter must have a name.";
    }
    else if($scope.selectedEncounter.SelectedHostile === undefined || $scope.selectedEncounter.SelectedHostile === null) {
      $scope.saveSuccessful = false;
      $scope.saveMessage = "Error saving encounter: please select a hostile unit for this encounter.";
    }
    else if($scope.selectedEncounter.Rewards === undefined || $scope.selectedEncounter.Rewards.length == 0) {
      $scope.saveSuccessful = false;
      $scope.saveMessage = "Error saving encounter: the encounter must specify some reward.";
    }
    else {
      isValid = true;
    }

    return isValid;
  }

  function loadEncounters() {
    encountersClient.loadEncounters(null, function(encounters) {
      $scope.availableEncounters = encounters;

      // get all the hostile units, so that they are available when editing encounters
      unitsClient.loadHostiles(null, function(units) {
        $scope.availableUnits = units;
        $scope.$apply();
      });

      // per encounter, hostile unit id ---> full hostile unit data
      $scope.availableEncounters.forEach(function(encounter) {

        unitsClient.getHostileUnit(encounter.SelectedHostile, false, function (hostile) {
          encounter.SelectedHostile = hostile;
          $scope.$apply();
        });
      });

      $scope.$apply();
    });
  }

  function init() {
    loadEncounters();
  }

  init();
}]);
