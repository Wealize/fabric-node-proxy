#!/bin/bash

./node_modules/.bin/babel-node syncCerts.js

if [ ! -d "hfc-key-store" ]; then
    ./node_modules/.bin/babel-node enrollAdmin.js
    ./node_modules/.bin/babel-node registerUser.js
    ./node_modules/.bin/babel-node syncCerts.js
fi
