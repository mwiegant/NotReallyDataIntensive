# About

Project for a data intensive computing class. The specification demands support 
for 2 operations:

- put <key> <value>

- get <key>

Depending on the value, the key-value pair should be stored on 1 of 2 remote nodes, 
with 1 node storing even values and the other node storing odd values.

# Running this project

On the first run, be sure to run **npm install**

On subsequent runs, run **node bin/www** or just run the run script: **./run**