FROM node:8

WORKDIR /usr/src/app

# Copy across package.json and package-lock.json and Install dependencies
COPY package*.json ./
RUN npm install

RUN npm install -g nodemon

COPY . .

EXPOSE 8080

CMD ["npm", "start"]