(function(module) {
  var Client = require('ssh2').Client;
  var fs = require('fs');
  let _export = {};

  _export.saveData = function(machineHostname, data, callback) {
    let conn = new Client();
    let output = `echo "> ${data}" >> data.txt\n`;

    conn.on('ready', function() {
      console.log('Client :: ready');

      conn.shell(function(err, stream) {
        if (err)
          return callback(err);

        stream.on('close', function() {
          console.log('Stream :: close');
          conn.end();
          callback(null);
        });

        stream.on('data', function(data) {
          // console.log('OUTPUT: ' + data);
        });

        stream.write(output);
        stream.end('exit\n');
      });

    });

    conn.on('error', function(err) {
      return callback(err);
    });

    conn.connect({
      host: machineHostname,
      port: 22,
      username: 'ec2-user',
      privateKey: fs.readFileSync('../keyfiles/cs433-keyfile-safe-to-distribute-with-project.pem')
    });
  };

  _export.getValue = function(machineHostname, key, callback) {
    let conn = new Client();
    let output = `less data.txt\n`;
    let value = null;
    let timestamp = null;
    let fileData = null;
    let line = null;

    conn.on('ready', function() {
      console.log('Client :: ready');

      conn.shell(function(err, stream) {
        if (err)
          return callback(err);

        stream.on('close', function() {
          console.log('Stream :: close');
          conn.end();
          callback(null, value, timestamp);
        });

        stream.on('data', function(data) {

          // console.log('OUTPUT: ' + data);

          // lines that are output from the file are prefaced with '>'
          // one line of data will come from the command we ran
          if (data.toString()[8]  === '>') {

            fileData = data.toString().split('\n');

            for (let i = 0; i < fileData.length - 1; i++) {
              fileData[i] = fileData[i].slice(fileData[i].indexOf('>'));
              line = fileData[i].split(' ');

              if (line[1] === key) {
                value = line[2];
                timestamp = line[3].replace('\r', '');
              }
            }

          }
        });

        stream.write(output);
        stream.write('q');
        stream.end('exit\n');
      });

    });

    conn.on('error', function(err) {
      return callback(err);
    });

    conn.connect({
      host: machineHostname,
      port: 22,
      username: 'ec2-user',
      privateKey: fs.readFileSync('../keyfiles/cs433-keyfile-safe-to-distribute-with-project.pem')
    });
  };

  module.exports = _export;

})(module);