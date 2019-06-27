FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY ./build/backend .

EXPOSE 2567
CMD [ "npm", "start" ]
