/**
 * Functionality for the webpage
 */

/*
  Onclick button handler for 'Run' button.
 */
function submitCommand() {

  // get text from command input element
  let command = document.getElementById("command").value;
  let output = document.getElementById("output");

  let parsedCommand = parseCommand(command);
  let commandStatus = checkIfValidCommand(parsedCommand);

  // reset the output
  output.innerHTML = 'Running command...';

  if (commandStatus.valid) {
    // if command is valid, send to the backend
      // setup callback

    if (parsedCommand.command === 'get') {
      getValue(parsedCommand.key, function(response) {
        if (response.succeeded) {
          if (response.result !== null) {
            output.innerHTML = `Retrieved the value: ${response.result}`;
          }
          else {
            output.innerHTML = `Failed to retrieve a value for the given key.`;
          }
        }
        else {
          output.innerHTML = `Failed to retrieve a value for key '${parsedCommand.key}': ${response.result}`;
        }
      });
    }

    if (parsedCommand.command === 'put') {
      putValue(parsedCommand.key, parsedCommand.value, function(response) {
        if (response.succeeded) {
          output.innerHTML = `Successfully saved the value.`;
        }
        else {
          output.innerHTML = `Failed to set the value for key '${parsedCommand.key}': ${response.result}`;
        }
      });
    }

  }
  else {
    // alert("Error: the command appears to be incorrect");
    output.innerHTML = commandStatus.reason;
  }
}


function parseCommand(_command) {
  let commandTokens = _command.split(' ');
  let command, key, value;

  // don't even try to parse the command if the number of tokens in incorrect
  if (commandTokens.length === 2 || commandTokens.length === 3) {
    command = commandTokens[0].toLowerCase();
    key = commandTokens[1];
    value = (commandTokens.length === 3) ? commandTokens[2] : null;

    return {
      command: command,
      key: key,
      value: value
    };
  }
  else {
    return null;
  }
}


function checkIfValidCommand(parsedCommand) {
  const GET = 0;
  const PUT = 1;
  let validCommands = ['get', 'put'];
  let reason = "";
  let invalid = false;

  // command would only be null (meaning it failed parsing) if it had an incorrect number of tokens
  if (parsedCommand === null) {
    invalid = true;
    reason = "command does not appear to have the correct number of tokens.";
  }

  // check for 'get' command syntax
  else if (validCommands.indexOf(parsedCommand.command) === GET) {
    // honestly, nothing to really check here
  }

  // check for 'put' command syntax
  else if (validCommands.indexOf(parsedCommand.command) === PUT) {
    // ensure there is a value
    if (parsedCommand.value === null) {
      invalid = true;
      reason = `must provide a value for the given key.`;
    }
    // ensure the value is a number
    else if (isNaN(parsedCommand.value)) {
      invalid = true;
      reason = `the provided value '${parsedCommand.value}' is not a number.`;
    }
  }

  // else, must be an invalid command altogether
  else {
    invalid = true;
    reason = `unsupported command: '${parsedCommand.command}'.`;
  }

  /* return */
  if (invalid) {
    return {
      valid: false,
      reason: reason
    };
  }
  else {
    return {
      valid: true,
      reason: null
    };
  }
}

function getValue(key, callback) {
  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {

    if (this.readyState === 4 && this.status === 200) {
      console.log(`Response from server: ${this.responseText}`);
      callback(JSON.parse(this.responseText));
    }
  };

  xhttp.open("GET", `getValue/${key}`, true);
  xhttp.send();
}

function putValue(key, value, callback) {
  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {

    if (this.readyState === 4 && this.status === 200) {
      console.log(`Response from server: ${this.responseText}`);
      callback(JSON.parse(this.responseText));
    }
  };

  xhttp.open("POST", `putValue/${key}/${value}`, true);
  xhttp.send();
}