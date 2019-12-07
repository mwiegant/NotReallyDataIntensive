dndApp.controller('EncountersController', ['$scope', function ($scope) {

  const UNKNOWN = "?";
  const NULL_TASK_ID = -1;
  $scope.partyUnitsLoaded = null;

  $scope.inCombat = false;

  $scope.availableEncounters = [];
  $scope.selectedEncounter = null;

  $scope.exhaustedUnits = [];
  $scope.availableUnits = [];
  $scope.selectedUnit = null;

  let pendingLogs = [];
  let selectedHostileUnit = null;
  let selectedUnitIndex = 0;
  let selectedEncounterIndex = 0;
  let combatTaskId = NULL_TASK_ID;
  let loggerTaskId = NULL_TASK_ID;
  let justStartedCombat = false;
  let isCombatOver = false;

  $scope.nextUnit = function(increment) {
    selectedUnitIndex += increment;

    if (selectedUnitIndex < 0)
      selectedUnitIndex = $scope.availableUnits.length - 1;
    else if (selectedUnitIndex >= $scope.availableUnits.length)
      selectedUnitIndex = 0;

    $scope.selectedUnit = $scope.availableUnits[selectedUnitIndex];
  };

  $scope.nextEncounter = function(increment) {
    selectedEncounterIndex += increment;

    if (selectedEncounterIndex < 0)
      selectedEncounterIndex = $scope.availableEncounters.length - 1;
    else if (selectedEncounterIndex >= $scope.availableEncounters.length)
      selectedEncounterIndex = 0;

    $scope.selectedEncounter = $scope.availableEncounters[selectedEncounterIndex];
  };

  $scope.startCombat = function() {
    $scope.inCombat = true;

    selectedHostileUnit = $scope.selectedEncounter.SelectedHostile;

    if (combatTaskId !== NULL_TASK_ID)
      clearInterval(combatTaskId);
    if (loggerTaskId !== NULL_TASK_ID)
      clearInterval(loggerTaskId);

    // only start combat if all pending logs have already been processed
    if (pendingLogs.length === 0) {
      // immediately start combat and do the first round of combat
      justStartedCombat = true;
      doCombat($scope.selectedUnit, selectedHostileUnit);

      // for all subsequent rounds of combat, allow a delay between rounds so the player party can watch the battle
      combatTaskId = setInterval(function() {
        doCombat($scope.selectedUnit, selectedHostileUnit);
        $scope.$apply();
      }, 5000);

      // run a logging task to space out when logs are printed for the player party to see
      loggerTaskId = setInterval(function() {
        doLogging();
      }, 1500);
    }
  };

  $scope.stopCombat = function() {
    $scope.inCombat = false;

    if (combatTaskId !== NULL_TASK_ID) {
      clearInterval(combatTaskId);
      combatTaskId = NULL_TASK_ID;
    }
  };

  function stopLogging() {
    if (loggerTaskId !== NULL_TASK_ID) {
      clearInterval(loggerTaskId);
      loggerTaskId = NULL_TASK_ID;
    }
  }

  function doLogging() {
    if (pendingLogs.length > 0) {
      console.log(`[${new Date().toTimeString().split(' ')[0]}] running logger task`);

      let log = pendingLogs.shift();
      document.getElementById("fight-text").value = `${log}\n` + document.getElementById("fight-text").value;
    }
    else if (!$scope.inCombat && pendingLogs.length === 0) {
      console.log("no more logs and no longer in combat: stopping the logger task");
      stopLogging();
    }
  }

  function doCombat(selectedUnit, selectedHostile) {
    console.log(`[${new Date().toTimeString().split(' ')[0]}] doing combat`);

    if (justStartedCombat) {
      recordActivity(selectedUnit, selectedHostile,
          `Combat was initiated between ${selectedUnit.Name} and ${selectedHostile.Name}.`);
      sleep(500);
      justStartedCombat = false;
    }

    if (isCombatOver) {
      console.log(`[${new Date().toTimeString().split(' ')[0]}] combat is over`);
      $scope.stopCombat();

      // TODO - also save changes to units...
    }
    else {
      console.log(`[${new Date().toTimeString().split(' ')[0]}] doing a full round of combat`);
      doRoundOfCombat(selectedUnit, selectedHostile);
    }
  }

  function doRoundOfCombat(selectedUnit, selectedHostile) {

    if (isUnitAlive(selectedUnit)) {
      // the player party unit always attacks first
      doSingleAttack(selectedUnit, selectedHostile);

      if (isUnitAlive(selectedHostile)) {
        doSingleAttack(selectedHostile, selectedUnit);
      }
      else {
        isCombatOver = true;
      }
    }
    else {
      isCombatOver = true;
    }
  }

  function doSingleAttack(attacker, defender) {
    let attack = attacker.AUTO_ATT + attacker.MAN_ATT;
    let power = attacker.AUTO_PWR + attacker.MAN_PWR;
    let defense = defender.AUTO_DEF + defender.MAN_DEF;
    let toughness = defender.AUTO_TGH + defender.MAN_TGH;
    let morale = defender.AUTO_MOR + defender.MAN_MOR;

    // attacker's rolls
    let attackRoll = rollD20() + attack;
    let powerRoll = rollD20() + power;

    // defender's roll
    let moraleRoll = rollD20() + morale;

    // recordActivity(attacker, null, `${attacker.Name} is engaging ${defender.Name}.`);

    // to do 1 damage, the attacker's attack and power rolls must be
    // greater than or equal to the defender's defense and toughness, respectfully
    if (attackRoll >= defense && powerRoll >= toughness) {
      defender.STR -= 1;
      recordActivity(attacker, defender, `The troops of ${attacker.Name} have dealt a definite blow to ${defender.Name}.`);

      // if the defender now has less than half of its total strength, it must
      // pass a DC 15 Morale check or take an additional 1 damage
      if (defender.STR < Math.floor(defender.MAX_STR / 2)) {

        recordActivity(attacker, defender, `The forces of ${defender.Name} are falling apart!`);
        if (moraleRoll < 15) {
          defender.STR -= 1;
          recordActivity(attacker, defender, `The forces of ${defender.Name} have been weakened from some troops losing the will to fight!`);
        }
      }

    }
    else {
      recordActivity(attacker, null, `The troops of ${attacker.Name} failed to damage ${defender.Name}.`);
    }

    if (defender.STR <= 0) {
      defender.STR = 0;
      recordActivity(attacker, defender, `The forces of ${defender.Name} have been defeated by ${attacker.Name}!`);
    }
  }

  function isUnitAlive(combatUnit) {
    return combatUnit.STR > 0;
  }

  function rollD20() {
    return Math.ceil(Math.random() * 20);
  }

  // record activity on the page, and in up to 2 units (1 unit required, 2nd unit optional)
  function recordActivity(unit1, unit2, activity) {
    unit1.ActivityLog.unshift(activity);

    if (unit2 !== null)
      unit2.ActivityLog.unshift(activity);

    pendingLogs.push(activity);
  }

  // blocking sleep function
  function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));

    // let start = new Date().getTime();
    // console.log("sleeping...");
    // for (let i = 0; i < 1e7; i++) {
    //   if ((new Date().getTime() - start) > milliseconds){
    //     console.log("awake!");
    //     break;
    //   }
    // }
  }

  function init() {
    encountersClient.loadEncounters(null, function(encounters) {
      // per enabled encounter, hostile unit id ---> full hostile unit data
      encounters.forEach(function(encounter) {

        if (encounter.Status === 'Enabled') {
          $scope.availableEncounters.push(encounter);

          unitsClient.getHostileUnit(encounter.SelectedHostile, false, function (hostile) {
            encounter.SelectedHostile = hostile;
            $scope.$apply();
          });
        }
      });

      $scope.selectedEncounter = $scope.availableEncounters[selectedEncounterIndex];
      $scope.$apply();
    });

    unitsClient.loadUnits(null, function(units) {
      $scope.availableUnits = units;
      $scope.selectedUnit = $scope.availableUnits[selectedUnitIndex];
      $scope.$apply();
    });
  }

  init();
}]);
