FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY files ./

COPY . .

RUN npm run build

WORKDIR /app/dist

CMD ["node", "./main.js"]