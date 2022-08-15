FROM node:16
# Create app directory
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install
COPY . .
COPY .env .env

EXPOSE 5003
CMD [ "npm", "start" ]