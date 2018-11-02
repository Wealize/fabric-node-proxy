FROM node:9

RUN apt update && apt install -y python build-essential && \
    rm -rf /var/cache/apt/*

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . /usr/src/app

EXPOSE 3030

CMD [ "npm", "start" ]
