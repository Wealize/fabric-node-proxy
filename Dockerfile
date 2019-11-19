FROM node:10

RUN apt update && apt install -y python build-essential && \
    rm -rf /var/cache/apt/*

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install
RUN yarn build
