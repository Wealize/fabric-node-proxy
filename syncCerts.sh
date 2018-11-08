#!/bin/bash

node syncCerts.js

if [ ! -d "hfc-key-store" ]; then
    node enrollAdmin.js
    node registerUser.js
    node syncCerts.js
fi
