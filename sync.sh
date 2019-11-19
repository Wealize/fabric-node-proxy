#!/bin/bash

echo "Copy Connection Json..."
echo $CONNECTION_JSON > connection.json

echo "Create Wallet path for ${USER_USERNAME}..."
mkdir -p wallet/$USER_USERNAME
cd wallet/$USER_USERNAME

echo "Copy ${USER_USERNAME} identity..."
echo $USER_IDENTITY_JSON > $USER_USERNAME
echo $USER_PRIVATE_KEY > "${USER_SIGNIN_IDENTITY_HASH}-priv"
echo $USER_PUBLIC_KEY > "${USER_SIGNIN_IDENTITY_HASH}-pub"
