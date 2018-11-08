#!/bin/bash

node syncCerts.js

if [ ! -d "hfc-key-store" ]; then
    node enrollAdmin.js
    node enrollUser.js
    node syncCerts.js
fi
